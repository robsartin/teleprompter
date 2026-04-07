/**
 * Teleprompter app entry point.
 * Connects to Even Realities glasses via the Even Hub SDK.
 * Falls back to browser display when glasses are not available.
 */

import {
  createState,
  toggleScrolling,
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
  DISPLAY_HEIGHT,
} from "./teleprompter";
import {
  STORAGE_KEY,
  DEFAULT_SETTINGS,
  serializeSettings,
  deserializeSettings,
  mergeSettings,
  type Settings,
} from "./storage";

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

// --- Browser fallback UI ---
const scriptEl = document.getElementById("script-text")!;
const statusEl = document.getElementById("status")!;

function renderBrowser() {
  scriptEl.innerHTML = "";
  for (const line of annotatedLines(state)) {
    const div = document.createElement("div");
    div.textContent = line.text || "\u00A0"; // non-breaking space for empty lines
    div.style.color = line.isCurrent ? "#fff" : "#888";
    scriptEl.appendChild(div);
  }
  const elapsed = formatTime(elapsedSeconds(state));
  const remaining = formatTime(remainingSeconds(state));
  statusEl.textContent = state.scrolling
    ? `▶ ${state.speedWpm} WPM | ${elapsed} / -${remaining}`
    : `⏸ | ${elapsed} / -${remaining}`;
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    state = toggleScrolling(state);
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

// --- Even Hub glasses UI ---
async function initGlasses() {
  try {
    const {
      waitForEvenAppBridge,
    } = await import("@evenrealities/even_hub_sdk");

    const bridge = await waitForEvenAppBridge();

    // Sync settings with glasses localStorage
    await initGlassesStorage(bridge);

    // Create a single text container filling the display
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
          content: visibleText(state),
          isEventCapture: 1,
        },
      ],
    });

    if (result !== 0) {
      console.error("Failed to create glasses container:", result);
      return;
    }

    // Listen for tap events to toggle scrolling
    bridge.onEvenHubEvent((event) => {
      if (event.textEvent || event.sysEvent) {
        state = toggleScrolling(state);
      }
    });

    // Update glasses text on each tick
    setInterval(async () => {
      const text = visibleText(state);
      await bridge.textContainerUpgrade({
        containerID: 1,
        containerName: "prompt",
        contentOffset: 0,
        contentLength: text.length,
        content: text,
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
