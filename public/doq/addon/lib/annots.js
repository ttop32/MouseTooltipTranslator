
import { checkFlags, getCanvasStyle } from "./engine.js";
import { getViewerEventBus } from "./utils.js";

function monitorAnnotationParams() {
  getViewerEventBus().then(eventBus => {
    eventBus.on("annotationeditorlayerrendered", redrawHighlights);
    eventBus.on("switchannotationeditorparams", recolorSelectedAnnots);
  })
}
const monitorHighlights = new MutationObserver((records, _) => {
  records.forEach(recolorNewHighlights);
});

function redrawAnnotation(annot) {
  if (annot.name === "highlightEditor") {
    /* pass; highlights are rendered as SVGs _inside_ the canvasWrapper,
    so they are better handled _after_ the page is rendered (see below). */
  } else if (annot.name === "freeTextEditor") {
    recolorFreeTextAnnot(annot.editorDiv);
  } else {
    if (annot.name === "stampEditor") {
      annot.div.querySelector("canvas")?.remove();
    }
    annot.rebuild();
  }
}

function redrawHighlights(e) {
  if (!checkFlags()) {
    return;
  }
  const canvasWrapper = e.source.div.querySelector(".canvasWrapper");
  canvasWrapper.querySelectorAll("svg.highlight").forEach(recolorHighlight);
  monitorHighlights.observe(canvasWrapper, { childList: true });
}

function handleInput(e) {
  if (!checkFlags()) {
    return;
  }
  const { target } = e;
  const isFreeText = target.matches?.(".freeTextEditor > .internal");

  if (isFreeText && !target.style.getPropertyValue("--free-text-color")) {
    recolorFreeTextAnnot(target);
  }
}

function recolorSelectedAnnots(e) {
  if (!checkFlags()) {
    return;
  }
  if (e.type === pdfjsLib.AnnotationEditorParamsType.FREETEXT_COLOR) {
    document.querySelectorAll(".freeTextEditor.selectedEditor > .internal")
            .forEach(recolorFreeTextAnnot);
  }
}

function recolorFreeTextAnnot(editor) {
  const newColor = getCanvasStyle(editor.style.color);

  if (editor.style.getPropertyValue("--free-text-color") !== newColor) {
    editor.style.setProperty("--free-text-color", newColor);
  }
}

function recolorNewHighlights(mutationRecord) {
  const { target } = mutationRecord;
  const recolor = node => {
    if (node.matches("svg.highlight")) {
      recolorHighlight(node);
    }
  };
  recolor(target);
  mutationRecord.addedNodes.forEach(recolor);
}

function recolorHighlight(annot) {
  const newColor = getCanvasStyle(annot.getAttribute("fill"));
  const alreadyObserved = annot.style.fill !== "";
  annot.style.setProperty("fill", newColor);
  if (!alreadyObserved) {
    monitorHighlights.observe(annot, { attributeFilter: ["fill"] });
  }
}

export { monitorAnnotationParams, redrawAnnotation, handleInput };
