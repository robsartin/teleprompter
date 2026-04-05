# ADR 0004: Use TypeScript with Even Realities Even Hub SDK

## Status

Accepted (supersedes ADR 0002)

## Context

The teleprompter's primary target is Even Realities smart glasses (G1/G2). The Even Hub platform requires web-based apps built with HTML/CSS/TypeScript and packaged via the Even Hub CLI. We need to align our tech stack with this platform.

## Decision

We will use:

- **TypeScript** — type-safe, required by the Even Hub ecosystem.
- **Vite** — fast dev server with hot reload, used by Even Hub apps.
- **@evenrealities/even_hub_sdk** — official SDK for glasses communication (bridge, events, display).
- **Vitest** — test runner compatible with Vite, consistent with our TDD workflow (see ADR 0003).

The app runs as a standard web page in the browser for development/simulation and connects to the glasses via the Even Hub bridge when deployed.

## Consequences

- App works in browser for development and on glasses for production.
- Even Hub simulator (even-dev) can be used for local testing.
- Contributors need Node.js installed.
- We can use the `@evenrealities/evenhub-cli` to package and deploy.
