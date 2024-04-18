import { waitUntil, WAIT_FOREVER } from "async-wait-until";

var showResult = false;

window.addEventListener(
  "message",
  ({ data }) => {
    if (data.type === "segmentBox") {
      segmentBox(data);
    } else if (data.type === "resizeImage") {
      resizeImage(data);
    }
  },
  false
);

async function segmentBox(request, isResize = true) {
  var type = "segmentSuccess";
  var bboxList = [];
  var base64 = request.base64Url;
  var ratio = 1;
  var mode = request.mode;

  try {
    await waitOpencvLoad();

    //get image
    var canvas1 = await loadImage(request.base64Url);
    var [canvas1, ratio] = preprocessImage(canvas1, isResize);
    base64 = canvas1.toDataURL();

    // get bbox from image
    bboxList = bboxList.concat(detectText(canvas1, mode));
  } catch (err) {
    console.log(err);
    type = "segmentFail";
  }

  response({
    type,
    mainUrl: request.mainUrl,
    base64Url: base64,
    lang: request.lang,
    bboxList,
    ratio,
    windowPostMessageProxy: request.windowPostMessageProxy,
  });
}

async function waitOpencvLoad() {
  await waitUntil(() => {
    try {
      let mat = cv?.matFromArray(2, 3, cv?.CV_8UC1, [1, 2, 3, 4, 5, 6]);
      return mat?.cols;
    } catch (error) {
      console.log(error);
    }
    return "";
  });
}

async function resizeImage(request) {
  var canvas1 = await loadImage(request.base64Url);
  var [canvas2, ratio] = preprocessImage(canvas1);
  base64 = canvas2.toDataURL();

  response({
    base64Url: base64,
    cvratio: ratio,
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

function response(data) {
  window.parent.postMessage(data, "*");
}

// opencv=========================================
function detectText(canvasIn, mode) {
  // https://github.com/qzane/text-detection

  let src = cv.imread(canvasIn);
  let dst = new cv.Mat();
  var bboxList = [];
  var w = src.cols;
  var h = src.rows;
  var paddingSize = 10;
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  if (mode.includes("large")) {
    var ksize = new cv.Size(50, 50);
    var element = cv.getStructuringElement(cv.MORPH_ELLIPSE, ksize);
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
  } else if (mode.includes("small")) {
    var ksize = new cv.Size(12, 12);
    var element = cv.getStructuringElement(cv.MORPH_RECT, ksize);
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
    paddingSize = 5;
  } else {
    //get only contour bounded image to extract manga bubble only

    var ksize = new cv.Size(15, 15);
    // var element = cv.getStructuringElement(cv.MORPH_ELLIPSE, ksize);
    var element = cv.getStructuringElement(cv.MORPH_RECT, ksize);

    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.GaussianBlur(dst, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(dst, dst, 30, 150, 3, false);
    cv.findContours(
      dst,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // # Create a mask from the contours, 1for bounded, 2for non bounded
    let mask1 = new cv.Mat(h, w, cv.CV_8U, new cv.Scalar(0));
    cv.drawContours(mask1, contours, -1, new cv.Scalar(255), -1);
    let mask2 = new cv.Mat(h, w, cv.CV_8U, new cv.Scalar(0, 0, 0));
    cv.drawContours(mask2, contours, -1, new cv.Scalar(255), 5);
    cv.bitwise_not(mask2, mask2);

    // # Bitwise-AND bounded mask with the non bounded mask to remove edges
    let area_bounded_contour_mask = new cv.Mat();
    cv.bitwise_and(mask1, mask1, area_bounded_contour_mask, mask2);
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.bitwise_and(dst, dst, dst, area_bounded_contour_mask);

    let area_bounded_contour_mask_inv = new cv.Mat();
    cv.bitwise_not(area_bounded_contour_mask, area_bounded_contour_mask_inv);

    let y = new cv.Mat();
    cv.add(area_bounded_contour_mask_inv, dst, y);
    src = y;
    dst = y;
    // showImage(y);

    paddingSize = 3;

    // blurred = cv2.GaussianBlur(gray, (5,5), 0)
    // edges = cv2.Canny(blurred, 50, 200,apertureSize=7,L2gradient=True)
  }
  // var ksize = new cv.Size(20, 20);
  // var element = cv.getStructuringElement(cv.MORPH_ELLIPSE, ksize);
  // cv.erode(dst, dst, delement);
  // cv.dilate(dst, dst, delement);
  // cv.medianBlur(dst, dst, 5);

  cv.threshold(dst, dst, 0, 255, cv.THRESH_OTSU | cv.THRESH_BINARY);
  cv.Sobel(dst, dst, cv.CV_8U, 1, 0, 1, 1, 0, cv.BORDER_DEFAULT); //x1,y0,ksize3,
  cv.Sobel(dst, dst, cv.CV_8U, 0, 1, 1, 1, 0, cv.BORDER_DEFAULT); //x1,y0,ksize3, remove straight line

  cv.threshold(dst, dst, 0, 255, cv.THRESH_OTSU | cv.THRESH_BINARY); //remove smooth color diff
  cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, element); //make bigger for char grouping
  cv.findContours(
    dst,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_NONE
  );

  for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    let area = cv.contourArea(cnt);
    let angle = Math.abs(cv.minAreaRect(cnt).angle);
    let isRightAngle = [0, 90, 180, 270, 360].some(
      (x) => Math.abs(x - angle) <= 20.0
    );
    let rect = cv.boundingRect(cnt);
    var left = parseInt(Math.max(rect.x - paddingSize, 0));
    var top = parseInt(Math.max(rect.y - paddingSize, 0));
    var width = parseInt(Math.min(rect.width + paddingSize * 2, w - left));
    var height = parseInt(Math.min(rect.height + paddingSize * 2, h - top));
    var whRatio = Math.max(width / height, height / width);
    var rectCoverRatio = area / (rect.width * rect.height);

    // if not sharp, small size, wrong angle, too side pos
    if (
      rectCoverRatio < 0.15 ||
      cnt.rows < 100 ||
      area < 150 ||
      !isRightAngle ||
      left == 0 ||
      top == 0 ||
      left + width == w ||
      top + height == h
    ) {
      continue;
    }

    var bbox = { left, top, width, height };
    bboxList.push(bbox);

    if (showResult) {
      let color = new cv.Scalar(
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255)
      );
      let point1 = new cv.Point(left, top);
      let point2 = new cv.Point(left + width, top + height);
      cv.rectangle(src, point1, point2, color, 2, cv.LINE_AA, 0);
      console.log(bbox);
    }
  }
  if (showResult) {
    console.log(bboxList.length);
    showImage(src);
    showImage(dst);
  }

  bboxList = sortBbox(bboxList);
  return bboxList;
}

function showImage(cvImage) {
  var canvas = document.createElement("canvas");
  cv.imshow(canvas, cvImage);
  document.body.appendChild(canvas);
}

function sortBbox(bboxList) {
  return bboxList.sort((a, b) => {
    if (a.top < b.top) {
      return -1;
    }
  });
}

function image_resize(src, minSize) {
  var dim;
  var r;
  var w = src.cols;
  var h = src.rows;

  if (!minSize) {
    return src;
  } else if (h < w) {
    r = minSize / h;
    dim = [parseInt(w * r), minSize];
  } else {
    r = minSize / w;
    dim = [minSize, parseInt(h * r)];
  }

  let dsize = new cv.Size(...dim);
  cv.resize(src, src, dsize, 0, 0, cv.INTER_AREA);
  return r;
}

function preprocessImage(canvasIn, isResize) {
  var canvasOut = document.createElement("canvas");
  var ratio = 1;
  let src = cv.imread(canvasIn);
  let dst = new cv.Mat();

  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

  if (isResize) {
    var ratio = image_resize(src, 700);
  }

  cv.imshow(canvasOut, src);
  src.delete();
  dst.delete();

  return [canvasOut, ratio];
}
