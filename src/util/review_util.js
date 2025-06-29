var browser;
try {
    browser = require("webextension-polyfill");
} catch (error) {}

var reviewUrlJson = {
    nnodgmifnfgkolmakhcfkkbbjjcobhbl:
        "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl", //edge web store id
    hmigninkgibhdckiaphhmbgcghochdjc:
        "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews", //chrome web store id
    firefox:
        "https://addons.mozilla.org/en-US/firefox/addon/mouse-tooltip-translator-pdf/reviews/",
    default:
        "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
};

function getReviewUrl() {
    const extId = browser.runtime.id;
    if (extId in reviewUrlJson) {
        return reviewUrlJson[extId];
    }
    if (isFirefox()) {
        return reviewUrlJson["firefox"];
    }
    return reviewUrlJson["default"];
}

function isFirefox() {
    return typeof InstallTrigger !== "undefined";
}

export { getReviewUrl };
