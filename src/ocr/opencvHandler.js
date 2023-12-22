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

  try {
    await checkOpencvLoad();

    //get image
    var canvas1 = await loadImage(request.base64Url);
    var [canvas1, ratio] = preprocessImage(canvas1, isResize);
    base64 = canvas1.toDataURL();

    // get bbox from image
    bboxList = detectText(canvas1);
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

async function checkOpencvLoad() {
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
function detectText(canvasIn) {
  // https://github.com/qzane/text-detection

  let src = cv.imread(canvasIn);
  let dst = new cv.Mat();
  var bboxList = [];
  var w = src.cols;
  var h = src.rows;
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  let ksize = new cv.Size(10, 10);
  var element = cv.getStructuringElement(cv.MORPH_RECT, ksize);
  var paddingSize = 10;

  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(dst, dst, 0, 255, cv.THRESH_OTSU | cv.THRESH_BINARY);
  cv.Sobel(dst, dst, cv.CV_8U, 1, 0, 1, 1, 0, cv.BORDER_DEFAULT); //x1,y0,ksize3,
  cv.Sobel(dst, dst, cv.CV_8U, 0, 1, 1, 1, 0, cv.BORDER_DEFAULT); //x1,y0,ksize3, remove straight line

  // var blurSize = new cv.Size(3, 3);
  // // cv.blur(dst, dst, blurSize);
  // cv.GaussianBlur(dst, dst, blurSize, 1.0);

  // var dsize = new cv.Size(3, 3);
  // var delement = cv.getStructuringElement(cv.MORPH_RECT, dsize);
  // cv.dilate(dst, dst, delement);
  // cv.erode(dst, dst, delement);
  // cv.medianBlur(dst, dst, 1);

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
    let isRightAngle = [0, 90, 180, 270].some(
      (x) => Math.abs(x - angle) <= 10.0
    );
    let rect = cv.boundingRect(cnt);
    var left = parseInt(Math.max(rect.x - paddingSize, 0));
    var top = parseInt(Math.max(rect.y - paddingSize, 0));
    var width = parseInt(Math.min(rect.width + paddingSize * 2, w - left));
    var height = parseInt(Math.min(rect.height + paddingSize * 2, h - top));
    var whRatio = Math.max(width / height, height / width);

    // if not sharp, small size, wrong angle, too side pos
    if (
      cnt.rows < 100 ||
      area < 150 ||
      area > (h / 8) * (w / 8) ||
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
    var canvasOut1 = document.createElement("canvas");
    var canvasOut2 = document.createElement("canvas");
    cv.imshow(canvasOut1, src);
    document.body.appendChild(canvasOut1);
    cv.imshow(canvasOut2, dst);
    document.body.appendChild(canvasOut2);
  }
  console.log(bboxList.length);

  bboxList = sortBbox(bboxList);
  return bboxList;
}

function sortBbox(bboxList) {
  return bboxList.sort((a, b) => {
    if (a.top < b.top) {
      return -1;
    }
  });
}

function image_resize(src, width, height) {
  var dim;
  var r;
  var w = src.cols;
  var h = src.rows;

  // # if both the width and height are None, then return the
  // # original image
  if (!width && !height) {
    return src;
  }

  // # check to see if the width is None
  if (!width) {
    r = height / h;
    dim = [parseInt(w * r), height];
  } else {
    r = width / w;
    dim = [width, parseInt(h * r)];
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
