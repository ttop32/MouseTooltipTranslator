import Tesseract from 'tesseract.js';

//ocr process, listen image from contents js and respond text
//1. listen to get image from iframe host
//2. use tesseract to process ocr to image to get text
//3. resend result to host




window.addEventListener(
  "message",
  function(request) {
    if (request.data.type === "ocr") {
      doOcr(request.data);
    }
  },
  false
);

// ocr ===========================================================
var schedulerList={}
var recentMainUrl = "";
var recentLang = "";

async function doOcr(request) {
  try {
    var data = {};

    if (
      request.mainUrl != recentMainUrl ||
      request.base64Url != "" ||
      recentLang != request.lang
    ) {
      // load image if mainurl diff or base64Url given
      var url = request.base64Url ? request.base64Url : request.mainUrl; //load base64Url if exist else load mainUrl
      recentMainUrl = request.mainUrl;
      recentLang = request.lang;

      var canvas = await loadImage(url);
      // document.body.appendChild(canvas);
      
      data = await useTesseract(canvas, request.lang);
    }

    window.parent.postMessage(
      {
        type: "success",
        mainUrl: request.mainUrl,
        base64Url: request.base64Url,
        time: request.time,
        lang: request.lang,
        ocrData: data,
      },
      "*"
    );
  } catch (err) {
    window.parent.postMessage(
      {
        type: "fail",
        mainUrl: request.mainUrl,
        base64Url: request.base64Url,
        time: request.time,
        lang: request.lang,
        ocrData: data,
      },
      "*"
    );
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
      resolve(canvas);
    };
    image.onerror = reject;
    image.src = url;
  });
}


//create ocr worker and processs ocr
function useTesseract(image, lang) {
  return new Promise(async function(resolve, reject) {
    try {
      //load tessearct worker
      // if lang is jpn_vert  use custom jpn_vert
      if (schedulerList[lang] == null  ) {
        var isLocal=lang == "jpn_vert" || lang == "jpn_vert_old"
        
        // create worker
        var worker = await Tesseract.createWorker({
          workerBlobURL: false,
          workerPath: chrome.runtime.getURL("/tesseract/worker.min.js"),
          corePath: chrome.runtime.getURL("/tesseract/tesseract-core.wasm.js"),
          langPath:
            isLocal
              ? chrome.runtime.getURL("/traindata")
              : "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0", //https://github.com/zodiac3539/jpn_vert
          gzip: isLocal  ? false : true,
          // logger: m => console.log(m), // Add logger here
        });
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        await worker.setParameters({
          tessedit_pageseg_mode: Tesseract.PSM.AUTO_ONLY,
        });

        // create scheduler
        var scheduler = Tesseract.createScheduler();
        scheduler.addWorker(worker);
        schedulerList[lang]=scheduler;
      }
  
      //ocr on image
      var { data } = await schedulerList[lang].addJob('recognize', image);


      resolve(data);
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}

// function resizeCanvas(canvas){
//   var maxSize = 350;
//   var rowsNew = canvas.width;
//   var colsNew = canvas.height;
//   colsNew = colsNew * maxSize / rowsNew;
//   rowsNew = maxSize;
//   if (maxSize < colsNew) {
//     rowsNew = rowsNew * maxSize / colsNew;
//     colsNew = maxSize;
//   }

//   var resizeCanvas = document.createElement("canvas");
//   resizeCanvas.width = parseInt(canvas.width);
//   resizeCanvas.height = parseInt(canvas.height);
//   resizeCanvas.getContext('2d').drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, resizeCanvas.width, resizeCanvas.height);

//   return resizeCanvas;
// }



// // https://dev.to/mathewthe2/using-javascript-to-preprocess-images-for-ocr-1jc
// function preprocessImage(canvas) {
//   const processedImageData = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
//   blurARGB(processedImageData.data, canvas, 1);
//   dilate(processedImageData.data, canvas);
//   invertColors(processedImageData.data);
//   thresholdFilter(processedImageData.data, 0.4);
//   return processedImageData;
// }
