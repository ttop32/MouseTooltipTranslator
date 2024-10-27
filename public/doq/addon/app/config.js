
import { DOQ } from "../lib/engine.js";

Object.assign(DOQ, {
  config: {},
  preferences: {},
  options: {
    autoReader: true,
    dynamicTheme: true,
    softwareRender: false,
    filterCSS: ""
  }
});

/* CSS filter syntax: BOL [<filter-function>(<args>)<spaces-or-eol>]+ EOL */
const filterRegEx =
  /^((brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia)\([^\)]+\)(\s+|$))+$/;

function getDefaultPrefs() {
  return {
    scheme: 0, tone: "0",
    flags: { shapesOn: true, imagesOn: true }
  };
}

function initConfig() {
  const config = getAddonConfig();
  DOQ.colorSchemes.forEach(scheme => {
    config.schemeSelector.appendChild(new Option(scheme.name));
  });

  /* Legacy PDF.js support */
  const pdfjsVer = pdfjsLib.version.split(".").map(Number);
  if (pdfjsVer[0] < 3) {
    if (pdfjsVer[0] < 2 || pdfjsVer[1] < 10) {
      console.warn("doq: unsupported PDF.js version " + pdfjsLib.version);
    }
    config.viewReader.classList.add("pdfjsLegacy");
    config.readerToolbar.classList.add("pdfjsLegacy");
  }
  DOQ.config = config;
}

function getAddonConfig() {
  return {
    sysTheme: window.matchMedia("(prefers-color-scheme: light)"),
    docStyle: document.documentElement.style,
    viewReader: document.getElementById("viewReader"),
    readerToolbar: document.getElementById("readerToolbar"),
    schemeSelector: document.getElementById("schemeSelect"),
    tonePicker: document.getElementById("tonePicker"),
    shapeToggle: document.getElementById("shapeEnable"),
    imageToggle: document.getElementById("imageEnable"),
    optionsToggle: document.getElementById("optionsToggle"),
    viewerClassList: document.getElementById("outerContainer").classList,
    viewer: document.getElementById("viewerContainer")
  };
}

export { DOQ, initConfig, getDefaultPrefs, filterRegEx };
