# ADR 0002: Use Python with Textual SDK

## Status

Accepted

## Context

We need to choose a language and framework for building a terminal-based teleprompter. The application needs to handle smooth text scrolling, keyboard input, and a clean terminal UI. We want a language that is accessible, well-supported, and has strong terminal UI libraries.

## Decision

We will use **Python 3.12+** as the implementation language and **Textual** as the terminal UI SDK.

- **Python** — widely known, fast to iterate with, excellent ecosystem.
- **Textual** — modern terminal UI framework with rich widget support, CSS-like styling, async-first design, and active maintenance.
- **pytest** — for testing, consistent with our TDD workflow (see ADR 0003).

## Consequences

- Fast development iteration with Python's dynamic nature.
- Textual provides a high-level API for terminal UI, reducing boilerplate.
- We accept Python's runtime performance characteristics, which are more than sufficient for a text-scrolling application.
- Contributors need Python 3.12+ installed.
