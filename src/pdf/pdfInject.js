import delay from "delay";
import $ from "jquery";

initPdf();

async function initPdf() {
  checkCurrentUrlIsLocalFileUrl(); // warn no permission if file url

  //make line break for spaced text
  addCallbackForPdfTextLoad(addSpaceBetweenPdfText);
  await delay(2000); //wait pdf load
  addSpaceBetweenPdfText(); // run again if text rendered not called
}

//if current url is local file and no file permission
//alert user need permmsion
function checkCurrentUrlIsLocalFileUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("file");

  if (/^file:\/\//.test(url)) {
    //check current url is file url
    chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
      //check file url permmision
      if (isAllowedAccess == false) {
        alert(`
    ------------------------------------------------------------------
    Mouse tooltip translator require permission for local pdf file.
    User need to turn on 'Allow access to file URLs' from setting.
    This page will be redirected to setting page after confirm.
    -------------------------------------------------------------------`);
        openSettingPage(window.location.host);
      }
    });
  }
}

function openSettingPage(id) {
  chrome.tabs.create({
    url: "chrome://extensions/?id=" + id,
  });
}

function addCallbackForPdfTextLoad(callback) {
  document.addEventListener("webviewerloaded", function () {
    PDFViewerApplication.initializedPromise.then(function () {
      PDFViewerApplication.eventBus.on("documentloaded", function (event) {
        //when pdf loaded
        window.PDFViewerApplication.eventBus.on(
          "textlayerrendered",
          function pagechange(evt) {
            //when textlayerloaded
            callback();
          }
        );
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

  // remove all br
  $("br").remove();

  // add new line for split text
  //only select leaf element, not item has child
  $(".page span:not(:has(*))").each(function (index, line) {
    try {
      var lineY = parseFloat(line.getBoundingClientRect().top);
      var lineFontSize = parseFloat(window.getComputedStyle(line).fontSize);

      //if prev item is too far pos, add new line to prev item
      //if not too far add space
      //skip if already has space
      if (prevLine && !/[\n ]$/.test(prevLine.textContent)) {
        if (
          prevY < lineY - lineFontSize * 2 ||
          lineY + lineFontSize * 2 < prevY
        ) {
          prevLine.textContent += "\n";
        } else if (
          prevY < lineY - lineFontSize ||
          lineY + lineFontSize < prevY
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
