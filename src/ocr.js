import Tesseract from "tesseract.js";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";

//ocr process, listen image from contents js and respond text
//1. listen to get image from iframe host
//2. use tesseract to process ocr to image to get text
//3. resend result to host

window.addEventListener(
  "message",
  async function(request) {
    var request = request.data;

    if (request.type === "ocr") {
      doOcr(request);
    } else if (request.type === "getBase64") {
      processBase64(request);
    } else if (request.type === "initTesseract") {
      initTesseract(request);
    }
  },
  false
);

// ocr ===========================================================
var schedulerList = {};

async function doOcr(request) {
  var type = "ocrSuccess";
  var ocrData = [];

  try {
    var canvas = await loadImage(request.base64Url);
    // document.body.appendChild(canvas);

    ocrData = await useTesseract(canvas, request.lang, request.bboxList);
  } catch (err) {
    console.log(err);
    type = "ocrFail";
  }

  response({
    type,
    mainUrl: request.mainUrl,
    base64Url: request.base64Url,
    lang: request.lang,
    ocrData,
    timeId: request.timeId,
  });
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
function useTesseract(image, lang, rectangles) {
  return new Promise(async function(resolve, reject) {
    try {
      var data = [];
      var mode = rectangles.length == 0 ? "auto" : "bbox";
      var scheduler = await getScheduler(lang, mode);

      // //ocr on plain image
      if (mode == "auto") {
        var d = await scheduler.addJob("recognize", image);
        data = [d];

        //ocr on opencv processed image with bbox
      } else {
        data = await Promise.all(
          rectangles.map((rectangle) =>
            scheduler.addJob("recognize", image, {
              rectangle,
            })
          )
        );
      }

      resolve(data);
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}
async function getScheduler(lang, mode) {
  await waitUntil(() => schedulerList[lang + "_" + mode] != null, {
    timeout: WAIT_FOREVER, // === Number.POSITIVE_INFINITY
  });
  return schedulerList[lang + "_" + mode];
}

async function loadScheduler(lang, mode) {
  if (schedulerList[lang + "_" + mode]) {
    return schedulerList[lang + "_" + mode];
  }

  var isLocal = lang == "jpn_vert" || lang == "jpn_vert_old";
  var scheduler = Tesseract.createScheduler();
  var workerIndexList = mode == "auto" ? [0] : [0, 1];

  await Promise.all(
    workerIndexList.map(async (i) => {
      var worker = await Tesseract.createWorker({
        workerBlobURL: false,
        workerPath: chrome.runtime.getURL("/tesseract/worker.min.js"),
        corePath: chrome.runtime.getURL("/tesseract/tesseract-core.wasm.js"),
        langPath: isLocal
          ? chrome.runtime.getURL("/traindata")
          : "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0", //https://github.com/zodiac3539/jpn_vert
        gzip: isLocal ? false : true,
        // logger: m => console.log(m), // Add logger here
      });
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
      await worker.setParameters({
        user_defined_dpi: "100",
        tessedit_pageseg_mode:
          mode == "auto"
            ? Tesseract.PSM.AUTO_ONLY
            : Tesseract.PSM.SINGLE_BLOCK_VERT_TEXT,
      });
      scheduler.addWorker(worker);
    })
  );

  schedulerList[lang + "_" + mode] = scheduler;
  return schedulerList[lang + "_" + mode];
}

function response(data) {
  window.parent.postMessage(data, "*");
}

async function processBase64(request) {
  request["base64Url"] = await getBase64(request.url);
  response(request);
}

function getBase64(url) {
  return new Promise(function(resolve, reject) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        var reader = new FileReader();
        reader.onload = function() {
          resolve(this.result); // <--- `this.result` contains a base64 data URI
        };
        reader.readAsDataURL(blob);
      });
  });
}

function initTesseract(request) {
  loadScheduler(request.lang, "auto");
  loadScheduler(request.lang, "bbox");
}
