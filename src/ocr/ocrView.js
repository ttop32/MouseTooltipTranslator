import $ from "jquery";
import { WindowPostMessageProxy } from "window-post-message-proxy";
import textfit from "textfit";
import delay from "delay";

import * as util from "/src/util";
import TextUtil from "/src/util/text_util.js";
import tippy, { sticky, hideAll } from "tippy.js";
import { getRtlDir } from "/src/util/lang.js";

const windowPostMessageProxy = new WindowPostMessageProxy({
  suppressWarnings: true,
});
var ocrHistory = {};
var iFrames = {};
var ocrResultHistory = {}; // store ocr result to avoid duplicate request
var setting;
var ocrFrameName = "ocrFrame";
var opencvFrameName = "opencvFrame";
// var ocrFrameName="ocrFrameDebug"
// var opencvFrameName="opencvFrameDebug";

//detect mouse positioned image to process ocr in ocr.html iframe
//create text box from ocr result
export async function checkImage(x,y, currentSetting, keyDownList) {
  // if  ocr is not on or no key bind, skip
  // if mouse target is not image, skip
  // if already ocr processed,skip
  var img=util.deepElementFromPoint(x, y);
  if (
    !keyDownList[currentSetting["keyDownOCR"]] ||
    !checkIsImage(img) ||
    ocrHistory[img.src]
  ) {
    return;
  }
  setting = currentSetting;
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
    processOcr(img.src, lang, base64Url, img, "GREEN", "bbox"),
    processOcr(
      img.src,
      lang,
      base64Url,
      img,
      "ORANGE",
      "bbox_white_useOpencvImg"
    ),
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
  hideAll({ duration: 0 });
  ocrResultHistory = {};
}

async function processOcr(mainUrl, lang, base64Url, img, color, mode = "auto") {
  if (!base64Url) {
    return;
  }
  var ratio = 1;
  var bboxList = [[]];
  var opencvImg;
  // OCR process with opencv, then display
  if (mode.includes("bbox")) {
    // console.time("OCR Process with OpenCV"+mode);
    var { bboxList, base64Url, ratio ,opencvImg } = await requestSegmentBox(
      mainUrl,
      lang,
      base64Url,
      mode
    );
    // console.timeEnd("OCR Process with OpenCV"+mode);
  }
  
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
    createIframe(opencvFrameName, "/opencvHandler.html"),
    createIframe(ocrFrameName, "/ocr.html"),
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
  var debugCSS={
    width: "700",
    height: "700",
    pointerEvents: "auto",
    opacity: 1.0,
  }
  var iFrameCSS = {
    width: "1",
    height: "1",
    pointerEvents: "none",
    opacity: 0.0,
  };
  
  return new Promise(function (resolve, reject) {
    var iFrame = $("<iframe />", {
      name: name,
      id: name,
      src: util.getUrlExt(htmlPath),
      css: name.includes("Debug") ? debugCSS : iFrameCSS, // use debug css for debug iframe
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
    iFrames[opencvFrameName]
  );
}

async function requestOcr(mainUrl, lang, bboxList, base64Url, mode) {
  return await postMessage(
    { type: "ocr", mainUrl, lang, bboxList, base64Url, mode },
    iFrames[ocrFrameName]
  );
}

async function requestOcrInit(lang, mode) {
  return await postMessage({ type: "init", lang, mode }, iFrames[ocrFrameName]);
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
async function showOcrData(img, ocrData, ratio, color) {
  var textBoxList = getTextBoxList(ocrData);
  textBoxList.forEach((textBox) => adjustTextBoxBbox(textBox, ratio));

  if (setting["ocrTooltipBox"] == "true") {
    showTooltipBoxes(img, textBoxList);
  } else {
    createOcrTextBlocks(img, textBoxList, color);
  }
}

async function showTooltipBoxes(img, textBoxList) {
  var filteredTextBoxList = filterDuplicateOcr(img, textBoxList);
  for (var textBox of filteredTextBoxList) {
    var { targetText, sourceLang, targetLang } = await handleTranslate(
      textBox["text"]
    );
    addTooltipBox(img, textBox, targetText, targetLang);
  }
}

function calculateTextSimilarity(text1, text2) {
  // Calculate Levenshtein distance between two strings
  const len1 = text1.length;
  const len2 = text2.length;
  const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  const levenshteinDistance = dp[len1][len2];
  const maxLen = Math.max(len1, len2); // Set maxLen to the maximum length of the two strings

  // Return similarity ratio
  return 1 - levenshteinDistance / maxLen;
}

function filterDuplicateOcr(img, textBoxList) {
  // Ensure ocrResultHistory exists for the image
  if (!ocrResultHistory[img.src]) {
    ocrResultHistory[img.src] = [];
  }
  const bboxThreshold = 15; // Threshold for bounding box similarity (bbox is a common term in OCR)
  const textSimilarityThreshold = 0.8; // Threshold for text similarity (e.g., Levenshtein distance ratio)

  // Filter out text boxes that are similar to previous history
  const filteredTextBoxList = textBoxList.filter((textBox) => {
    const isSimilar = ocrResultHistory[img.src].some((prevTextBox) => {
      // Check bounding box similarity
      const isBboxSimilar = // bbox is a common term in OCR
        Math.abs(prevTextBox.bbox.x0 - textBox.bbox.x0) < bboxThreshold && // bbox is a common term in OCR
        Math.abs(prevTextBox.bbox.y0 - textBox.bbox.y0) < bboxThreshold &&
        Math.abs(prevTextBox.bbox.x1 - textBox.bbox.x1) < bboxThreshold &&
        Math.abs(prevTextBox.bbox.y1 - textBox.bbox.y1) < bboxThreshold;

      // Check text similarity
      const isTextSimilar =
        calculateTextSimilarity(prevTextBox.text, textBox.text) >
        textSimilarityThreshold;

      return isBboxSimilar || isTextSimilar; // bbox is a common term in OCR
    });

    return !isSimilar;
  });

  // Update ocrResultHistory with the new OCR data
  ocrResultHistory[img.src] = ocrResultHistory[img.src].concat(textBoxList);
  return filteredTextBoxList;
}

function adjustTextBoxBbox(textBox, ratio) {
  textBox["bbox"]["x0"] = Math.floor(textBox["bbox"]["x0"] / ratio);
  textBox["bbox"]["y0"] = Math.floor(textBox["bbox"]["y0"] / ratio);
  textBox["bbox"]["x1"] = Math.ceil(textBox["bbox"]["x1"] / ratio);
  textBox["bbox"]["y1"] = Math.ceil(textBox["bbox"]["y1"] / ratio);
}

function addTooltipBox(img, textBox, text, targetLang) {
  // Create a tooltip element using Tippy.js
  const tooltipContent = $("<div/>", {
    text: text,
    css: {
      maxWidth: "200px",
      wordWrap: "break-word",
      zIndex: 1000001, // Ensure tooltip content is in front
      pointerEvents: "auto", // Allow pointer interactions with the tooltip content
      dir: getRtlDir(targetLang), // Set direction based on target language
    },
  });

  const { left, top, width, height } = calculateImgSegBoxSize(
    img,
    textBox["bbox"]
  );

  const tooltipTarget = $("<div/>", {
    css: {
      position: "absolute",
      left: `${left}px`,
      top: `${top + height * 0.7}px`,
      width: `${width}px`,
      height: `1px`,
      zIndex: 100000 + textBox["text"].length, // Adjust z-index based on text length
      pointerEvents: "none",
    },
  }).appendTo(img.parentElement);

  const instance = tippy(tooltipTarget[0], {
    content: tooltipContent[0],
    allowHTML: true,
    theme: "custom",
    placement: "top",
    zIndex: 100000 + textBox["text"].length, // Adjust z-index based on text length
    arrow: false,
    role: "mtttooltip",
    showOnCreate: true, // Ensure the tooltip is always visible
    hideOnClick: false, // Prevent hiding on outside click
    popperOptions: {
      modifiers: [
        {
          name: "flip",
          options: {
            fallbackPlacements: [],
          },
        },
        {
          name: "preventOverflow",
          options: {
            altAxis: false,
            tether: false,
          },
        },
        {
          name: "offset",
          options: {
            offset: [0, 0], // center aligned, no shift
          },
        },
      ],
    },
  });

  // Make the tooltip transparent when mouse enters the tooltip content
  tooltipContent.on("mouseenter", () => {
    instance.setProps({
      theme: "transparent", // Apply a transparent theme
    });
    tooltipContent.css("opacity", 0.0); // Reduce opacity
  });

  // Restore the tooltip visibility when mouse leaves the tooltip content
  tooltipContent.on("mouseleave", () => {
    instance.setProps({
      theme: "custom", // Restore the original theme
    });
    tooltipContent.css("opacity", 1); // Restore opacity
  });
}

function getTextBoxList(ocrData) {
  var textBoxList = [];
  for (var ocrDataItem of ocrData) {
    var { data } = ocrDataItem;
    for (var block of data.blocks) {
      // for (var paragraph of block.paragraphs) {
      var text = filterOcrText(block["text"]);
      text = TextUtil.filterWord(text); //filter out one that is url,over 1000length,no normal char

      // console.log(text);
      //if string contains only whitespace, skip
      if (/^\s*$/.test(text) || text.length < 2 || block["confidence"] < 70) {
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

function createOcrTextBlocks(img, textBoxList, color) {
  for (var textBox of textBoxList) {
    createOcrTextBlock(img, textBox, color);
  }
}

async function createOcrTextBlock(img, textBox, color) {
  // console.log(textBox);
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
  setLeftTopWH(img, textBox["bbox"], $div);
  $(window).on("resize", (e) => {
    setLeftTopWH(img, textBox["bbox"], $div);
    // textfit($div);
  });

  //set text font size
  await delay(100);
  textfit($div, { alignHoriz: true, multiLine: true, reProcess: false });
}

function getBboxSize(bbox) {
  return (bbox["x1"] - bbox["x0"]) * (bbox["y1"] - bbox["y0"]);
}
function setLeftTopWH(img, bbox, $div) {
  const { left, top, width, height } = calculateImgSegBoxSize(img, bbox);
  $div.css({
    left: left + "px",
    top: top + "px",
    width: width + "px",
    height: height + "px",
  });
}

function calculateImgSegBoxSize(img, bbox) {
  const offsetLeft = img.offsetLeft;
  const offsetTop = img.offsetTop;
  const widthRatio = img.offsetWidth / img.naturalWidth;
  const heightRatio = img.offsetHeight / img.naturalHeight;
  const x = widthRatio * bbox["x0"];
  const y = heightRatio * bbox["y0"];
  const w = widthRatio * (bbox["x1"] - bbox["x0"]);
  const h = heightRatio * (bbox["y1"] - bbox["y0"]);
  const left = offsetLeft + x;
  const top = offsetTop + y;

  return { left, top, width: w, height: h };
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

async function handleTranslate(text) {
  var translatorVendor = setting["translatorVendor"];
  if (translatorVendor !== "bing" && translatorVendor !== "google") {
    translatorVendor = "google";
  }

  return await util.requestTranslate(
    text,
    setting["translateSource"],
    setting["translateTarget"],
    setting["translateReverseTarget"],
    translatorVendor
  );
}
