import $ from "jquery";
import * as util from "../util.js";
import { WindowPostMessageProxy } from "window-post-message-proxy";

const windowPostMessageProxy = new WindowPostMessageProxy({
  suppressWarnings: true,
});
var ocrHistory = {};
var iFrames = {};

//detect mouse positioned image to process ocr in ocr.html iframe
//create text box from ocr result
export async function checkImage(setting, mouseTarget, keyDownList) {
  // if  ocr is not on or no key bind, skip
  // if mouse target is not image, skip
  // if already ocr processed,skip
  if (
    (setting["keyDownOCR"] != "always" &&
      !keyDownList[setting["keyDownOCR"]]) ||
    !checkMouseTargetIsImage(mouseTarget) ||
    ocrHistory[mouseTarget.src]
  ) {
    return;
  }

  var img = mouseTarget;
  var mainUrl = img.src;
  var lang = setting["ocrDetectionLang"];
  ocrHistory[mainUrl] = { mainUrl };

  setElementMouseStatusLoading(img);
  await initOCR(lang);
  var base64Url = await getBase64Image(mainUrl);
  if (!base64Url) {
    setElementMouseStatusIdle(img);
    return;
  }

  //run both,  ocr with opencv rect, ocr without opencv
  await Promise.all([
    processOcr(mainUrl, lang, base64Url, img, "BLUE", "auto"),
    processOcr(mainUrl, lang, base64Url, img, "RED", "bbox"),
  ]);

  setElementMouseStatusIdle(img);
}

export function removeAllOcrEnv() {
  removeOcrIFrame();
  removeOcrBlock();
  iFrames = {};
  ocrHistory = {};
}

async function processOcr(mainUrl, lang, base64Url, img, color, mode = "auto") {
  var ratio = 1;
  var bboxList = [];

  //ocr process with opencv , then display
  if (mode == "bbox") {
    var { bboxList, base64Url, cvratio } = await requestSegmentBox(
      mainUrl,
      lang,
      base64Url
    );
    if (bboxList.length == 0) {
      return;
    }
    ratio *= cvratio;
  } else {
    bboxList = [[]];
  }

  // request ocr per bbox
  await Promise.all(
    bboxList.map(async (bbox) => {
      var res = await requestOcr(mainUrl, lang, [bbox], base64Url, mode);
      showOcrData(img, res.ocrData, ratio, color);
    })
  );
}

function checkMouseTargetIsImage(mouseTarget) {
  // loaded image that has big enough size,
  if (
    mouseTarget != null &&
    mouseTarget.src &&
    mouseTarget.tagName === "IMG" &&
    mouseTarget.complete &&
    mouseTarget.naturalHeight !== 0 &&
    mouseTarget.width > 300 &&
    mouseTarget.height > 300
  ) {
    return true;
  }
  return false;
}

// create ocr==================
async function initOCR(lang) {
  await createIframe("ocrFrame", "/ocr.html");
  await createIframe("opencvFrame", "/opencvHandler.html");
  requestTesseractInit(lang);
}

async function createIframe(name, htmlPath) {
  return new Promise(function(resolve, reject) {
    if (iFrames[name]) {
      resolve();
      return;
    }

    var showFrame = false;
    var css = showFrame
      ? {
          width: "700",
          height: "700",
        }
      : { display: "none" };

    iFrames[name] = $("<iframe />", {
      name: name,
      id: name,
      src: chrome.runtime.getURL(htmlPath),
      css,
    })
      .appendTo("body")
      .on("load", function() {
        resolve();
      })
      .get(0);
  });
}

// request ocr  i frame ==========
async function requestOcr(mainUrl, lang, bboxList, base64Url, mode) {
  return await postMessage(
    { mainUrl, lang, type: "ocr", bboxList, base64Url, mode },
    iFrames["ocrFrame"]
  );
}

async function requestSegmentBox(mainUrl, lang, base64Url) {
  return await postMessage(
    { mainUrl, lang, type: "segmentBox", base64Url },
    iFrames["opencvFrame"]
  );
}

async function requestTesseractInit(lang) {
  return await postMessage(
    {
      type: "initTesseract",
      lang,
    },
    iFrames["ocrFrame"]
  );
}

async function postMessage(data, frame) {
  return await windowPostMessageProxy.postMessage(frame.contentWindow, data);
}

async function getBase64Image(url) {
  var base64Url = "";
  base64Url = await util.getBase64(url);
  if (!base64Url) {
    var { base64Url } = await requestBase64(url);
  }
  return base64Url;
}

async function requestBase64(url) {
  return await chrome.runtime.sendMessage({
    type: "requestBase64",
    url,
  });
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
      // console.log(block["confidence"]);

      //if string contains only whitespace, skip
      if (/^\s*$/.test(text) || text.length < 3 || block["confidence"] < 60) {
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

function createOcrTextBlock(img, textBox, ratio, color) {
  //init bbox
  var $div = $("<div/>", {
    class: "ocr_text_div notranslate",
    text: textBox["text"],
    css: {
      border: "2px solid " + color,
    },
  }).appendTo(img.parentElement);

  // change z-index
  var zIndex =
    Math.max(0, 100000 - getBboxSize(textBox["bbox"])) + textBox["confidence"];
  $div.css("z-index", zIndex);

  // position
  setLeftTopWH(img, textBox["bbox"], $div, ratio);
  $(window).on("resize", (e) => {
    setLeftTopWH(img, textBox["bbox"], $div, ratio);
  });
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
    /[`・〉«¢~「」〃ゝゞヽヾ●▲♩ヽ÷①↓®▽■◆『£〆∴∞▼™↑←~@#$%^&“*()_|+\-=;【】:'"<>\{\}\[\]\\\/]/gi,
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
function setElementMouseStatusLoading(ele) {
  ele.style.cursor = "wait"; //show mouse loading
}
function setElementMouseStatusIdle(ele) {
  ele.style.cursor = "";
}
