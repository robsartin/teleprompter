# Architecture

## System Overview

```mermaid
graph TB
    subgraph Browser["Browser Simulator"]
        HTML[index.html]
        DOM[DOM Renderer]
        KB[Keyboard Events]
    end

    subgraph Core["Pure Logic Layer"]
        TP[teleprompter.ts<br/>State Machine]
        ST[storage.ts<br/>Settings]
        LD[loader.ts<br/>URL Loader]
        GE[gestures.ts<br/>Gesture Mapping]
        CN[connection.ts<br/>Connection Status]
        MD[markdown.ts<br/>Markdown Parser]
        SU[settings-url.ts<br/>URL Sharing]
    end

    subgraph Glasses["Even Realities Glasses"]
        SDK[Even Hub SDK]
        BLE[BLE Bridge]
        DISP[Glasses Display<br/>576x288]
    end

    MAIN[main.ts<br/>Entry Point]

    KB --> MAIN
    MAIN --> TP
    MAIN --> DOM
    MAIN --> SDK
    SDK --> BLE --> DISP
    MAIN --> ST
    MAIN --> LD
    MAIN --> GE
    MAIN --> CN
    MAIN --> SU
```

## State Machine

The core of the app is a pure state machine in `teleprompter.ts`. All state transitions are pure functions that take the current state and return a new state.

```mermaid
stateDiagram-v2
    [*] --> Paused: createState()
    Paused --> Countdown: startCountdown()
    Countdown --> Scrolling: countdown reaches 0
    Countdown --> Paused: toggleScrolling() cancels
    Scrolling --> Paused: toggleScrolling()
    Scrolling --> Finished: last line reached
    Paused --> Paused: restart()
    Scrolling --> Paused: restart()
    Finished --> Paused: restart()
    Countdown --> Paused: restart()
```

## State Shape

```mermaid
classDiagram
    class TeleprompterState {
        +string[] lines
        +boolean scrolling
        +number speedWpm
        +number lineIndex
        +number _lineFrac
        +number elapsedTicks
        +number countdown
        +number _wordCount
    }

    class AnnotatedLine {
        +string text
        +boolean isCurrent
    }

    TeleprompterState --> AnnotatedLine : annotatedLines()
```

## Data Flow

```mermaid
flowchart LR
    subgraph Input
        SPACE[Space Key]
        ARROWS[Arrow Keys]
        TAP[Glasses Tap]
        PASTE[Paste Event]
        URL[URL Params]
    end

    subgraph Processing
        STATE[TeleprompterState]
        TICK[tick @ 60fps]
    end

    subgraph Output
        BDOM[Browser DOM<br/>7 visible lines]
        GLASS[Glasses Text<br/>Container @ 500ms]
        STATUS[Status Bar<br/>WPM / Time]
        LSTOR[localStorage]
    end

    SPACE --> STATE
    ARROWS --> STATE
    TAP --> STATE
    PASTE --> STATE
    URL --> STATE
    TICK --> STATE
    STATE --> BDOM
    STATE --> GLASS
    STATE --> STATUS
    STATE --> LSTOR
```

## Module Dependencies

```mermaid
graph LR
    main --> teleprompter
    main --> storage
    main --> loader
    main --> gestures
    main --> connection
    main --> settings-url
    main --> even_hub_sdk

    style teleprompter fill:#2d5,stroke:#fff,color:#fff
    style main fill:#d52,stroke:#fff,color:#fff
    style even_hub_sdk fill:#25d,stroke:#fff,color:#fff
```

Green = pure logic (no side effects), Red = entry point (side effects), Blue = external SDK.

## Rendering Pipeline

### Browser (60fps)

1. `tick(state)` advances state
2. If state changed (reference check), `renderBrowser()` runs:
   - Clear `#script-text` innerHTML
   - Create `<div>` per visible line (7 lines)
   - Apply highlight to current line (white, larger, left border)
   - Apply `translateY` for smooth sub-pixel scrolling via `_lineFrac`
   - Update status bar text

### Glasses (500ms interval)

1. Build `glassesContent()` = script text + status line
2. Skip if content string unchanged since last push
3. Send via `bridge.textContainerUpgrade()`

## Display Constraints

| Property | Value |
|----------|-------|
| Canvas width | 576px |
| Canvas height | 288px |
| Max text per container | 2000 chars |
| Max containers per page | 4 |
| Text encoding | ASCII only (LVGL limitation) |
| Line width | 40 chars (CHARS_PER_LINE) |
