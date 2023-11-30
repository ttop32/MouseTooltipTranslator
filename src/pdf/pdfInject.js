import isUrl from "is-url";

async function initPdf() {
  checkUrlIsDecoded(); // redirect  url with file url encoded if not encoded
  checkCurrentUrlIsLocalFileUrl(); // warn no permission if file url
  addCallbackForPdfTextLoad(addSpaceBetweenPdfText); //make line break for spaced text
  await waitUntilPdfLoad();
  checkUrlIsEncoded(); //change encoded url to decoded for copy url
}
initPdf();

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

function checkUrlIsEncoded() {
  var fileParam = getFileParam();

  //change to decoded url for ease of url copy
  if (!isUrl(fileParam)) {
    changeUrlFileParam(decodeURIComponent(fileParam));
  }
}

function checkUrlIsDecoded() {
  var fileParam = getFileParam();
  var baseUrl = getBaseUrl();
  //url is decoded, redirect with encoded url to read correctly in pdf viewer
  if (isUrl(fileParam)) {
    redirect(baseUrl + "?file=" + encodeURIComponent(fileParam));
  }
}

function getFileParam() {
  return window.location.search.slice(6); //slice "?page="
}
function getBaseUrl() {
  return window.location.origin + window.location.pathname;
}

function redirect(url) {
  window.location.replace(url);
}
function changeUrlFileParam(fileParam) {
  history.replaceState("", "", "/pdfjs/web/viewer.html?file=" + fileParam);
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
