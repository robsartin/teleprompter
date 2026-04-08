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
  readTimeText,
  scrollPixelOffset,
  SAMPLE_TEXT,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
  type TeleprompterState,
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
import { decodeSettingsFromParams, buildShareUrl } from "./settings-url";
import { mapEventToAction } from "./gestures";
import {
  DEFAULT_CONNECTION,
  formatConnectionStatus,
  type ConnectionInfo,
} from "./connection";

const LINE_HEIGHT_PX = 24 * 1.6;

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
  } catch {}
}

function loadScript(text: string, speedWpm: number): TeleprompterState {
  return setSpeed(toggleScrolling(createState(text)), speedWpm);
}

function adjustSpeed(delta: number): void {
  state = setSpeed(state, state.speedWpm + delta);
  saveSettings({ speedWpm: state.speedWpm });
}

function formatStatus(playIcon: string, pauseIcon: string): string {
  const elapsed = formatTime(elapsedSeconds(state));
  const remaining = formatTime(remainingSeconds(state));
  const conn = formatConnectionStatus(connectionInfo);
  return state.scrolling
    ? `${playIcon} ${state.speedWpm} WPM | ${elapsed} / -${remaining} | ${conn}`
    : `${pauseIcon} ${readTimeText(state)} | ${conn}`;
}

const urlSettings = decodeSettingsFromParams(window.location.search);
const initialSettings = loadSettings();
const effectiveSpeed = urlSettings.speedWpm ?? initialSettings.speedWpm;
let state = loadScript(SAMPLE_TEXT, effectiveSpeed);
let connectionInfo: ConnectionInfo = DEFAULT_CONNECTION;
let prevState: TeleprompterState | null = null;

async function loadScriptFromUrl() {
  const url = parseScriptUrl(window.location.search);
  if (url && isValidUrl(url)) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        state = loadScript(await response.text(), state.speedWpm);
      }
    } catch {}
  }
}

loadScriptFromUrl();

document.addEventListener("paste", (e) => {
  const text = e.clipboardData?.getData("text/plain");
  if (text) state = setSpeed(createState(text), state.speedWpm);
});

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
    scriptEl.style.transform = "";
  } else {
    scriptEl.innerHTML = "";
    const offset = scrollPixelOffset(state, LINE_HEIGHT_PX);
    scriptEl.style.transform = `translateY(-${offset}px)`;
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
    statusEl.textContent = formatStatus("▶", "⏸");
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
  if (e.code === "KeyR") state = restart(state);
  if (e.code === "ArrowUp") adjustSpeed(10);
  if (e.code === "ArrowDown") adjustSpeed(-10);
  if (e.code === "KeyS") {
    const url = buildShareUrl(window.location.origin + window.location.pathname, { speedWpm: state.speedWpm });
    navigator.clipboard.writeText(url).catch(() => {});
  }
});

function glassesContent(): string {
  return visibleText(state) + "\n\n" + formatStatus(">", "||");
}

async function initGlasses() {
  try {
    const { waitForEvenAppBridge } = await import("@evenrealities/even_hub_sdk");
    const bridge = await waitForEvenAppBridge();
    connectionInfo = { state: "connected" };

    if (bridge.onDeviceStatusChanged) {
      bridge.onDeviceStatusChanged((status: { batteryLevel?: number; connected?: boolean }) => {
        connectionInfo = status.connected === false
          ? { state: "disconnected" }
          : { state: "connected", batteryLevel: status.batteryLevel };
      });
    }

    await initGlassesStorage(bridge);

    const result = await bridge.createStartUpPageContainer({
      containerTotalNum: 1,
      textObject: [{
        xPosition: 0, yPosition: 0,
        width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT,
        containerID: 1, containerName: "prompt",
        content: glassesContent(), isEventCapture: 1,
      }],
    });

    if (result !== 0) return;

    bridge.onEvenHubEvent((event) => {
      const action = mapEventToAction(event);
      if (action === "toggle") state = toggleScrolling(state);
      else if (action === "restart") state = restart(state);
      else if (action === "speed_up") adjustSpeed(10);
      else if (action === "speed_down") adjustSpeed(-10);
    });

    let lastGlassesContent = "";
    setInterval(async () => {
      const content = glassesContent();
      if (content === lastGlassesContent) return;
      lastGlassesContent = content;
      await bridge.textContainerUpgrade({
        containerID: 1, containerName: "prompt",
        contentOffset: 0, contentLength: content.length, content,
      });
    }, 500);
  } catch {}
}

async function initGlassesStorage(bridge: {
  getLocalStorage?: (key: string) => Promise<string | null>;
  setLocalStorage?: (key: string, value: string) => Promise<void>;
}): Promise<void> {
  try {
    if (bridge.getLocalStorage) {
      const raw = await bridge.getLocalStorage(STORAGE_KEY);
      if (raw !== null) {
        const saved = mergeSettings(deserializeSettings(raw), DEFAULT_SETTINGS);
        state = setSpeed(state, saved.speedWpm);
      }
    }
    if (bridge.setLocalStorage) {
      await bridge.setLocalStorage(STORAGE_KEY, serializeSettings({ speedWpm: state.speedWpm }));
    }
  } catch {}
}

function loop() {
  const newState = tickState(state);
  if (newState !== state) {
    state = newState;
    renderBrowser();
  }
  requestAnimationFrame(loop);
}

initGlasses();
renderBrowser();
requestAnimationFrame(loop);
