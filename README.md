# Teleprompter

A teleprompter app for [Even Realities](https://evenrealities.com/) smart glasses, built with TypeScript and the Even Hub SDK.

## Setup

```bash
npm install
```

## Run (browser simulator)

```bash
npm run dev
```

Open http://localhost:5173 — press **Space** to start/stop scrolling.

## Test

```bash
npm test
```

## Deploy to glasses

```bash
npm run build
npx @evenrealities/evenhub-cli pack app.json ./dist
```

## Development

We follow strict TDD (see [ADR 0003](docs/adr/0003-tdd-workflow.md)). All changes require a PR with passing tests and at least one approval.
