'use strict';



//pdf.js does not support new line, we need to add line break to show tooltip correctly
//pdf add line break space ===========================================================================
document.addEventListener("webviewerloaded", function() {
  PDFViewerApplication.initializedPromise.then(function() {
    PDFViewerApplication.eventBus.on("documentloaded", function(event) { //when pdf loaded
      window.PDFViewerApplication.eventBus.on('textlayerrendered', function pagechange(evt) { //when textlayerloaded
        var lastY;
        var lastItem;
        document.querySelectorAll('.page span').forEach(function(item, index) {
          var currentY = parseFloat(item.style.top);

          if (index === 0) { //skip first index

          } else {
            var currentFontSize = parseFloat(item.style.fontSize);

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
      })
    });
  });
});


//if current url is local file and no file permission
//alert user need permmsion
function checkCurrentUrlIsLocalFileUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get('file');

  if (/^file:\/\//.test(url)) { //check current url is file url
    chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => { //check file url permmision
      if (isAllowedAccess == false) {
        alert(`
          To use this extension for local file,
          user need to turn on 'Allow access to file URLs'
          from chrome extension setting page
          `);
        chrome.tabs.update({
          url: "chrome://extensions/?id=hmigninkgibhdckiaphhmbgcghochdjc" //redirect to setting page
        });
      }
    })
  }
}
checkCurrentUrlIsLocalFileUrl();
