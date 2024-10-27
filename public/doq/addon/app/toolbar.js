
import { DOQ } from "./config.js";

export function handleKeyDown(e) {
  if (e.code === "Tab") {
    DOQ.config.readerToolbar.classList.add("tabMode");
  } else if (e.code === "Escape") {
    closeToolbar();
    e.target.blur();
    e.preventDefault();
  }
}

export function closeToolbar(e) {
  const { config } = DOQ;
  const toolbar = config.readerToolbar;

  if (toolbar.contains(e?.target) || e?.target === config.viewReader) {
    return;
  }
  if (!toolbar.classList.contains("hidden")) {
    toggleToolbar();
  }
}

export function toggleToolbar() {
  const { config } = DOQ;
  const hidden = config.readerToolbar.classList.toggle("hidden");

  config.viewReader.classList.toggle("toggled");
  config.viewReader.setAttribute("aria-expanded", !hidden);
  if (hidden) {
    toggleOptions(/*collapse = */true);
  }
}

export function toggleOptions(collapse) {
  const { config } = DOQ;
  const panel = config.readerToolbar.querySelector(".optionsPanel");
  const collapsed = panel.classList.toggle("collapsed", collapse);
  config.optionsToggle.checked = !collapsed;
}

export default function updateToolbarPos() {
  const { config } = DOQ;
  const docWidth = document.documentElement.clientWidth;
  const btnRight = config.viewReader.getBoundingClientRect().right;
  const offset = docWidth - Math.ceil(window.pageXOffset + btnRight);
  config.readerToolbar.style.right = `${offset + 2}px`;
}
