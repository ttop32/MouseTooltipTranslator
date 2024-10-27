
import { DOQ, wrapCanvas, addColorScheme, setCanvasTheme } from "./engine.js";

async function init(themes) {
  if (DOQ.initialized)
    return;

  if (themes === undefined) {
    themes = await loadThemes("colors.json");
  } else if (!Array.isArray(themes)) {
    throw new Error("doq: argument 'themes' must be an array");
  }
  themes.forEach(addTheme);

  try {
    wrapCanvas();
  } catch (e) {
    throw new Error(`doq: unable to modify Canvas API: ${e.message}`);
  }
  DOQ.initialized = true;
}

async function loadThemes(path) {
  let themes = [];
  try {
    const url = new URL(path, import.meta.url);
    themes = await fetch(url).then(response => response.json());
  } catch (e) {
    console.error(`doq: failed to load default themes: ${e.message}`);
  }
  return themes;
}

function addTheme(theme) {
  if (!theme.tones?.length) {
    throw new Error("doq: a theme should have at least one tone!");
  }
  try {
    addColorScheme(theme);
  } catch (e) {
    throw new Error(`doq: failed to add theme: ${e.message}`);
  }
}

function setTheme(arg) {
  let scheme, tone;
  if (Array.isArray(arg)) {
    arg = arg.splice(0, 2);
    [scheme, tone] = arg;

    if (!DOQ.colorSchemes[scheme]?.tones[tone]) {
      throw new Error(`doq: no theme at index (${arg})`);
    }
  } else if (typeof arg === "string") {
    const args = arg.trim().split(/\s+/);
    [scheme, tone] = getIndex(...args);

    if (scheme < 0 || tone < 0) {
      throw new Error(`doq: no such theme: "${arg}"`);
    }
  } else {
    throw new Error("doq: argument must be array or string");
  }
  setCanvasTheme(scheme, tone);
  DOQ.flags.engineOn = true;
}

function getIndex(schemeName, toneName) {
  const { colorSchemes } = DOQ;
  let scheme, tone = 0;

  scheme = colorSchemes.find(e => e.name === schemeName);
  if (scheme && toneName) {
    tone = scheme.tones.findIndex(e => e.name === toneName);
  }
  scheme = colorSchemes.indexOf(scheme);
  return [scheme, tone];
}

function enable() {
  if (!DOQ.initialized) {
    throw new Error("doq: initialize with DOQ.init() before enabling");
  }
  if (!DOQ.colorSchemes.length) {
    throw new Error("doq: cannot start theme engine: no themes found!");
  }
  DOQ.flags.engineOn = true;
}

function disable() {
  DOQ.flags.engineOn = false;
}

export { init, addTheme, setTheme, enable, disable };
