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
// 1200 was more than bing accepts (it takes google/yandex sized batches but
// fails from ~1200 chars up), so a bing user could never translate a page and
// google's fallback to bing failed the same way. 700 is under every engine's
// limit as measured against the live endpoints.
// measured in utf-8 bytes, not characters: 700 CJK characters are ~2100 bytes
// and would blow the same limit we are trying to stay under
const MAX_BATCH_BYTES = 700;
const MAX_REQUESTS = 2000; // hard stop, the wall clock below is what usually ends a run
const MAX_DURATION_MS = 120 * 1000; // a page translate should not run for minutes
const BATCH_PAUSE_MS = 80; // keep the engines from rate limiting us
const NODE_REQUEST_WINDOW = 4; // parallel single-node requests in the fallback
const MAX_CONSECUTIVE_FAILURES = 3; // engine down or throttling: stop asking

let isTranslated = false;
let originals = []; // [{ node, text }] for revert
let busy = false;
let requestCount = 0;
let consecutiveFailures = 0;
let aborted = false;
let cancelled = false; // a second toggle while running
let startedAt = 0;
// bing answers a newline-joined batch as a single line, so the batch request is
// pure waste there: after the first mismatch, go straight to per-node
let batchingUseless = false;
const encoder = new TextEncoder();
const byteLen = (text) => encoder.encode(text).length;

export async function togglePageTranslate(setting) {
  if (busy) {
    cancelled = true; // second press: stop the run instead of ignoring the key
    return;
  }
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

function canRequest() {
  return (
    !aborted &&
    !cancelled &&
    requestCount < MAX_REQUESTS &&
    Date.now() - startedAt < MAX_DURATION_MS
  );
}

// A failure used to fan out into one request per text node, so a throttled
// engine turned a single page into thousands of calls that all came back
// "<engine> is broken". Stop instead, once, with a reason in the console.
function abortRun(reason) {
  if (aborted) return;
  aborted = true;
  console.log("MouseTooltipTranslator: page translate stopped - " + reason);
}

// trackConsecutive is false for the parallel window: those results settle in
// latency order (failures come back first), so a run of them says nothing about
// the engine on its own - runWithWindow reports the window as one outcome.
function noteResult(ok, trackConsecutive) {
  requestCount++;
  if (!trackConsecutive) return;
  noteOutcome(ok);
}

// the brake: MAX_CONSECUTIVE_FAILURES outcomes in a row with nothing translated
function noteOutcome(ok) {
  if (ok) {
    consecutiveFailures = 0;
    return;
  }
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    abortRun("the translator engine kept failing");
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestOnce(text, targetLang, trackConsecutive = true) {
  if (!canRequest()) return null;
  try {
    const res = await util.requestTranslate(text, "auto", targetLang, "null");
    const ok = Boolean(res && !res.isBroken && res.targetText);
    noteResult(ok, trackConsecutive);
    return ok ? res : null;
  } catch (e) {
    console.log(e);
    noteResult(false, trackConsecutive);
    return null;
  }
}

// A long text node is bigger than any batch, and bing rejects long payloads,
// so slice it on word boundaries and stitch the answers back together.
// Each piece carries the separator that was cut away with it: engines trim
// their answer, so joining the results back with "" would glue the last word of
// one piece to the first word of the next (and adding a space unconditionally
// would insert one into languages that don't use them).
function splitLongText(text, maxBytes) {
  const pieces = [];
  let rest = text;
  while (byteLen(rest) > maxBytes) {
    // shrink until the piece fits in bytes, then back off to a word boundary
    let end = Math.min(rest.length, maxBytes);
    while (end > 1 && byteLen(rest.slice(0, end)) > maxBytes) {
      end = Math.floor(end * 0.8);
    }
    // end is a utf-16 index: stepping back off a lone high surrogate keeps an
    // emoji (or any astral character) from being split into two broken halves
    if (end > 1 && /[\uD800-\uDBFF]/.test(rest[end - 1])) {
      end -= 1;
    }
    const spaceAt = rest.lastIndexOf(" ", end);
    const atSpace = spaceAt > 0;
    const cut = atSpace ? spaceAt : end;
    pieces.push({ text: rest.slice(0, cut), separator: atSpace ? " " : "" });
    rest = rest.slice(atSpace ? cut + 1 : cut);
  }
  if (rest) pieces.push({ text: rest, separator: "" });
  return pieces;
}

async function translateLongNode(node, targetLang) {
  let out = "";
  for (const piece of splitLongText(node.nodeValue, MAX_BATCH_BYTES)) {
    if (!canRequest()) return;
    const r = await requestOnce(piece.text, targetLang);
    if (!r) return; // keep the node untouched rather than half translated
    out += r.targetText + piece.separator;
  }
  replaceText(node, out);
}

async function translatePage(setting) {
  const targetLang = setting["translateTarget"];
  const nodes = collectTextNodes();
  isTranslated = true;
  originals = [];
  requestCount = 0;
  consecutiveFailures = 0;
  aborted = false;
  cancelled = false;
  batchingUseless = false;
  startedAt = Date.now();

  let batch = [];
  let len = 0;
  let stoppedEarly = false;
  for (const node of nodes) {
    if (!canRequest()) {
      stoppedEarly = true;
      break;
    }
    const size = byteLen(node.nodeValue);
    if (len + size > MAX_BATCH_BYTES && batch.length) {
      await translateBatch(batch, targetLang);
      await wait(BATCH_PAUSE_MS);
      batch = [];
      len = 0;
    }
    if (size > MAX_BATCH_BYTES) {
      await translateLongNode(node, targetLang); // never fits in a batch
      await wait(BATCH_PAUSE_MS);
      continue;
    }
    batch.push(node);
    len += size;
  }
  if (batch.length) {
    if (canRequest()) {
      await translateBatch(batch, targetLang);
    } else {
      stoppedEarly = true;
    }
  }
  if (stoppedEarly && !aborted && !cancelled) {
    console.log(
      "MouseTooltipTranslator: page translate stopped early (request or time budget); the rest of the page was left untranslated"
    );
  }
}

async function translateBatch(group, targetLang) {
  let parts = null;
  if (!batchingUseless || group.length === 1) {
    // one request per batch: each node's text on its own line
    const joined = group.map((n) => n.nodeValue.replace(/\n/g, " ")).join("\n");
    const res = await requestOnce(joined, targetLang);
    if (res) {
      const split = res.targetText.split("\n");
      if (split.length === group.length) {
        parts = split;
      } else if (split.length === 1 && group.length > 1) {
        // the engine threw the line breaks away (bing does this), so the batch
        // request is pure waste from here on. Only this exact signature counts:
        // an off-by-one from a trailing newline is a normal per-batch fallback
        // and must not switch the whole run to per-node.
        batchingUseless = true;
      }
    }
  }

  if (parts) {
    group.forEach((node, i) => replaceText(node, parts[i]));
    return;
  }
  // line count mismatch (or failure): translate each node on its own. bing
  // collapses newlines, so this path is normal there; everything else in this
  // file is sequential, which made a per-node run crawl into the time budget -
  // a small window keeps the engine busy without becoming the old storm.
  await runWithWindow(group, NODE_REQUEST_WINDOW, async (node) => {
    if (!canRequest()) return false;
    const r = await requestOnce(node.nodeValue, targetLang, false);
    if (!r) return false;
    replaceText(node, r.targetText);
    return true;
  });
}

// fn resolves to whether that item was translated. Each window reports one
// outcome into the shared brake, so a batch failure that the per-node path
// recovers from does not accumulate towards an abort.
async function runWithWindow(items, windowSize, fn) {
  for (let i = 0; i < items.length; i += windowSize) {
    if (!canRequest()) return;
    const slice = items.slice(i, i + windowSize);
    const results = await Promise.all(slice.map((item) => fn(item)));
    if (results.length) {
      noteOutcome(results.some(Boolean));
    }
    await wait(BATCH_PAUSE_MS); // same pacing the batch path gets
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
