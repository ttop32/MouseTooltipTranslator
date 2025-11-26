import delay from "delay";
import $ from "jquery";

import * as util from "/src/util";
import * as dom_util from "/src/util/dom";

// <link rel="stylesheet" href="../../tippy.css" />
// <script src="../../contentScript.js"></script>
// <script src="../../pdfInject.js"></script>
// <script type="module" src="../../doq/doq.js"></script>
// validateFileURL(file);
var isPdfSpaceInserted= false;
var waitCount=[1000,5000,10000,15000,20000,30000,60000]; //ms

initPdf();

async function initPdf() {
  checkPdfError();
  await dom_util.waitJquery(); //wait jquery load
  checkLocalFileUrl(); // warn no permission if file url
  checkLocalFileType();
  addCustomKeystroke();

  //make line break for spaced text
  addCallbackForPdfTextLoad(addSpaceBetweenPdfText);
  for (const wait of waitCount) {
    await delay(wait);
    addSpaceBetweenPdfText();
  }
  // initButton();
}

//if current url is local file and no file permission
//alert user need permmsion
async function checkLocalFileUrl() {
  const url = getFileParam();

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
function getFileParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const fileParam = urlParams.get("file");
  return fileParam;
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

  if(isPdfSpaceInserted){
    console.log("PDF space already inserted");
    return;
  }else{
    console.log("Inserting PDF space");
  }

  // remove all br
  var brCount = $("br").length;
  if (brCount == 0) {
    console.log("No removing <br> elements");
    return;
  }
  console.log("Removed " + brCount + " <br> elements");
  isPdfSpaceInserted = true;
  $("br").remove();
  
  insertLineBreak();
}

function insertLineBreak(){
  var prevY;
  var prevLine;
  var newLineScale = 1.3;  // if line gap more than 1.3 times font size, add new line
  var spaceScale = 1.0;  // if line gap more than 1.0 times font size, add space

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
    if (dom_util.getFocusedWritingBox()) {
      return;
    }
    if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
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

//working on ====================================================================

function checkLocalFileType() {
  var url = getFileParam();
  if (isFileUrl(url) && !isPdfFileName(url)) {
    redirect("/pdfjs/web/viewer.html?file=");
  }
}

function isFileUrl(url) {
  return /^file:\/\/(.*?)/.test(url.toLowerCase());
}
function isPdfFileName(url) {
  return /(.*?)\.pdf$/.test(url.toLowerCase());
}

// var isIframe = util.inIframe();
// host and file same
// no same host
// check iframe
//dynamic url
//check file end with pdf

function changeUrlParam() {
  var baseUrl = window.location.origin + window.location.pathname;
  var fileParam = window.location.search.slice(6); //slice "?page="

  //url is decoded, redirect with encoded url to read correctly in pdf viewer
  if (decodeURIComponent(fileParam) == fileParam) {
    redirect(baseUrl);
  }

  //change to decoded url for ease of url copy
  // changeUrlWithoutRedirect(decodeURIComponent(fileParam));
}

function redirect(url) {
  window.location.replace(url);
}
function changeUrlWithoutRedirect(fileParam) {
  history.replaceState("", "", "/pdfjs/web/viewer.html?file=" + fileParam);
}

function initButton() {
  var dd = `
  <button id="viewReader" class="toolbarButton" title="Reader Mode options" aria-expanded="false" aria-controls="readerToolbar" tabindex="29">
    <span>Reader Mode</span>
  </button>
  `;

  var button = $("<button />", {
    id: "toolbarAddon",
    class: "toolbarButton",
    title: "Reader Mode options1",
    on: {
      click: function () {
        // alert("ssss");

        DownloadFromUrl(location.href, "pdf");
      },
    },
  });

  $("#toolbarViewerRight").prepend(button);

  PDFViewerApplication.pdfDocument.getData;
  // this._ensureDownloadComplete();
  // const data = await this.pdfDocument.getData();
  // const blob = new Blob([data], {
  //   type: "application/pdf"
  // });
  // await this.downloadManager.download(blob, url, filename, options);
}

async function DownloadFromUrl(url, mime, fileName) {
  fileName = "Mouse_Tooltip_Translator_History.pdf";

  var data = await PDFViewerApplication.pdfDocument.getData();
  var blob = new Blob([data], {
    type: "application/pdf",
  });
  var file = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = file;
  link.download = fileName;
  link.click();

  // await this.downloadManager.download(blob, url, fileName, options);

  // var url = window.location.href;
  // var blob = await fetch(url).then((r) => r.blob());
  // var url = URL.createObjectURL(blob);
}
