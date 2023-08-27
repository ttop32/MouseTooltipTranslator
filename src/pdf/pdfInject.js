'use strict';




async function initPdf() {
  checkCurrentUrlIsLocalFileUrl();
  addCallbackForPdfTextLoad(addSpaceBetweenPdfText);  
  await waitUntilPdfLoad();
  changeUrlParam();
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
    document.addEventListener("webviewerloaded", function() {
      PDFViewerApplication.initializedPromise.then(function() {
        PDFViewerApplication.eventBus.on("documentloaded", function(event) { //when pdf loaded
          window.PDFViewerApplication.eventBus.on('textlayerrendered', function pagechange(evt) { //when textlayerloaded
            callback();
          })
        });
      });
    }); 
}

function waitUntilPdfLoad(){
  return new Promise((resolve, reject) => {
    addCallbackForPdfTextLoad(resolve);
  });
}

function changeUrlParam() {
  var baseUrl=window.location.origin+window.location.pathname
  var fileParam=window.location.search.slice(6)  //slice "?page="

  //url is decoded, redirect with encoded url to read correctly in pdf viewer
  if(decodeURIComponent(fileParam)==fileParam){
    redirect(baseUrl+"?file="+encodeURIComponent(fileParam))
  }

  //change to decoded url for ease of url copy
  changeUrlWithoutRedirect(decodeURIComponent(fileParam));
}

function redirect(url){
  window.location.replace(url);
}
function changeUrlWithoutRedirect(fileParam){
  history.replaceState("", "", "/pdfjs/web/viewer.html?file="+fileParam);
}



// change space system for tooltip
function addSpaceBetweenPdfText(){

  // remove all br
  document.querySelectorAll('br').forEach(function(item, index) {
    item.remove();
  })

  // add manual new line
  var lastY;
  var lastItem;
  document.querySelectorAll(".page span[role='presentation']").forEach(function(item, index) {
    var currentY = parseFloat(item.getBoundingClientRect().top);
    var currentFontSize = parseFloat(window.getComputedStyle(item).fontSize);

    // if between element size is big enough, add new line 
    // else add space
    if (index === 0) { //skip first index

    } else {
      if (lastY < currentY - currentFontSize * 2 || currentY + currentFontSize * 2 < lastY) { //if y diff double, give end line
        if (!(/\n $/.test(lastItem.textContent))) { //if no end line, give end line
          lastItem.textContent = lastItem.textContent + "\n ";
        }
      } else if (lastY < currentY - currentFontSize || currentY + currentFontSize < lastY) { // if y diff, give end space
        if (!(/ $/.test(lastItem.textContent))) { //if no end space, give end space
          lastItem.textContent = lastItem.textContent + " ";
        }
      }
    }
    lastY = currentY
    lastItem = item;
  })
}