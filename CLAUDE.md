# Teleprompter — Claude Code Guide

## Project Overview

A teleprompter app for Even Realities G1/G2 smart glasses, built with TypeScript, Vite, and the Even Hub SDK. Runs in the browser as a simulator and deploys to glasses via the Even Hub platform.

## Tech Stack

- **TypeScript** + **Vite** — dev server and build
- **@evenrealities/even_hub_sdk** — glasses communication
- **Vitest** — test runner
- **Even Hub CLI** — packaging and deployment

## Architecture

Pure-function core (`src/teleprompter.ts`) with no side effects. UI layer (`src/main.ts`) connects core to browser DOM and Even Hub bridge. Supporting modules are each a single-file pure-function library with its own test file.

## Key Files

| File | Purpose |
|------|---------|
| `src/teleprompter.ts` | Core state machine — all pure functions |
| `src/main.ts` | Entry point — browser UI + glasses bridge |
| `src/storage.ts` | Settings persistence (localStorage) |
| `src/loader.ts` | Script loading from URL params |
| `src/gestures.ts` | Glasses gesture → action mapping |
| `src/connection.ts` | Glasses connection status tracking |
| `src/markdown.ts` | Markdown parsing (bold, italic, headings) |
| `src/settings-url.ts` | Settings URL encoding/decoding for sharing |

## Development Workflow

**Strict TDD** (ADR 0003): write failing test → implement → commit → refactor → commit → repeat.

**All changes via PR.** Branch protection requires 1 approval + passing CI.

## Commands

```bash
npm install        # install deps
npm run dev        # browser simulator at localhost:5173
npm test           # run vitest
npm run build      # production build
```

## Testing

163+ tests across 9 test files. Each `src/*.ts` module has a corresponding `tests/*.test.ts`. Run `npm test` before every commit.

## Conventions

- Pure functions in `src/teleprompter.ts` — no side effects, no DOM, no SDK
- State is immutable — functions return new state objects
- `_` prefix on internal state fields (`_lineFrac`, `_wordCount`)
- ASCII-only in glasses text (LVGL has limited glyph support)
- Browser UI can use Unicode emoji; glasses text cannot
