//ocr process, listen image from contents js and respond text
//1. read image
//2. crop image to only get text position, using  bucket tool(floodfill) method to mask out
//3. use tesseract to process ocr to image to get text

window.addEventListener("message", function(request) {
  if (request.data.type === 'ocr') {
    doOcr(request.data)
  }
}, false);


// ocr ===========================================================
var ocrSchedulerList = {};
var recentMainUrl = "";
var recentText = "";
var recentLang = "";
var recentImage = document.createElement("canvas");
var recentCanvasCropped = document.createElement("canvas");

async function doOcr(request) {
  try {
    if (request.mainUrl != recentMainUrl) { // load image if mainurl diff
      recentMainUrl = request.mainUrl;
      recentImage = await loadImage(request.mainUrl);
    } else if (request.base64Url != "") { //if same url and base64 received, use base64
      recentImage = await loadImage(request.base64Url);
    }

    var croppedImage = await cropText(recentImage, request.px, request.py); //crop image using opencv to only get mouse pointed area
    // document.body.appendChild(croppedImage);

    //if same as previouse image and same lang, skip ocr
    if (isMatch(croppedImage, recentCanvasCropped) && recentLang == request.lang) {
      var currentText = recentText;
    } else {
      var currentText = await useTesseract(croppedImage, request.lang);
      recentCanvasCropped = croppedImage;
      recentText = currentText;
      recentLang = request.lang;
    }
    window.parent.postMessage({
      "type": "success",
      "text": currentText,
      "mainUrl": request.mainUrl,
      "base64Url": request.base64Url,
      "time": request.time,
      "px": request.px,
      "py": request.py,
    }, '*');
  } catch (err) {
    window.parent.postMessage({
      "type": "fail",
      "text": "",
      "mainUrl": request.mainUrl,
      "base64Url": request.base64Url,
      "time": request.time,
      "px": request.px,
      "py": request.py,
    }, '*');
  }
}



function loadImage(url) {
  return new Promise((resolve, reject) => {
    var image = new Image(); //image get
    image.onload = () => {
      var canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      resolve(canvas)
    };
    // image.onerror = reject;
    image.onerror = reject;

    image.src = url;
  });
}


//use paint bucket brush method to
//fill mouse positioned bubble background
//and get that masked area
function cropText(img, x, y) {
  return new Promise(function(resolve, reject) {

    //make transparent boarder canvas
    var maskBubble = document.createElement("canvas");
    var maskBubbleCtx = maskBubble.getContext('2d');
    maskBubble.width = img.width + 2;
    maskBubble.height = img.height + 2;


    //bubble with hole
    const col = {
      r: 0xff,
      g: 0xff,
      b: 0x0,
      a: 0xff
    }
    var [image, mask] = floodFill(img, col, x, y);
    // img.getContext('2d').putImageData(image, 0, 0)  //paint color using floodfill output

    //flood fill transparent boarder to get outside
    maskBubbleCtx.putImageData(mask, 1, 1)
    var [image, mask] = floodFill(maskBubble, col, 0, 0);
    maskBubbleCtx.putImageData(mask, 0, 0)
    // get bubble inside
    maskBubbleCtx.globalCompositeOperation = 'source-out';
    maskBubbleCtx.drawImage(img, 1, 1);
    //bubble trim, crop transparent edge
    var maskBubbleTrim = trimCanvas(maskBubble);

    //resize image to fit 350px
    //too small image need to be larger to recognize correctly
    //too large image's ocr speed is slow
    var maxSize = 350;
    var rowsNew = maskBubbleTrim.width;
    var colsNew = maskBubbleTrim.height;
    colsNew = colsNew * maxSize / rowsNew;
    rowsNew = maxSize;
    if (maxSize < colsNew) {
      rowsNew = rowsNew * maxSize / colsNew;
      colsNew = maxSize;
    }
    var resizeCanvas = document.createElement("canvas");
    resizeCanvas.width = parseInt(rowsNew);
    resizeCanvas.height = parseInt(colsNew);
    resizeCanvas.getContext('2d').drawImage(maskBubbleTrim, 0, 0, maskBubbleTrim.width, maskBubbleTrim.height, 0, 0, resizeCanvas.width, resizeCanvas.height);



    resolve(resizeCanvas);
  });
}

function isMatch(data1, data2) { //compare canvas
  if (data1.width != data2.width || data1.height != data2.height) { //check length
    return false
  }
  for (var i = 0; i < data1.length; i++) { //check value
    if (data1[i] != data2[i]) return false;
  }
  return true;
}


//create ocr worker and processs ocr
function useTesseract(image, lang) {
  return new Promise(async function(resolve, reject) {
    if (ocrSchedulerList[lang] == null) {
      ocrSchedulerList[lang] = Tesseract.createScheduler();
    }

    if (ocrSchedulerList[lang].getNumWorkers() < 2) { //if no worker, create worker
      if (lang == "jpn_vert") {
        var worker1 = Tesseract.createWorker({
          'workerBlobURL': false,
          "workerPath": chrome.runtime.getURL("/tesseract/worker.min.js"),
          "corePath": chrome.runtime.getURL("/tesseract/tesseract-core.asm.js"),
          "langPath": chrome.runtime.getURL("/traindata"), //https://github.com/zodiac3539/jpn_vert
          "gzip": false
        });
      } else {
        var worker1 = Tesseract.createWorker({
          'workerBlobURL': false,
          "workerPath": chrome.runtime.getURL("/tesseract/worker.min.js"),
          "corePath": chrome.runtime.getURL("/tesseract/tesseract-core.asm.js"),
          "langPath": "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_fast" //3.02,4.0.0_fast,4.0.0, 4.0.0_best //https://github.com/naptha/tessdata
        });
      }

      await worker1.load();
      await worker1.loadLanguage(lang);
      await worker1.initialize(lang);
      await worker1.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO_ONLY,
        tessjs_create_hocr: "0",
        tessjs_create_tsv: "0"
      });
      ocrSchedulerList[lang].addWorker(worker1);
    }
    var {
      data: {
        text
      }
    } = await ocrSchedulerList[lang].addJob('recognize', image); //do ocr

    text = text.replace(/[`・〉«¢~「」〃ゝゞヽヾ●▲♩ヽ÷①↓®▽■◆『£〆∴∞▼™↑←~@#$%^&*()_|+\-=;:'"<>\{\}\[\]\\\/]/gi, ''); //remove speical char


    // var end = Math.floor(Date.now() / 1000);
    // console.log("time taken" + (end - start));
    resolve(text);
  });
}




function floodFill(canvas, newColor, x, y) {
  // https://codepen.io/Geeyoam/pen/vLGZzG
  var relaxColor = 5;
  const ctx = canvas.getContext('2d')
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var maskBubble = document.createElement("canvas");
  var maskBubbleCtx = maskBubble.getContext('2d');
  var maskData = maskBubbleCtx.getImageData(0, 0, canvas.width, canvas.height);

  const {
    width,
    height,
    data
  } = imageData
  const stack = []
  const baseColor = getColorAtPixel(imageData, x, y)
  let operator = {
    x,
    y
  }

  // // Check if base color and new color are the same
  // if (colorMatch(baseColor, newColor)) {
  //   return
  // }

  // Add the clicked location to stack
  stack.push({
    x: operator.x,
    y: operator.y
  })

  while (stack.length) {
    operator = stack.pop()
    let contiguousDown = true // Vertical is assumed to be true
    let contiguousUp = true // Vertical is assumed to be true
    let contiguousLeft = false
    let contiguousRight = false

    // Move to top most contiguousDown pixel
    while (contiguousUp && operator.y >= 0) {
      operator.y--
      contiguousUp = colorMatch(getColorAtPixel(imageData, operator.x, operator.y), baseColor, relaxColor)
    }

    // Move downward
    while (contiguousDown && operator.y < height) {
      setColorAtPixel(imageData, newColor, operator.x, operator.y)
      setColorAtPixel(maskData, newColor, operator.x, operator.y)


      // Check left
      if (operator.x - 1 >= 0 && colorMatch(getColorAtPixel(imageData, operator.x - 1, operator.y), baseColor, relaxColor)) {
        if (!contiguousLeft) {
          contiguousLeft = true
          stack.push({
            x: operator.x - 1,
            y: operator.y
          })
        }
      } else {
        contiguousLeft = false
      }

      // Check right
      if (operator.x + 1 < width && colorMatch(getColorAtPixel(imageData, operator.x + 1, operator.y), baseColor, relaxColor)) {
        if (!contiguousRight) {
          stack.push({
            x: operator.x + 1,
            y: operator.y
          })
          contiguousRight = true
        }
      } else {
        contiguousRight = false
      }

      operator.y++
      contiguousDown = colorMatch(getColorAtPixel(imageData, operator.x, operator.y), baseColor, relaxColor)
    }
  }

  return [imageData, maskData];
}



function getColorAtPixel(imageData, x, y) {
  const {
    width,
    data
  } = imageData

  return {
    r: data[4 * (width * y + x) + 0],
    g: data[4 * (width * y + x) + 1],
    b: data[4 * (width * y + x) + 2],
    a: data[4 * (width * y + x) + 3]
  }
}

function setColorAtPixel(imageData, color, x, y) {
  const {
    width,
    data
  } = imageData

  data[4 * (width * y + x) + 0] = color.r & 0xff
  data[4 * (width * y + x) + 1] = color.g & 0xff
  data[4 * (width * y + x) + 2] = color.b & 0xff
  data[4 * (width * y + x) + 3] = color.a & 0xff
}

function colorMatch(a, b, relaxColor) {
  return b.r - relaxColor <= a.r && a.r <= b.r + relaxColor &&
    b.g - relaxColor <= a.g && a.g <= b.g + relaxColor &&
    b.b - relaxColor <= a.b && a.b <= b.b + relaxColor &&
    b.a - relaxColor <= a.a && a.a <= b.a + relaxColor;

  // return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}


function trimCanvas(c) {
  // https://gist.github.com/remy/784508
  var ctx = c.getContext('2d'),
    copy = document.createElement('canvas').getContext('2d'),
    pixels = ctx.getImageData(0, 0, c.width, c.height),
    l = pixels.data.length,
    i,
    bound = {
      top: null,
      left: null,
      right: null,
      bottom: null
    },
    x, y;

  // Iterate over every pixel to find the highest
  // and where it ends on every axis ()
  for (i = 0; i < l; i += 4) {
    if (pixels.data[i + 3] !== 0) {
      x = (i / 4) % c.width;
      y = ~~((i / 4) / c.width);

      if (bound.top === null) {
        bound.top = y;
      }

      if (bound.left === null) {
        bound.left = x;
      } else if (x < bound.left) {
        bound.left = x;
      }

      if (bound.right === null) {
        bound.right = x;
      } else if (bound.right < x) {
        bound.right = x;
      }

      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  // Calculate the height and width of the content
  var trimHeight = bound.bottom - bound.top,
    trimWidth = bound.right - bound.left,
    trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

  copy.canvas.width = trimWidth;
  copy.canvas.height = trimHeight;
  copy.putImageData(trimmed, 0, 0);

  // Return trimmed canvas
  return copy.canvas;
}
