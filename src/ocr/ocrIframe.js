import Tesseract from "tesseract.js";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
import * as util from "/src/util";

//ocr process, listen image from contents js and respond text
//1. listen to get image from iframe host
//2. use tesseract to process ocr to image to get text
//3. resend result to host

window.addEventListener(
  "message",
  async function ({ data }) {
    if (data.type === "ocr") {
      doOcr(data);
    } else if (data.type === "initTesseract") {
      initTesseract(data);
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

    ocrData = await useTesseract(
      canvas,
      request.lang,
      request.bboxList,
      request.mode
    );
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
    windowPostMessageProxy: request.windowPostMessageProxy,
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
function useTesseract(image, lang, rectangles, mode) {
  return new Promise(async function (resolve, reject) {
    try {
      var data = [];
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
  await waitUntil(() => schedulerList[lang + "_" + mode], {
    timeout: WAIT_FOREVER,
  });
  return schedulerList[lang + "_" + mode];
}

async function loadScheduler(lang, mode) {
  if (schedulerList[lang + "_" + mode]) {
    return schedulerList[lang + "_" + mode];
  }

  var isLocal = lang == "jpn_vert";
  var scheduler = Tesseract.createScheduler();
  var workerIndexList = mode == "auto" ? [0] : [0, 1];
  var tessedit_pageseg_mode =
    mode == "auto"
      ? Tesseract.PSM.AUTO_ONLY
      : lang == "jpn_vert"
      ? Tesseract.PSM.SINGLE_BLOCK_VERT_TEXT
      : Tesseract.PSM.SINGLE_BLOCK;

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
        tessedit_pageseg_mode,
      });

      scheduler.addWorker(worker);
    })
  );

  schedulerList[lang + "_" + mode] = scheduler;
  return schedulerList[lang + "_" + mode];
}

function initTesseract(request) {
  loadScheduler(request.lang, "auto");
  loadScheduler(request.lang, "bbox");

  response({
    windowPostMessageProxy: request.windowPostMessageProxy,
  });
}

function response(data) {
  util.postFrame(data);
}
