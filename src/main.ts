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
  tick as tickState,
  visibleText,
  annotatedLines,
  restart,
  SAMPLE_TEXT,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
} from "./teleprompter";

let state = toggleScrolling(createState(SAMPLE_TEXT));

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
    for (const line of annotatedLines(state)) {
      const div = document.createElement("div");
      div.textContent = line.text || "\u00A0";
      div.style.color = line.isCurrent ? "#fff" : "#888";
      scriptEl.appendChild(div);
    }
    statusEl.textContent = state.scrolling ? `▶ ${state.speedWpm} WPM` : "⏸";
  }
}

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
});

// --- Even Hub glasses UI ---
async function initGlasses() {
  try {
    const {
      waitForEvenAppBridge,
    } = await import("@evenrealities/even_hub_sdk");

    const bridge = await waitForEvenAppBridge();

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

// --- Main loop ---
function loop() {
  state = tickState(state);
  renderBrowser();
  requestAnimationFrame(loop);
}

initGlasses();
requestAnimationFrame(loop);
