import $ from "jquery";
import { WindowPostMessageProxy } from "window-post-message-proxy";
import textfit from "textfit";
import delay from "delay";

import * as util from "/src/util";

const windowPostMessageProxy = new WindowPostMessageProxy({
  suppressWarnings: true,
});
var ocrHistory = {};
var iFrames = {};
var showFrame = false;

//detect mouse positioned image to process ocr in ocr.html iframe
//create text box from ocr result
export async function checkImage(img, setting, keyDownList) {
  // if  ocr is not on or no key bind, skip
  // if mouse target is not image, skip
  // if already ocr processed,skip
  if (
    !keyDownList[setting["keyDownOCR"]] ||
    !checkIsImage(img) ||
    ocrHistory[img.src]
  ) {
    return;
  }
  ocrHistory[img.src] = img;
  var lang = setting["ocrLang"];
  makeLoadingMouseStyle(img);

  //init env, load iframe and image
  // var start = new Date().getTime();
  var base64Url = (
    await Promise.all([
      getBase64Image(img.src),
      initOCRIframe().then(() => initOCRLibrary(lang)),
    ])
  )[0];
  // console.log("Execution time: " + (new Date().getTime() - start));

  //pass image for ocr, run both,  ocr with opencv rect, ocr without opencv
  // auto, no opencv only tesseract
  // bbox, use opencv and tesseract
  await Promise.all([
    processOcr(img.src, lang, base64Url, img, "BLUE", "auto"),
    processOcr(img.src, lang, base64Url, img, "RED", "bbox_small"),
    processOcr(img.src, lang, base64Url, img, "CYAN", "bbox_large"),
    processOcr(img.src, lang, base64Url, img, "GREEN", "bbox"),
  ]);

  makeNormalMouseStyle(img);
}

export function removeAllOcrEnv() {
  for (var key in ocrHistory) {
    makeNormalMouseStyle(ocrHistory[key]);
  }
  removeOcrIFrame();
  removeOcrBlock();
  iFrames = {};
  ocrHistory = {};
}

async function processOcr(mainUrl, lang, base64Url, img, color, mode = "auto") {
  if (!base64Url) {
    return;
  }
  var ratio = 1;
  var bboxList = [[]];

  //ocr process with opencv , then display
  if (!mode.includes("auto")) {
    var { bboxList, base64Url, ratio } = await requestSegmentBox(
      mainUrl,
      lang,
      base64Url,
      mode
    );
  }

  // request ocr per bbox
  await Promise.all(
    bboxList.map(async (bbox) => {
      var res = await requestOcr(mainUrl, lang, [bbox], base64Url, mode);
      showOcrData(img, res.ocrData, ratio, color);
    })
  );
}

function checkIsImage(ele) {
  // loaded image that has big enough size,
  return (
    ele?.src &&
    ele?.tagName == "IMG" &&
    ele?.complete &&
    ele?.naturalHeight !== 0 &&
    ele?.width > 300 &&
    ele?.height > 300
  );
}

// create ocr==================
async function initOCRIframe() {
  await Promise.all([
    createIframe("opencvFrame", "/opencvHandler.html"),
    createIframe("ocrFrame", "/ocr.html"),
  ]);
}
async function initOCRLibrary(lang) {
  requestOcrInit(lang, "auto");
  requestOcrInit(lang, "bbox");
}

async function createIframe(name, htmlPath) {
  if (iFrames[name]) {
    return iFrames[name];
  }
  iFrames[name] = await loadScript(name, htmlPath);
  return iFrames[name];
}

function loadScript(name, htmlPath) {
  return new Promise(function (resolve, reject) {
    var iFrame = $("<iframe />", {
      name: name,
      id: name,
      src: util.getUrlExt(htmlPath),
      css: {
        width: "700",
        height: "700",
        display: showFrame ? "block" : "none",
      },
    })
      .appendTo("body")
      .on("load", () => {
        resolve(iFrame);
      })
      .get(0);
  });
}

// request ocr  iframe ==========
async function requestSegmentBox(mainUrl, lang, base64Url, mode) {
  return await postMessage(
    { type: "segmentBox", mainUrl, lang, base64Url, mode },
    iFrames["opencvFrame"]
  );
}

async function requestOcr(mainUrl, lang, bboxList, base64Url, mode) {
  return await postMessage(
    { type: "ocr", mainUrl, lang, bboxList, base64Url, mode },
    iFrames["ocrFrame"]
  );
}

async function requestOcrInit(lang, mode) {
  return await postMessage({ type: "init", lang, mode }, iFrames["ocrFrame"]);
}

async function postMessage(data, frame) {
  return await windowPostMessageProxy.postMessage(frame.contentWindow, data);
}

async function getBase64Image(url) {
  var base64Url = await util.getBase64(url); //load from tab
  if (!base64Url) {
    var { base64Url } = await util.requestBase64(url); //load from background
  }
  return base64Url;
}

// show ocr result ==============================
function showOcrData(img, ocrData, ratio, color) {
  var textBoxList = getTextBoxList(ocrData);

  for (var textBox of textBoxList) {
    createOcrTextBlock(img, textBox, ratio, color);
  }
}

function getTextBoxList(ocrData) {
  var textBoxList = [];
  for (var ocrDataItem of ocrData) {
    var { data } = ocrDataItem;
    for (var block of data.blocks) {
      // for (var paragraph of block.paragraphs) {
      var text = filterOcrText(block["text"]);
      text = util.filterWord(text); //filter out one that is url,over 1000length,no normal char

      // console.log(text);
      //if string contains only whitespace, skip
      if (/^\s*$/.test(text) || text.length < 2 || block["confidence"] < 60) {
        continue;
      }

      block["confidence"] = parseInt(block["confidence"]);
      block["text"] = text;
      textBoxList.push(block);
      // }
    }
  }
  return textBoxList;
}

async function createOcrTextBlock(img, textBox, ratio, color) {
  //init bbox
  var $div = $("<div/>", {
    class: "ocr_text_div notranslate",
    css: {
      border: "2px solid " + color,
    },
    text: textBox["text"],
  }).appendTo(img.parentElement);

  // change z-index
  var zIndex =
    Math.max(0, 100000 - getBboxSize(textBox["bbox"])) + textBox["confidence"];
  $div.css("z-index", zIndex);

  //set box position and szie
  setLeftTopWH(img, textBox["bbox"], $div, ratio);
  $(window).on("resize", (e) => {
    setLeftTopWH(img, textBox["bbox"], $div, ratio);
    // textfit($div);
  });

  //set text font size
  await delay(100);
  textfit($div, { alignHoriz: true, multiLine: true, reProcess: false });
}

function getBboxSize(bbox) {
  return (bbox["x1"] - bbox["x0"]) * (bbox["y1"] - bbox["y0"]);
}

function setLeftTopWH(img, bbox, $div, ratio) {
  var offsetLeft = img.offsetLeft;
  var offsetTop = img.offsetTop;
  var widthRatio = img.offsetWidth / img.naturalWidth;
  var heightRatio = img.offsetHeight / img.naturalHeight;
  var x = (widthRatio * bbox["x0"]) / ratio;
  var y = (heightRatio * bbox["y0"]) / ratio;
  var w = (widthRatio * (bbox["x1"] - bbox["x0"])) / ratio;
  var h = (heightRatio * (bbox["y1"] - bbox["y0"])) / ratio;
  var left = offsetLeft + x;
  var top = offsetTop + y;

  $div.css({
    left: left + "px",
    top: top + "px",
    width: w + "px",
    height: h + "px",
  });
}

function filterOcrText(text) {
  return text.replace(
    /[`・〉«¢~「」〃ゝゞヽヾ●▲♩ヽ÷①↓®▽■◆『£〆∴∞▼™↑←~@#$%^&“*()_|+\-=;…【】:'"<>\{\}\[\]\\\/]/gi,
    ""
  ); //remove special char
}

//  remove ocr ==================
function removeOcrBlock() {
  $(".ocr_text_div").remove();
}
function removeOcrIFrame() {
  for (let key in iFrames) {
    iFrames[key].remove();
  }
}

// set style ==============
function makeLoadingMouseStyle(ele) {
  ele.style.cursor = "wait"; //show mouse loading
}
function makeNormalMouseStyle(ele) {
  ele.style.cursor = "";
}
