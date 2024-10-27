
import * as doqAPI from "./lib/api.js";
import { addColorScheme } from "./lib/engine.js";
import { monitorAnnotationParams, handleInput } from "./lib/annots.js";

import { DOQ, initConfig } from "./app/config.js";
import { migratePrefs } from "./app/prefs.js";
import { updateReaderState, updateColorScheme } from "./app/theme.js";
import { initReader, updateReaderColors, toggleFlags } from "./app/reader.js";
import updateToolbarPos, * as Toolbar from "./app/toolbar.js";

/* Initialisation */
if (typeof window !== "undefined" && globalThis === window) {
  if (window.PDFViewerApplication) {
    const { readyState } = document;

    if (readyState === "interactive" || readyState === "complete") {
      installAddon();
    } else {
      document.addEventListener("DOMContentLoaded", installAddon, true);
    }
  }
  window.DOQ = doqAPI;
} else {
  console.error("doq: this script should be run in a browser environment");
}

async function installAddon() {
  const getURL = path => new URL(path, import.meta.url);
  const colors = await fetch(getURL("lib/colors.json")).then(resp => resp.json());
  linkCSS(getURL("doq.css"));
  fetch(getURL("doq.html"))
    .then(response => response.text()).then(installUI)
    .then(() => load(colors));
}

function linkCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function installUI(html) {
  const docFrag = document.createRange().createContextualFragment(html);
  const toolbar = document.getElementById("toolbarViewerRight");
  toolbar.prepend(docFrag.getElementById("toolbarAddon").content);
  const findbar = document.getElementById("findbar");
  findbar.after(docFrag.getElementById("mainAddon").content);
}

function load(colorSchemes) {
  colorSchemes.forEach(addColorScheme);
  initReader();
  initConfig();
  migratePrefs();       /* TEMPORARY */
  updateReaderState();
  updateToolbarPos();
  bindEvents();
}

/* Event listeners */
function bindEvents() {
  const { config, flags } = DOQ;
  config.sysTheme.onchange = updateReaderState;
  config.schemeSelector.onchange = updateColorScheme;
  config.tonePicker.onchange = updateReaderColors;
  config.shapeToggle.onchange = config.imageToggle.onchange = toggleFlags;
  monitorAnnotationParams();

  config.viewReader.onclick = Toolbar.toggleToolbar;
  config.optionsToggle.onchange = e => Toolbar.toggleOptions();
  config.schemeSelector.onclick = e => {
    config.readerToolbar.classList.remove("tabMode");
  };
  config.viewer.addEventListener("input", handleInput);

  window.addEventListener("beforeprint", e => flags.isPrinting = true);
  window.addEventListener("afterprint", e => flags.isPrinting = false);
  window.addEventListener("click", Toolbar.closeToolbar);
  window.addEventListener("keydown", Toolbar.handleKeyDown);
  window.addEventListener("resize", updateToolbarPos);

  new MutationObserver(updateToolbarPos).observe(
    config.viewReader.parentElement,
    { subtree: true, attributeFilter: ["style", "class", "hidden"] }
  );
}
