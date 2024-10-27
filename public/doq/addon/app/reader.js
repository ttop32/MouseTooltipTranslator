
import { DOQ } from "./config.js";
import { updatePreference, readOptions } from "./prefs.js";
import { wrapCanvas, setCanvasTheme } from "../lib/engine.js";
import { redrawAnnotation } from "../lib/annots.js";

function initReader() {
  const options = readOptions();
  const ctxp = CanvasRenderingContext2D.prototype;
  wrapCanvas(options.softwareRender);
  const wrappedDrawImage = ctxp.drawImage;

  ctxp.drawImage = function() {
    if (this.canvas.closest(".page")) {
      wrappedDrawImage.apply(this, arguments);
    } else {
      ctxp.origDrawImage.apply(this, arguments);
    }
  }
  DOQ.initialized = true;
}

function updateReaderColors(e) {
  const { config } = DOQ;
  const picker = config.tonePicker;
  const pick = picker.readerTone.value;
  const sel = config.schemeSelector.selectedIndex;
  const redraw = e?.isTrusted;

  if (pick == 0) {
    disableReader(redraw);
    disableFilter();
  } else if (pick == picker.elements.length - 1) {
    enableFilter(redraw);
  } else {
    const readerTone = setCanvasTheme(sel, +pick - 1);
    const isDarkTone = readerTone.colors.bg.lightness < 50;
    config.docStyle.setProperty("--reader-bg", readerTone.background);
    disableFilter();
    enableReader(redraw, isDarkTone);
  }
  updatePreference("tone", pick);
}

function enableReader(redraw, isDarkTheme) {
  const { viewerClassList } = DOQ.config;
  viewerClassList.add("reader");
  viewerClassList.toggle("dark", isDarkTheme);
  DOQ.flags.engineOn = true;
  if (redraw) {
    forceRedraw();
  }
}

function disableReader(redraw) {
  const { config, flags } = DOQ;
  if (!flags.engineOn) {
    return;
  }
  config.viewerClassList.remove("reader", "dark");
  flags.engineOn = false;
  if (redraw) {
    forceRedraw();
  }
}

function enableFilter(redraw) {
  if (DOQ.flags.engineOn) {
    disableReader(redraw);
  }
  DOQ.config.viewerClassList.add("filter");
}

function disableFilter() {
  DOQ.config.viewerClassList.remove("filter");
}

function toggleFlags(e) {
  const { flags } = DOQ;
  const flag = e.target.id.replace("Enable", "sOn");

  flags[flag] = e.target.checked;
  updatePreference(flag);
  if (flags.engineOn) {
    forceRedraw();
  }
}

function forceRedraw() {
  const { pdfViewer, pdfThumbnailViewer } = window.PDFViewerApplication;
  const annotations = pdfViewer.pdfDocument?.annotationStorage.getAll();

  Object.values(annotations || {}).forEach(redrawAnnotation);
  pdfViewer._pages.filter(e => e.renderingState).forEach(e => e.reset());
  pdfThumbnailViewer._thumbnails.filter(e => e.renderingState)
                                .forEach(e => e.reset());
  window.PDFViewerApplication.forceRendering();
}

export { initReader, updateReaderColors, toggleFlags };
