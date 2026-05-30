// Highlight saved words on the page using their group color.
// Only words whose group is enabled are highlighted; if no group is enabled
// nothing runs (zero cost by default, since the default group starts disabled).

const HIGHLIGHT_CLASS = "mtt-saved-highlight";
const MAX_TEXT_NODES = 8000; // stop scanning very large pages
const MAX_HIGHLIGHTS = 3000; // cap total wrapped matches
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

let currentMap = null; // lowercased word -> color
let observer = null;
let debounceId = null;

export function refreshSavedWordHighlight(setting) {
  if (!document?.body) return;
  clearSavedWordHighlight();
  currentMap = buildWordColorMap(setting);
  if (!currentMap.size) {
    disconnectObserver();
    return;
  }
  withObserverPaused(() => highlightWithin(document.body, currentMap));
  connectObserver();
}

export function cleanupSavedWordHighlight() {
  disconnectObserver();
  clearSavedWordHighlight();
  currentMap = null;
}

export function clearSavedWordHighlight() {
  const spans = document.querySelectorAll("." + HIGHLIGHT_CLASS);
  for (const span of spans) {
    const parent = span.parentNode;
    if (!parent) continue;
    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize();
  }
}

function buildWordColorMap(setting) {
  const map = new Map();
  const enabledColor = {}; // groupId -> color
  for (const group of setting?.["wordGroups"] || []) {
    if (group?.enabled) enabledColor[group.id] = group.color;
  }
  if (!Object.keys(enabledColor).length) return map;

  for (const item of setting?.["historyList"] || []) {
    const groupId = item?.groupId ?? 0;
    const color = enabledColor[groupId];
    if (!color) continue;
    const word = (item?.sourceText || "").trim();
    if (!word) continue;
    map.set(word.toLowerCase(), color);
  }
  return map;
}

// scan text nodes under root and wrap matches; bounded by node/highlight caps
function highlightWithin(root, map) {
  if (!root || !map.size) return;
  const words = [...map.keys()].sort((a, b) => b.length - a.length);
  const regex = new RegExp(words.map(escapeRegExp).join("|"), "gi");

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
      if (parent.closest("." + HIGHLIGHT_CLASS + ", #mttContainer")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // collect first (mutating during walk invalidates the walker)
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
    if (nodes.length >= MAX_TEXT_NODES) {
      console.log("[MTT] saved-word highlight: page too large, truncated");
      break;
    }
  }

  let highlightCount = 0;
  for (const textNode of nodes) {
    if (highlightCount >= MAX_HIGHLIGHTS) {
      console.log("[MTT] saved-word highlight: hit max highlight cap");
      break;
    }
    highlightCount += wrapMatches(textNode, regex, map);
  }
}

function wrapMatches(node, regex, map) {
  const text = node.nodeValue;
  regex.lastIndex = 0;
  const matches = [...text.matchAll(regex)];
  if (!matches.length) return 0;

  const frag = document.createDocumentFragment();
  let last = 0;
  for (const match of matches) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > last) {
      frag.appendChild(document.createTextNode(text.slice(last, start)));
    }
    const span = document.createElement("span");
    span.className = HIGHLIGHT_CLASS;
    span.textContent = match[0];
    span.style.backgroundColor = map.get(match[0].toLowerCase());
    frag.appendChild(span);
    last = end;
  }
  if (last < text.length) {
    frag.appendChild(document.createTextNode(text.slice(last)));
  }
  node.parentNode?.replaceChild(frag, node);
  return matches.length;
}

// re-highlight newly added DOM (infinite scroll / dynamic content), debounced
function connectObserver() {
  if (observer || !document.body) return;
  observer = new MutationObserver((mutations) => {
    const added = [];
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType === Node.ELEMENT_NODE && !isOwnNode(n)) added.push(n);
      }
    }
    if (!added.length) return;
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      if (!currentMap?.size) return;
      withObserverPaused(() => {
        for (const el of added) {
          if (el.isConnected) highlightWithin(el, currentMap);
        }
      });
    }, OBSERVER_DEBOUNCE);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function disconnectObserver() {
  clearTimeout(debounceId);
  observer?.disconnect();
  observer = null;
}

// run a DOM-mutating fn without our own mutations re-triggering the observer
function withObserverPaused(fn) {
  const wasConnected = !!observer;
  observer?.disconnect();
  try {
    fn();
  } finally {
    if (wasConnected && document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

function isOwnNode(el) {
  return (
    el.id === "mttContainer" ||
    el.classList?.contains(HIGHLIGHT_CLASS) ||
    !!el.closest?.("#mttContainer")
  );
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
