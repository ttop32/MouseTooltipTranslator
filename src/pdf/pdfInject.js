import delay from "delay";
import $ from "jquery";

import * as util from "/src/util";

// <link rel="stylesheet" href="../../tippy.css" />
// <script src="../../contentScript.js"></script>
// <script src="../../pdfInject.js"></script>
// <script type="module" src="../../doq/doq.js"></script>
// validateFileURL(file);

initPdf();

async function initPdf() {
  checkCurrentUrlIsLocalFileUrl(); // warn no permission if file url
  checkPdfError();
  addCustomKeystroke();
  //make line break for spaced text
  addCallbackForPdfTextLoad(addSpaceBetweenPdfText);
  await delay(1000); //wait pdf load // run again if text rendered not called
  addSpaceBetweenPdfText();
}

//if current url is local file and no file permission
//alert user need permmsion
async function checkCurrentUrlIsLocalFileUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("file");

  if (/^file:\/\//.test(url)) {
    //check current url is file url
    var isAllowedAccess = await util.hasFilePermission();

    //check file url permmision
    if (isAllowedAccess == false) {
      alert(`
    ------------------------------------------------------------------
    Mouse tooltip translator require permission for local pdf file.
    User need to turn on 'Allow access to file URLs' from setting.
    This page will be redirected to setting page after confirm.
    -------------------------------------------------------------------`);
      util.openSettingPage();
    }
  }
}

function addCallbackForPdfTextLoad(callback) {
  //when pdf loaded             //when textlayerloaded
  document.addEventListener("webviewerloaded", function () {
    PDFViewerApplication.initializedPromise.then(function () {
      PDFViewerApplication.eventBus.on("documentloaded", function (event) {
        window.PDFViewerApplication.eventBus.on(
          "textlayerrendered",
          function pagechange(evt) {
            callback();
          }
        );
      });
    });
  });
}

function checkPdfError() {
  document.addEventListener("webviewerloaded", function () {
    PDFViewerApplication.initializedPromise.then(function () {
      PDFViewerApplication.eventBus.on("documenterror", function (event) {
        console.log(event);
        util.postFrame({ type: "pdfErrorLoadDocument" });
      });
    });
  });
}

function waitUntilPdfLoad() {
  return new Promise((resolve, reject) => {
    addCallbackForPdfTextLoad(resolve);
  });
}

// change space system for tooltip
async function addSpaceBetweenPdfText() {
  var prevY;
  var prevLine;
  var newLineScale = 1.5;
  var spaceScale = 1.0;

  // remove all br
  $("br").remove();

  // add new line for split text
  //only select leaf element, not item has child
  $(".page span:not(:has(*))").each(function (index, line) {
    //skip empty line
    if (line?.textContent?.trim() == "") {
      return;
    }

    try {
      var lineY = parseFloat(line.getBoundingClientRect().top);
      var lineFontSize = parseFloat(window.getComputedStyle(line).fontSize);

      //if prev item is too far pos, add new line to prev item
      //if not too far add space
      //skip if already has space
      if (prevLine && !/[\n ]$/.test(prevLine.textContent)) {
        if (
          prevY < lineY - lineFontSize * newLineScale ||
          lineY + lineFontSize * newLineScale < prevY
        ) {
          prevLine.textContent += "\n";
        } else if (
          prevY < lineY - lineFontSize * spaceScale ||
          lineY + lineFontSize * spaceScale < prevY
        ) {
          prevLine.textContent += " ";
        }
      }
      prevY = lineY;
      prevLine = line;
    } catch (error) {
      console.log(error);
    }
  });
}

function addCustomKeystroke() {
  document.addEventListener("keydown", function onPress(evt) {
    //skip if text input running
    if (util.getFocusedWritingBox()) {
      return;
    }

    switch (evt.code) {
      case "KeyT":
        document.getElementById("editorFreeText")?.click();
        break;
      case "KeyD":
        document.getElementById("editorInk")?.click();
        break;
    }
  });
}
