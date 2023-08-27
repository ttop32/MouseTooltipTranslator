import $ from "jquery";
import * as util from "../util.js";

//ocr==================================================================================
var ocrHistory = {};
var iFrames = {};

//detect mouse positioned image to process ocr in ocr.html iframe
//create text box from ocr result
export async function checkImage(setting, mouseTarget) {
  // if mouse target is not image or ocr is not on, skip
  // if already ocr processed,skip
  if (
    setting["useOCR"] == "false" ||
    !checkMouseTargetIsImage(mouseTarget) ||
    (ocrHistory[mouseTarget.src] &&
      ocrHistory[mouseTarget.src]["lang"] == setting["ocrDetectionLang"])
  ) {
    return;
  }
  var ratio = 1;
  var ele = mouseTarget;
  var url = ele.src;
  var ocrBaseData = {
    mainUrl: url,
    lang: setting["ocrDetectionLang"],
  };
  ocrHistory[url] = ocrBaseData;

  setElementMouseStatusLoading(ele);
  await initOCR(setting["ocrDetectionLang"]);

  var base64Url = await getBase64Image(url);
  if (!base64Url) {
    setElementMouseStatusIdle(ele);
    return;
  }

  //run both,  ocr with opencv rect, ocr without opencv
  // const start = Date.now();
  await Promise.all([
    processOcr(ocrBaseData, base64Url, ele, "BLUE", ratio, "auto"),
    processOcr(ocrBaseData, base64Url, ele, "RED", ratio, "bbox"),
  ]);
  // const end = Date.now();
  // console.log(`Execution time: ${end - start} ms`);

  setElementMouseStatusIdle(ele);
}

function setElementMouseStatusLoading(ele) {
  ele.style.cursor = "wait"; //show mouse loading
}
function setElementMouseStatusIdle(ele) {
  ele.style.cursor = "";
}

async function processOcr(
  ocrBaseData,
  base64Url,
  mouseTarget,
  color,
  ratio,
  mode = "auto"
) {
  var bboxList = [];

  //ocr process with opencv , then display
  if (mode == "bbox") {
    var { bboxList, base64Url, cvratio } = await requestSegmentBox(
      ocrBaseData,
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
      var res = await requestOcr(ocrBaseData, [bbox], base64Url, mode);
      showOcrData(mouseTarget, res.ocrData, ratio, color);
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
  initIframeTesseract(lang);
}

function initIframeTesseract(lang) {
  getMessageResponse({
    type: "initTesseract",
    lang,
  });
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
async function requestOcr(ocrBaseData, bboxList, base64Url, mode) {
  return await getMessageResponse(
    $.extend(ocrBaseData, { type: "ocr", bboxList, base64Url, mode })
  );
}
async function requestSegmentBox(ocrBaseData, base64Url) {
  return await getMessageResponse(
    $.extend(ocrBaseData, { type: "segmentBox", base64Url })
  );
}

async function getMessageResponse(data) {
  return new Promise(function(resolve, reject) {
    var timeId = Date.now() + Math.random();
    data["timeId"] = timeId;

    //listen iframe response
    window.addEventListener("message", function namedListener(response) {
      if (response.data.timeId == timeId) {
        window.removeEventListener("message", namedListener);
        resolve(response.data);
      }
    });

    //broadcast message to iframe
    for (var key in iFrames) {
      iFrames[key].contentWindow.postMessage(data, "*");
    }
  });
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
function showOcrData(target, ocrData, ratio, color) {
  var textBoxList = getTextBoxList(ocrData);

  for (var textBox of textBoxList) {
    createOcrTextBlock(target, textBox, ratio, color);
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

function createOcrTextBlock(target, textBox, ratio, color) {
  //init bbox
  var $div = $("<div/>", {
    class: "ocr_text_div notranslate",
    text: textBox["text"],
    css: {
      border: "2px solid " + color,
    },
  }).appendTo(target.parentElement);

  // change z-index
  var zIndex =
    Math.max(0, 100000 - getBboxSize(textBox["bbox"])) + textBox["confidence"];
  $div.css("z-index", zIndex);

  // position
  setLeftTopWH(target, textBox["bbox"], $div, ratio);
  $(window).on("resize", (e) => {
    setLeftTopWH(target, textBox["bbox"], $div, ratio);
  });
}

function getBboxSize(bbox) {
  return (bbox["x1"] - bbox["x0"]) * (bbox["y1"] - bbox["y0"]);
}

function setLeftTopWH(target, bbox, $div, ratio) {
  var offsetLeft = target.offsetLeft;
  var offsetTop = target.offsetTop;
  var widthRatio = target.offsetWidth / target.naturalWidth;
  var heightRatio = target.offsetHeight / target.naturalHeight;
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
export function removeAllOcrEnv() {
  removeOcrIFrame();
  removeOcrBlock();
  iFrames = {};
  ocrHistory = {};
}

function removeOcrBlock() {
  $(".ocr_text_div").remove();
}
function removeOcrIFrame() {
  for (let key in iFrames) {
    iFrames[key].remove();
  }
}
