/* Initialisation */
if (document.readyState === "interactive" || document.readyState === "complete") {
  doqInit();
} else {
  document.addEventListener("DOMContentLoaded", doqInit, true);
}
async function doqInit() {
  let path = (new URL(import.meta.url)).pathname;
  path = path.substring(0, path.lastIndexOf("/") + 1);
  const colors = await fetch(path + "colors.json").then(resp => resp.json());
  linkCSS(path + "doq.css");
  fetch(path + "doq.html")
    .then(response => response.text()).then(installAddon)
    .then(() => {
      /* window.DOQReader = DOQReader; */
      DOQReader.load(colors);
    });
  function installAddon(html) {
    const docFrag = document.createRange().createContextualFragment(html);
    const toolbar = document.getElementById("toolbarViewerRight");
    toolbar.prepend(docFrag.getElementById("toolbarAddon").content);
    const findbar = document.getElementById("findbar");
    findbar.after(docFrag.getElementById("mainAddon").content);
  }
  function linkCSS(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
import {Color} from "./lib/color.js";
const newColor = (arg) => new Color(arg);

const DOQReader = {
  config: {},
  preferences: {},
  colorSchemes: [],
  readerTone: {},
  canvasData: new WeakMap(),
  styleCache: new Map(),
  options: { autoReader: true, dynamicTheme: true },
  flags: { readerOn: false, isPrinting: false },

  getDefaultPrefs() {
    return {
      scheme: 0, tone: "0",
      flags: { shapesOn: true, imagesOn: true }
    };
  },
  getDoqConfig() {
    return {
      sysTheme: window.matchMedia("(prefers-color-scheme: light)"),
      docStyle: document.documentElement.style,
      viewReader: document.getElementById("viewReader"),
      readerToolbar: document.getElementById("readerToolbar"),
      schemeSelector: document.getElementById("schemeSelect"),
      tonePicker: document.getElementById("tonePicker"),
      shapeToggle: document.getElementById("shapeEnable"),
      imageToggle: document.getElementById("imageEnable"),
      optionsToggle: document.getElementById("optionsToggle"),
      viewerClassList: document.getElementById("outerContainer").classList,
      viewer: document.getElementById("viewerContainer")
    };
  },

  load(colorSchemes) {
    this.config = this.getDoqConfig();
    colorSchemes.forEach(scheme => {
      this.config.schemeSelector.innerHTML += `<option>${scheme.name}</option>`;
      scheme.tones.forEach(tone => {
        const [b, f] = [tone.background, tone.foreground].map(newColor);
        tone.colors = {
          bg: b, fg: f, grad: b.range(f),
          acc: (tone.accents || []).map(newColor)
        };
        tone.scheme = scheme;
      });
      scheme.colors = (scheme.accents || []).map(newColor);
    });
    this.colorSchemes = colorSchemes;
    this.updateReaderState();

    /* Legacy PDF.js support */
    const pdfjsVer = pdfjsLib.version.split(".").map(Number);
    if (pdfjsVer[0] < 3) {
      if (pdfjsVer[0] < 2 || pdfjsVer[1] < 7)
        console.warn("doq: unsupported PDF.js version " + pdfjsLib.version);
      this.config.viewReader.classList.add("pdfjsLegacy");
      this.config.readerToolbar.classList.add("pdfjsLegacy");
    }

    /* Event listeners */
    this.config.sysTheme.onchange = this.updateReaderState.bind(this);
    this.config.schemeSelector.onchange = this.updateColorScheme.bind(this);
    this.config.tonePicker.onchange = this.updateReaderColors.bind(this);
    this.config.viewReader.onclick = this.toggleToolbar.bind(this);
    this.config.shapeToggle.onchange = this.config.imageToggle.onchange
                                     = this.toggleFlags.bind(this);
    this.config.optionsToggle.onchange = e => this.toggleOptions();
    this.config.schemeSelector.onclick = e => {
      this.config.readerToolbar.classList.remove("tabMode");
    };
    this.config.viewer.addEventListener("input", this.handleInput.bind(this));
    window.addEventListener("beforeprint", e => this.flags.isPrinting = true);
    window.addEventListener("afterprint", e => this.flags.isPrinting = false);
    window.addEventListener("click", this.closeToolbar.bind(this));
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("resize", this.updateToolbarPos.bind(this));
    (new MutationObserver(this.updateToolbarPos.bind(this))).observe(
      this.config.viewReader.parentElement,
      { subtree: true, attributeFilter: ["style", "class", "hidden"] }
    );
    const app = window.PDFViewerApplication;
    const registerMonitor = () => {
      app.initializedPromise.then(() => {
        app.eventBus.on("switchannotationeditorparams",
                        this.recolorSelectedAnnots.bind(this));
      });
    };
    if (app.initializedPromise)
      registerMonitor();
    else
      document.addEventListener("webviewerloaded", registerMonitor.bind(this));

    /* Wrap canvas drawing */
    const ctxp = CanvasRenderingContext2D.prototype;
    const test = this.checkFlags.bind(this);
    const cb = this.forgetCanvas.bind(this);
    ctxp.origFillRect = ctxp.fillRect;
    ["fill", "stroke"].forEach(f => {
      ["", "Rect", "Text"].forEach(e => {
        ctxp[f + e] = this.wrap(ctxp[f + e], this.setReaderStyle.bind(this),
                                test, e !== "Text" ? cb : null, f + "Style");
      });
    });
    ctxp.origDrawImage = ctxp.drawImage;
    ctxp.drawImage = this.wrap(ctxp.drawImage, this.setReaderCompOp.bind(this),
                               test, cb);
  },

  /* Method wrapper closure */
  wrap(method, callHandler, test, callback, prop) {
    return function() {
      if (!test?.())
        return method.apply(this, arguments);
      this.save();
      callHandler(this, method, arguments, prop);
      const retVal = method.apply(this, arguments);
      this.restore();
      callback?.(this);
      return retVal;
    }
  },
  checkFlags() {
    return this.flags.readerOn && !this.flags.isPrinting;
  },
  saveCanvas(ctx) {
    const cvs = ctx.canvas;
    if (cvs.isConnected && cvs.closest(".canvasWrapper")) {
      this.canvasData.set(ctx, ctx.getImageData(0, 0, cvs.width, cvs.height));
      return true;
    }
    return false;
  },
  forgetCanvas(ctx) {
    this.canvasData.delete(ctx)
  },

  /* Alter fill and stroke styles */
  setReaderStyle(ctx, method, args, prop) {
    const style = ctx[prop];
    if (typeof(style) !== "string")           /* is gradient/pattern */
      return;
    const isText = method.name.endsWith("Text");
    const isShape = !isText && !(
      method.name === "fillRect" &&
      args[2] == ctx.canvas.width &&
      args[3] == ctx.canvas.height
    );
    if (isShape && !this.flags.shapesOn)
      return;
    const bg = isText && this.getCanvasColor(ctx, ...args);
    ctx[prop] = this.getReaderStyle(style, bg);
  },
  getReaderStyle(style, bg) {
    style = newColor(style);
    const key = style.hex + (bg?.hex || "");
    let newStyle = this.styleCache.get(key);
    if (!newStyle) {
      newStyle = this.calcStyle(style, bg);
      this.styleCache.set(key, newStyle);
    }
    return newStyle.toHex(style.alpha);
  },
  getCanvasColor(ctx, text, tx, ty) {
    if (!this.canvasData.has(ctx) && !this.saveCanvas(ctx))
      return null;
    const mtr = ctx.measureText(text);
    const dx = mtr.width / 2;
    const dy = (mtr.actualBoundingBoxAscent - mtr.actualBoundingBoxDescent) / 2;
    const tfm = ctx.getTransform();
    let {x, y} = tfm.transformPoint({x: tx + dx, y: ty - dy});
    [x, y] = [x, y].map(Math.round);
    const canvasData = this.canvasData.get(ctx);
    const i = (y * canvasData.width + x) * 4;
    const rgb = Array.from(canvasData.data.slice(i, i + 3));
    return newColor(rgb.map(e => e / 255));
  },

  /* Calculate a new style for given colorscheme and tone */
  calcStyle(color, textBg) {
    const {bg, fg, grad, acc} = this.readerTone.colors;
    const diffL = clr => Math.abs(clr.lightness - textBg.lightness);
    let style;
    if (color.chroma > 10) {
      const accents = acc.concat(this.readerTone.scheme.colors);
      if (accents.length)
        style = this.findMatch(accents, e => e.deltaE(color), Math.min);
    } else if (textBg && bg.deltaE(textBg) > 2.3) {
      style = this.findMatch([bg, fg], diffL, Math.max);
    } else {
      const whiteL = Color.white.lightness;
      style = grad(1 - color.lightness / whiteL);
    }
    return style;
  },
  findMatch(array, mapFun, condFun) {
    const newArr = array.map(mapFun);
    return array[newArr.indexOf(condFun(...newArr))];
  },

  /* Return image composite operation, drawing an optional mask */
  setReaderCompOp(ctx, drawImage, args) {
    if (!this.flags.imagesOn || !ctx.canvas.isConnected)
      return;
    const tone = this.readerTone;
    if (tone.colors.bg.lightness < 50 && args.length >= 5) {
      args = [...args];
      const mask = this.createMask(tone.foreground, args.slice(0, 5));
      args.splice(0, 1, mask);
      drawImage.apply(ctx, args);
    }
    ctx.globalCompositeOperation = "multiply";
  },
  createMask(color, args) {
    const cvs = document.createElement("canvas");
    const dim = [cvs.width, cvs.height] = args.slice(3);
    const ctx = cvs.getContext("2d");
    ctx.fillStyle = color;
    ctx.origFillRect(0, 0, ...dim);
    ctx.globalCompositeOperation = "destination-in";
    ctx.origDrawImage(...args, 0, 0, ...dim);
    return cvs;
  },

  /* Preferences */
  readPreferences() {
    let prefs = this.getDefaultPrefs();
    const theme = this.getSysTheme();
    const store = JSON.parse(localStorage.getItem(`doq.preferences.${theme}`));
    for (const key in store) {
      const value = store[key];
      if (key in prefs && typeof value === typeof prefs[key])
        prefs[key] = value;
    }
    this.preferences = prefs;
    return prefs;
  },
  updatePreference(key, value) {
    let prefs = this.preferences;
    const theme = this.getSysTheme();
    if (key in prefs.flags)
      prefs.flags[key] = this.flags[key];
    else if (key in prefs && typeof value === typeof prefs[key])
      prefs[key] = value;
    localStorage.setItem(`doq.preferences.${theme}`, JSON.stringify(prefs));
  },
  getSysTheme() {
    const light = !this.options.dynamicTheme || this.config.sysTheme.matches;
    return light ? "light" : "dark";
  },

  /* Event handlers */
  updateReaderState(e) {
    this.readOptions();
    const prefs = this.readPreferences();
    Object.assign(this.flags, prefs.flags);
    this.config.imageToggle.checked = prefs.flags.imagesOn;
    this.config.shapeToggle.checked = prefs.flags.shapesOn;
    this.config.schemeSelector.selectedIndex = prefs.scheme;
    if (!e || this.options.dynamicTheme)
      this.updateColorScheme(e);
    this.updateToolbarPos();
  },
  readOptions() {
    const store = JSON.parse(localStorage.getItem("doq.options"));
    for (const key in this.options) {
      if (typeof this.options[key] === typeof store?.[key])
        this.options[key] = store[key];
    }
  },

  updateColorScheme(e) {
    const index = this.config.schemeSelector.selectedIndex;
    const scheme = this.colorSchemes[index];
    if (!scheme.tones || !scheme.tones.length)
      return;
    if (scheme.tones.length > 3)
      console.warn("doq: can show up to three tones only; ignoring the rest.");
    const picker = this.config.tonePicker;
    const toneWgt = picker.querySelector("template");
    let i = 0;
    picker.innerHTML = toneWgt.outerHTML;
    picker.appendChild(this.cloneWidget(toneWgt, "origTone", "Original", i++));
    scheme.tones.slice(0, 3).forEach(tone => {
      picker.appendChild(this.cloneWidget(toneWgt, null, null, i++, tone));
    });
    picker.appendChild(this.cloneWidget(toneWgt, "invertTone", "Invert", i));
    picker.lastElementChild.classList.add("invert");
    if (index !== this.preferences.scheme) {
      this.updatePreference("scheme", index);
      this.updatePreference("tone", "1");
    }
    const prefTone = (e || this.options.autoReader) ? this.preferences.tone : 0;
    picker.elements[prefTone].checked = true;
    this.updateReaderColors(e);
  },
  cloneWidget(template, id, title, value, tone) {
    const widget = template.content.cloneNode(true);
    const [input, label] = widget.children;
    title = title || tone?.name;
    input.value = value;
    input.id = label.htmlFor = id || "tone" + title;
    input.setAttribute("aria-label", title);
    label.title = title;
    label.style.color = tone?.foreground;
    label.style.backgroundColor = tone?.background;
    return widget;
  },

  updateReaderColors(e) {
    const picker = this.config.tonePicker;
    const pick = picker.readerTone.value;
    const sel = this.config.schemeSelector.selectedIndex;
    const redraw = e?.isTrusted;
    if (pick == 0) {
      this.disableReader(redraw);
      this.disableInvert();
    } else if (pick == picker.elements.length - 1) {
      this.enableInvert(redraw);
    } else {
      this.readerTone = this.colorSchemes[sel].tones[+pick - 1];
      this.config.docStyle.setProperty("--reader-bg", this.readerTone.background);
      this.disableInvert();
      this.enableReader(redraw);
    }
    this.updatePreference("tone", pick);
  },
  forceRedraw() {
    const {pdfViewer, pdfThumbnailViewer} = window.PDFViewerApplication;
    const annotations = pdfViewer.pdfDocument?.annotationStorage.getAll();
    const redrawAnnotation = annot => {
      if (annot.name === "freeTextEditor")
        this.recolorFreeTextAnnot(annot.editorDiv);
      else
        annot.rebuild();
    };
    this.styleCache.clear();
    this.canvasData = new WeakMap();
    Object.values(annotations || {}).forEach(redrawAnnotation);
    pdfViewer._pages.filter(e => e.renderingState).forEach(e => e.reset());
    pdfThumbnailViewer._thumbnails.filter(e => e.renderingState)
                                  .forEach(e => e.reset());
    window.PDFViewerApplication.forceRendering();
  },

  enableReader(redraw) {
    this.config.viewerClassList.add("reader");
    this.flags.readerOn = true;
    if (redraw)
      this.forceRedraw();
  },
  disableReader(redraw) {
    if (!this.flags.readerOn)
      return;
    this.config.viewerClassList.remove("reader");
    this.flags.readerOn = false;
    if (redraw)
      this.forceRedraw();
  },
  enableInvert(redraw) {
    if (this.flags.readerOn)
      this.disableReader(redraw);
    this.config.viewerClassList.add("invert");
  },
  disableInvert() {
    this.config.viewerClassList.remove("invert");
  },

  recolorSelectedAnnots(e) {
    if (!this.checkFlags())
      return;
    if (e.type === pdfjsLib.AnnotationEditorParamsType.FREETEXT_COLOR)
      document.querySelectorAll(".freeTextEditor.selectedEditor > .internal")
              .forEach(e => this.recolorFreeTextAnnot(e));
  },
  recolorFreeTextAnnot(editor) {
    const newColor = this.getReaderStyle(editor.style.color);
    if (editor.style.getPropertyValue("--free-text-color") !== newColor)
      editor.style.setProperty("--free-text-color", newColor);
  },

  toggleToolbar() {
    const hidden = this.config.readerToolbar.classList.toggle("hidden");
    this.config.viewReader.classList.toggle("toggled");
    this.config.viewReader.setAttribute("aria-expanded", !hidden);
    if (hidden)
      this.toggleOptions(/*collapse = */true);
  },
  toggleOptions(collapse) {
    const panel = this.config.readerToolbar.querySelector(".optionsPanel");
    const collapsed = panel.classList.toggle("collapsed", collapse);
    this.config.optionsToggle.checked = !collapsed;
  },
  toggleFlags(e) {
    const flag = e.target.id.replace("Enable", "sOn");
    this.flags[flag] = e.target.checked;
    this.updatePreference(flag);
    if (this.flags.readerOn)
      this.forceRedraw();
  },

  handleInput(e) {
    if (!this.checkFlags())
      return;
    const {target} = e;
    const isFreeText = target.matches?.(".freeTextEditor > .internal");
    if (isFreeText && !target.style.getPropertyValue("--free-text-color"))
      this.recolorFreeTextAnnot(target);
  },
  handleKeyDown(e) {
    if (e.code === "Tab") {
      this.config.readerToolbar.classList.add("tabMode");
    } else if (e.code === "Escape") {
      this.closeToolbar();
      e.target.blur();
      e.preventDefault();
    }
  },
  closeToolbar(e) {
    const toolbar = this.config.readerToolbar;
    if (toolbar.contains(e?.target) || e?.target === this.config.viewReader)
      return;
    if (!toolbar.classList.contains("hidden"))
      this.toggleToolbar();
  },
  updateToolbarPos() {
    const docWidth = document.documentElement.clientWidth;
    const btnRight = this.config.viewReader.getBoundingClientRect().right;
    const offset = docWidth - Math.ceil(window.pageXOffset + btnRight);
    this.config.readerToolbar.style.right = `${offset + 2}px`;
  }
}
