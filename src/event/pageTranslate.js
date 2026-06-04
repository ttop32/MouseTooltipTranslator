// Full-page in-place translation (#177).
//
// Toggle: translate every visible text node through the normal translate
// pipeline and replace the text in place; toggle again to restore the originals.
// Text is batched (newline-joined) per request to limit API calls; if the
// translated line count doesn't match the batch, it falls back to per-node.
import * as util from "/src/util";

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
const MAX_TEXT_NODES = 6000; // stop scanning very large pages
const MAX_BATCH_CHARS = 1200; // keep request (and gtx GET url) within limits

let isTranslated = false;
let originals = []; // [{ node, text }] for revert
let busy = false;

export async function togglePageTranslate(setting) {
  if (busy) return;
  busy = true;
  try {
    if (isTranslated) {
      revertPage();
    } else {
      await translatePage(setting);
    }
  } catch (e) {
    console.log(e);
  } finally {
    busy = false;
  }
}

function collectTextNodes() {
  if (!document.body) return [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
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

async function translatePage(setting) {
  const targetLang = setting["translateTarget"];
  const nodes = collectTextNodes();
  isTranslated = true;
  originals = [];

  let batch = [];
  let len = 0;
  for (const node of nodes) {
    const size = node.nodeValue.length;
    if (len + size > MAX_BATCH_CHARS && batch.length) {
      await translateBatch(batch, targetLang);
      batch = [];
      len = 0;
    }
    batch.push(node);
    len += size;
  }
  if (batch.length) {
    await translateBatch(batch, targetLang);
  }
}

async function translateBatch(group, targetLang) {
  // one request per batch: each node's text on its own line
  const joined = group.map((n) => n.nodeValue.replace(/\n/g, " ")).join("\n");
  let parts = null;
  try {
    const res = await util.requestTranslate(joined, "auto", targetLang, "null");
    if (res && !res.isBroken && res.targetText) {
      const split = res.targetText.split("\n");
      if (split.length === group.length) parts = split;
    }
  } catch (e) {
    console.log(e);
  }

  if (parts) {
    group.forEach((node, i) => replaceText(node, parts[i]));
    return;
  }
  // line count mismatch (or failure): translate each node on its own
  for (const node of group) {
    try {
      const r = await util.requestTranslate(node.nodeValue, "auto", targetLang, "null");
      if (r && !r.isBroken && r.targetText) replaceText(node, r.targetText);
    } catch (e) {
      console.log(e);
    }
  }
}

function replaceText(node, translated) {
  if (!node.isConnected || translated == null) return;
  originals.push({ node, text: node.nodeValue });
  node.nodeValue = translated;
}

function revertPage() {
  for (const { node, text } of originals) {
    if (node.isConnected) node.nodeValue = text;
  }
  originals = [];
  isTranslated = false;
}
