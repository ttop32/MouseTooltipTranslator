/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/popup.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/popup.css":
/*!***********************!*\
  !*** ./src/popup.css ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/popup.js":
/*!**********************!*\
  !*** ./src/popup.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _popup_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./popup.css */ "./src/popup.css");
/* harmony import */ var _popup_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_popup_css__WEBPACK_IMPORTED_MODULE_0__);





//interact user setting
//save and load setting from background.js



var langList = {
  'afrikaans': 'af',
  'albanian': 'sq',
  'amharic': 'am',
  'arabic': 'ar',
  'armenian': 'hy',
  'azerbaijani': 'az',
  'basque': 'eu',
  'belarusian': 'be',
  'bengali': 'bn',
  'bosnian': 'bs',
  'bulgarian': 'bg',
  'catalan': 'ca',
  'cebuano': 'ceb',
  'chichewa': 'ny',
  'chinese (simplified)': 'zh-cn',
  'chinese (traditional)': 'zh-tw',
  'corsican': 'co',
  'croatian': 'hr',
  'czech': 'cs',
  'danish': 'da',
  'dutch': 'nl',
  'english': 'en',
  'esperanto': 'eo',
  'estonian': 'et',
  'filipino': 'tl',
  'finnish': 'fi',
  'french': 'fr',
  'frisian': 'fy',
  'galician': 'gl',
  'georgian': 'ka',
  'german': 'de',
  'greek': 'el',
  'gujarati': 'gu',
  'haitian creole': 'ht',
  'hausa': 'ha',
  'hawaiian': 'haw',
  'hebrew': 'iw',
  'hindi': 'hi',
  'hmong': 'hmn',
  'hungarian': 'hu',
  'icelandic': 'is',
  'igbo': 'ig',
  'indonesian': 'id',
  'irish': 'ga',
  'italian': 'it',
  'japanese': 'ja',
  'javanese': 'jw',
  'kannada': 'kn',
  'kazakh': 'kk',
  'khmer': 'km',
  'korean': 'ko',
  'kurdish (kurmanji)': 'ku',
  'kyrgyz': 'ky',
  'lao': 'lo',
  'latin': 'la',
  'latvian': 'lv',
  'lithuanian': 'lt',
  'luxembourgish': 'lb',
  'macedonian': 'mk',
  'malagasy': 'mg',
  'malay': 'ms',
  'malayalam': 'ml',
  'maltese': 'mt',
  'maori': 'mi',
  'marathi': 'mr',
  'mongolian': 'mn',
  'myanmar (burmese)': 'my',
  'nepali': 'ne',
  'norwegian': 'no',
  'pashto': 'ps',
  'persian': 'fa',
  'polish': 'pl',
  'portuguese': 'pt',
  'punjabi': 'pa',
  'romanian': 'ro',
  'russian': 'ru',
  'samoan': 'sm',
  'scots gaelic': 'gd',
  'serbian': 'sr',
  'sesotho': 'st',
  'shona': 'sn',
  'sindhi': 'sd',
  'sinhala': 'si',
  'slovak': 'sk',
  'slovenian': 'sl',
  'somali': 'so',
  'spanish': 'es',
  'sundanese': 'su',
  'swahili': 'sw',
  'swedish': 'sv',
  'tajik': 'tg',
  'tamil': 'ta',
  'telugu': 'te',
  'thai': 'th',
  'turkish': 'tr',
  'ukrainian': 'uk',
  'urdu': 'ur',
  'uzbek': 'uz',
  'vietnamese': 'vi',
  'welsh': 'cy',
  'xhosa': 'xh',
  'yiddish': 'yi',
  'yoruba': 'yo',
  'zulu': 'zu'
};
var langListWithAuto = JSON.parse(JSON.stringify(langList)); //copy lang and add auto
langListWithAuto['Auto'] = "auto";
var toggleList = {
  "on": true,
  "off": false
};
var keyList = {
  "None": null,
  "Ctrl": 17,
  "Alt": 18,
  "Shift": 16
};



var settingList = {
  "useTooltip": {
    "description": "Enable tooltip",
    "optionList": toggleList
  },
  "useTTS": {
    "description": "Enable tts",
    "optionList": toggleList
  },
  "translateSource": {
    "description": "Translate from",
    "optionList": langListWithAuto
  },
  "translateTarget": {
    "description": "Translate to",
    "optionList": langList
  },
  "keyDownTooltip": {
    "description": "Tooltip activation hold key",
    "optionList": keyList
  },
  "keyDownTTS": {
    "description": "tts activation hold key",
    "optionList": keyList
  }
}









var selectedList = {};

function loadSettingHtml() {
  //create optionlist
  var settingHtml = ""
  for (var settingListKey in settingList) {
    settingHtml += '<li class="list-group-item">' + settingList[settingListKey]["description"] + '<select id="' + settingListKey + '">';
    for (var optionListKey in settingList[settingListKey]["optionList"]) {
      settingHtml += '<option value="' + settingList[settingListKey]["optionList"][optionListKey] + '">' + optionListKey + '</option>'
    }
    settingHtml += '</select></li>'
  }
  var container = document.getElementById('container');
  container.innerHTML = container.innerHTML + settingHtml;


  //set selected value and change listner
  for (var settingListKey in settingList) {
    var setting = document.getElementById(settingListKey);
    setting.value = selectedList[settingListKey];
    setting.addEventListener("change", changeSetting);
  }
}

function changeSetting() {
  for (var settingListKey in settingList) {
    selectedList[settingListKey] = document.getElementById(settingListKey).value;
  }
  saveSetting();
}

//load setting from chrome storage
//then, load setting html
document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({
      type: 'loadSetting'
    },
    response => {
      selectedList = response;
      loadSettingHtml();
    }
  );
});

function saveSetting() {
  chrome.runtime.sendMessage({
      type: 'saveSetting',
      options: selectedList
    },
    response => {}
  );
}


/***/ })

/******/ });
//# sourceMappingURL=popup.js.map