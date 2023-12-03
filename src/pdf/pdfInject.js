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
  var lastY;
  var lastItem;

  // remove all br
  $("br").remove();

  // add new line for split text
  $(".page span").each(function (index, item) {
    try {
      var currentY = parseFloat(item.getBoundingClientRect().top);
      var currentFontSize = parseFloat(window.getComputedStyle(item).fontSize);

      //if prev item is too far pos, add new line to prev item
      //if not too far add space
      //skip if already has space
      if (index != 0 && !/ $/.test(lastItem.textContent)) {
        if (
          lastY < currentY - currentFontSize * 2 ||
          currentY + currentFontSize * 2 < lastY
        ) {
          lastItem.textContent = lastItem.textContent + "\n ";
        } else if (
          lastY < currentY - currentFontSize ||
          currentY + currentFontSize < lastY
        ) {
          lastItem.textContent = lastItem.textContent + " ";
        }
      }
      lastY = currentY;
      lastItem = item;
    } catch (error) {
      console.log(error);
    }
  });
}
