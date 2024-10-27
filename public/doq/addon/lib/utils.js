function getViewerEventBus(app) {
  app = app ?? window.PDFViewerApplication;
  const task = (resolve, reject) => {
    if (!app) {
      reject("No PDF.js viewer found in the current exectution context!");
      return;
    }
    const passEventBus = () => resolve(app.eventBus);
    if (app.initializedPromise) {
      passEventBus();
    } else {
      document.addEventListener("webviewerloaded", passEventBus);
    }
  }
  return new Promise(task);
}

export { getViewerEventBus };
