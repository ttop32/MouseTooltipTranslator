// Highlight saved words/phrases on the page using their group color.
//
// Matching is tolerant: whitespace, punctuation and quote differences are
// ignored, and a phrase is matched even when inline tags (<b>, <a>, ...) split
// it across several text nodes. This is required because saved entries are often
// whole sentences (translation results), which almost never appear verbatim in a
// single text node.
//
// Painting uses the CSS Custom Highlight API (Range based) instead of wrapping
// matches in <span>s, so we never mutate the page DOM. That removes the
// observer-feedback loop and avoids breaking page scripts/layout.
//
// Only words whose group is enabled are highlighted; if no group is enabled
// nothing runs (zero cost by default, since groups start disabled).

const STYLE_ID = "mtt-saved-hl-style";
const NAME_PREFIX = "mtt-saved-"; // CSS ::highlight() registration name prefix
const MAX_TEXT_NODES = 8000; // stop scanning very large pages
const MAX_HIGHLIGHTS = 3000; // cap total matched ranges
const OBSERVER_DEBOUNCE = 700; // ms

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "CODE",
  "PRE",
]);

const NON_ALNUM = /[^\p{L}\p{N}]+/gu; // runs of non letters/numbers (unicode aware)
const ALNUM_UNICODE = /[\p{L}\p{N}]/u; // single non-ASCII letter/number test

let currentMap = null; // normalized-lowercased phrase -> color
let matcher = null; // RegExp compiled from currentMap keys (rebuilt only on refresh)
let observer = null;
let debounceId = null;
const colorToName = new Map(); // color -> stable ::highlight() name
const activeNames = new Set(); // names currently registered in CSS.highlights
let nameSeq = 0;

export function refreshSavedWordHighlight(setting) {
  if (!document?.body) return;
  if (!supportsHighlightApi()) return;
  currentMap = buildWordColorMap(setting);
  if (!currentMap.size) {
    matcher = null;
    clearSavedWordHighlight();
    disconnectObserver();
    return;
  }
  matcher = buildMatcher(currentMap);
  paintHighlights();
  connectObserver();
}

export function cleanupSavedWordHighlight() {
  disconnectObserver();
  clearSavedWordHighlight();
  currentMap = null;
  matcher = null;
}

// Remove all our registered highlights + the injected style. No DOM unwrapping
// is needed because we never wrapped anything.
function clearSavedWordHighlight() {
  if (supportsHighlightApi()) {
    for (const name of activeNames) CSS.highlights.delete(name);
  }
  activeNames.clear();
  const style = document.getElementById(STYLE_ID);
  if (style) style.textContent = "";
}

function supportsHighlightApi() {
  return (
    typeof CSS !== "undefined" &&
    !!CSS.highlights &&
    typeof Highlight !== "undefined"
  );
}

function buildWordColorMap(setting) {
  const map = new Map();
  const enabledColor = {}; // groupId -> color
  for (const group of setting?.["wordGroups"] || []) {
    if (group?.enabled) enabledColor[group.id] = group.color;
  }
  if (!Object.keys(enabledColor).length) return map;

  for (const item of setting?.["historyList"] || []) {
    const groupId = item?.groupId ?? 1; // entries without a group default to group 1
    const color = enabledColor[groupId];
    if (!color) continue;
    const phrase = normalizePhrase(item?.sourceText || "");
    if (!phrase) continue;
    map.set(phrase, color);
  }
  return map;
}

// one alternation regex for all phrases; longer phrases first so they win at a
// position. Reused across repaints (matchAll clones, so it is never mutated).
function buildMatcher(map) {
  const phrases = [...map.keys()].sort((a, b) => b.length - a.length);
  return new RegExp(phrases.map(escapeRegExp).join("|"), "gi");
}

// Phrase normalization (no index map needed): collapse every run of non-alnum
// chars to a single space, trim, lowercase. Must stay equivalent to scanPage()'s
// per-char normalization so phrases and page text align.
function normalizePhrase(src) {
  return src.replace(NON_ALNUM, " ").trim().toLowerCase();
}

function isAlnum(ch) {
  const c = ch.charCodeAt(0);
  if (c < 128) {
    return (c > 47 && c < 58) || (c > 64 && c < 91) || (c > 96 && c < 123);
  }
  return ALNUM_UNICODE.test(ch);
}

// Single pass over the page's text nodes producing:
//   norm   - normalized matchable text (non-alnum runs collapsed to one space)
//   map    - map[i] = UTF-16 offset in the concatenated node text for norm[i]
//   chunks - {node, start, len} so an offset can be resolved to (node, offset)
// No intermediate full-page string is allocated.
function scanPage() {
  const nodes = collectTextNodes(document.body);
  const out = [];
  const map = [];
  const chunks = [];
  let base = 0; // absolute offset across all node text
  let prevSpace = true; // drop leading separators; collapse across node boundaries
  for (const node of nodes) {
    const v = node.nodeValue;
    chunks.push({ node, start: base, len: v.length });
    for (let i = 0; i < v.length; i++) {
      const ch = v[i];
      if (isAlnum(ch)) {
        out.push(ch);
        map.push(base + i);
        prevSpace = false;
      } else if (!prevSpace) {
        out.push(" ");
        map.push(base + i);
        prevSpace = true;
      }
    }
    base += v.length;
  }
  if (out.length && out[out.length - 1] === " ") {
    out.pop();
    map.pop();
  }
  return { norm: out.join(""), map, chunks };
}

// Find every saved phrase in the page (across node boundaries) and register
// colored highlights.
function paintHighlights() {
  if (!supportsHighlightApi() || !currentMap?.size || !matcher) return;

  const { norm, map, chunks } = scanPage();
  const byColor = new Map(); // color -> Range[]
  let count = 0;
  for (const m of norm.matchAll(matcher)) {
    if (count >= MAX_HIGHLIGHTS) break;
    const color = currentMap.get(m[0].toLowerCase());
    if (!color) continue;
    const a = locate(map[m.index], chunks); // first matched char
    const b = locate(map[m.index + m[0].length - 1], chunks); // last matched char
    if (!a || !b) continue;
    const range = document.createRange();
    try {
      range.setStart(a.node, a.offset);
      range.setEnd(b.node, b.offset + 1); // end is exclusive -> just past last char
    } catch (e) {
      continue;
    }
    let ranges = byColor.get(color);
    if (!ranges) byColor.set(color, (ranges = []));
    ranges.push(range);
    count++;
  }

  applyHighlightBuckets(byColor);
}

// gather candidate text nodes under root (skips scripts, editable, our tooltip)
function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
      if (parent.closest("#mttContainer")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
    if (nodes.length >= MAX_TEXT_NODES) break;
  }
  return nodes;
}

// binary search the chunk containing absolute offset `oi` -> { node, offset }
function locate(oi, chunks) {
  let lo = 0;
  let hi = chunks.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = chunks[mid];
    if (oi < c.start) hi = mid - 1;
    else if (oi >= c.start + c.len) lo = mid + 1;
    else return { node: c.node, offset: oi - c.start };
  }
  return null;
}

// register one CSS highlight per color and (re)write the ::highlight() styles
function applyHighlightBuckets(byColor) {
  clearSavedWordHighlight(); // drop previous registrations + css
  const rules = [];
  for (const [color, ranges] of byColor) {
    if (!ranges.length) continue;
    let name = colorToName.get(color);
    if (!name) {
      name = NAME_PREFIX + nameSeq++;
      colorToName.set(color, name);
    }
    CSS.highlights.set(name, new Highlight(...ranges));
    activeNames.add(name);
    rules.push(`::highlight(${name}){ background-color: ${color}; }`);
  }
  if (!rules.length) return;
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = rules.join("\n");
}

// re-highlight on dynamic DOM changes (infinite scroll / SPA / pages like Google
// that hydrate & swap the results container after load), debounced. We recompute
// ranges over the whole body; since we never mutate the DOM, there is no feedback
// loop and no need to pause the observer.
function connectObserver() {
  if (observer || !document.body) return;
  observer = new MutationObserver(() => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      if (!currentMap?.size) return;
      paintHighlights();
    }, OBSERVER_DEBOUNCE);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function disconnectObserver() {
  clearTimeout(debounceId);
  observer?.disconnect();
  observer = null;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
