import delay from "delay";

initPdf();

async function initPdf() {
  checkCurrentUrlIsLocalFileUrl(); // warn no permission if file url
  await Promise.all([waitUntilPdfLoad(), delay(2000)]); //wait pdf load or 2 sec
  addSpaceBetweenPdfText(); //make line break for spaced text
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
function addSpaceBetweenPdfText() {
  // remove all br
  document.querySelectorAll("br").forEach(function (item, index) {
    item.remove();
  });

  // add manual new line
  var lastY;
  var lastItem;
  document
    .querySelectorAll(".page span[role='presentation']")
    .forEach(function (item, index) {
      var currentY = parseFloat(item.getBoundingClientRect().top);
      var currentFontSize = parseFloat(window.getComputedStyle(item).fontSize);

      // if between element size is big enough, add new line
      // else add space
      if (index === 0) {
        //skip first index
      } else {
        if (
          lastY < currentY - currentFontSize * 2 ||
          currentY + currentFontSize * 2 < lastY
        ) {
          //if y diff double, give end line
          if (!/\n $/.test(lastItem.textContent)) {
            //if no end line, give end line
            lastItem.textContent = lastItem.textContent + "\n ";
          }
        } else if (
          lastY < currentY - currentFontSize ||
          currentY + currentFontSize < lastY
        ) {
          // if y diff, give end space
          if (!/ $/.test(lastItem.textContent)) {
            //if no end space, give end space
            lastItem.textContent = lastItem.textContent + " ";
          }
        }
      }
      lastY = currentY;
      lastItem = item;
    });
}
