/**
 * Teleprompter app entry point.
 * Connects to Even Realities glasses via the Even Hub SDK.
 * Falls back to browser display when glasses are not available.
 */

import {
  createState,
  toggleScrolling,
  startCountdown,
  countdownText,
  setSpeed,
  tick as tickState,
  visibleText,
  annotatedLines,
  restart,
  formatTime,
  elapsedSeconds,
  remainingSeconds,
  SAMPLE_TEXT,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,\n  readTimeText,
} from "./teleprompter";
import { parseScriptUrl, isValidUrl } from "./loader";
import {
  STORAGE_KEY,
  DEFAULT_SETTINGS,
  serializeSettings,
  deserializeSettings,
  mergeSettings,
  type Settings,
} from "./storage";
import { mapEventToAction } from "./gestures";

// --- Load persisted settings ---
function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    return mergeSettings(deserializeSettings(raw), DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeSettings(settings));
  } catch {
    // localStorage may be unavailable — silently ignore
  }
}

const initialSettings = loadSettings();
let state = setSpeed(toggleScrolling(createState(SAMPLE_TEXT)), initialSettings.speedWpm);

// --- Load script from URL param ---
async function loadScriptFromUrl() {
  const url = parseScriptUrl(window.location.search);
  if (url && isValidUrl(url)) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        state = setSpeed(toggleScrolling(createState(text)), state.speedWpm);
      }
    } catch {
      // Fetch failed — keep default script
    }
  }
}

loadScriptFromUrl();

// --- Paste handler ---
document.addEventListener("paste", (e) => {
  const text = e.clipboardData?.getData("text/plain");
  if (text) {
    state = setSpeed(createState(text), state.speedWpm);
  }
});

// --- Browser fallback UI ---
const scriptEl = document.getElementById("script-text")!;
const statusEl = document.getElementById("status")!;

function renderBrowser() {
  const cdText = countdownText(state);
  if (cdText) {
    scriptEl.innerHTML = "";
    const div = document.createElement("div");
    div.textContent = cdText;
    div.style.color = "#fff";
    div.style.fontSize = "48px";
    div.style.textAlign = "center";
    scriptEl.appendChild(div);
    statusEl.textContent = "⏳";
  } else {
    scriptEl.innerHTML = "";
    for (const line of annotatedLines(state, 7)) {
      const div = document.createElement("div");
      div.textContent = line.text || "\u00A0";
      div.style.color = line.isCurrent ? "#fff" : "#555";
      if (line.isCurrent) {
        div.style.fontSize = "28px";
        div.style.borderLeft = "3px solid #fff";
        div.style.paddingLeft = "8px";
      }
      scriptEl.appendChild(div);
    }
    const elapsed = formatTime(elapsedSeconds(state));
    const remaining = formatTime(remainingSeconds(state));
    statusEl.textContent = state.scrolling
      ? `▶ ${state.speedWpm} WPM | ${elapsed} / -${remaining}`
      : `⏸ | ${elapsed} / -${remaining}`;
  }
}

document.addEventListener("dblclick", () => {
  state = restart(state);
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (state.countdown > 0) {
      state = toggleScrolling(state);
    } else if (state.scrolling) {
      state = toggleScrolling(state);
    } else {
      state = startCountdown(state);
    }
  }
  if (e.code === "KeyR") {
    state = restart(state);
  }
  if (e.code === "ArrowUp") {
    state = setSpeed(state, state.speedWpm + 10);
    saveSettings({ speedWpm: state.speedWpm });
  }
  if (e.code === "ArrowDown") {
    state = setSpeed(state, state.speedWpm - 10);
    saveSettings({ speedWpm: state.speedWpm });
  }
});

function glassesStatusText(): string {
  const elapsed = formatTime(elapsedSeconds(state));
  const remaining = formatTime(remainingSeconds(state));
  return state.scrolling
    ? `> ${state.speedWpm} WPM | ${elapsed} / -${remaining}`
    : `|| ${state.speedWpm} WPM | ${elapsed} / -${remaining}`;
}

function glassesContent(): string {
  return visibleText(state) + "\n\n" + glassesStatusText();
}

// --- Even Hub glasses UI ---
async function initGlasses() {
  try {
    const {
      waitForEvenAppBridge,
    } = await import("@evenrealities/even_hub_sdk");

    const bridge = await waitForEvenAppBridge();

    // Sync settings with glasses localStorage
    await initGlassesStorage(bridge);

    // Create a single text container — append status to script text
    const result = await bridge.createStartUpPageContainer({
      containerTotalNum: 1,
      textObject: [
        {
          xPosition: 0,
          yPosition: 0,
          width: DISPLAY_WIDTH,
          height: DISPLAY_HEIGHT,
          containerID: 1,
          containerName: "prompt",
          content: glassesContent(),
          isEventCapture: 1,
        },
      ],
    });

    if (result !== 0) {
      console.error("Failed to create glasses container:", result);
      return;
    }

    // Listen for tap/gesture events on the glasses
    bridge.onEvenHubEvent((event) => {
      const action = mapEventToAction(event);
      switch (action) {
        case "toggle":
          state = toggleScrolling(state);
          break;
        case "restart":
          state = restart(state);
          break;
        case "speed_up":
          state = setSpeed(state, state.speedWpm + 10);
          saveSettings({ speedWpm: state.speedWpm });
          break;
        case "speed_down":
          state = setSpeed(state, state.speedWpm - 10);
          saveSettings({ speedWpm: state.speedWpm });
          break;
      }
    });

    // Update glasses text on each tick
    setInterval(async () => {
      const content = glassesContent();
      await bridge.textContainerUpgrade({
        containerID: 1,
        containerName: "prompt",
        contentOffset: 0,
        contentLength: content.length,
        content,
      });
    }, 500);
  } catch {
    // Not running in Even App — browser-only mode
  }
}

// --- Even Hub glasses localStorage sync ---
async function initGlassesStorage(bridge: { getLocalStorage?: (key: string) => Promise<string | null>; setLocalStorage?: (key: string, value: string) => Promise<void> }): Promise<void> {
  try {
    if (bridge.getLocalStorage) {
      const raw = await bridge.getLocalStorage(STORAGE_KEY);
      if (raw !== null) {
        const saved = mergeSettings(deserializeSettings(raw), DEFAULT_SETTINGS);
        state = setSpeed(state, saved.speedWpm);
      }
    }
    // Save current settings to glasses storage
    if (bridge.setLocalStorage) {
      await bridge.setLocalStorage(STORAGE_KEY, serializeSettings({ speedWpm: state.speedWpm }));
    }
  } catch {
    // glasses storage unavailable — silently ignore
  }
}

// --- Main loop ---
function loop() {
  state = tickState(state);
  renderBrowser();
  requestAnimationFrame(loop);
}

initGlasses();
requestAnimationFrame(loop);
