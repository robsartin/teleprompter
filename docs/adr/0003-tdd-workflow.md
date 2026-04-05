# ADR 0003: Strict TDD Workflow

## Status

Accepted

## Context

We want a disciplined development process that produces well-tested, well-designed code from the start. Test-driven development (TDD) gives us confidence in our code, drives better design, and catches regressions early.

## Decision

All feature development will follow the **Red-Green-Refactor** TDD cycle:

1. **Red** — Write one failing test that describes the desired behavior.
2. **Green** — Write the minimum code to make the test pass.
3. **Commit** — Commit the passing test and implementation together.
4. **Refactor** — Clean up the code while keeping tests green. Commit again if changes are made.
5. **Repeat** — Move to the next behavior.

### Branch Protection

The `main` branch is protected with the following rules:

- All changes must go through a pull request.
- At least **1 approval** is required before merging.
- The **CI test suite must pass** before merging.
- No direct pushes to `main` (after initial setup).

### CI

A GitHub Actions workflow runs `pytest` on every pull request. PRs cannot be merged until tests pass.

## Consequences

- Every feature ships with tests from day one.
- The commit history tells a clear story of intent then implementation.
- The approval requirement ensures code review happens on every change.
- CI enforcement prevents broken code from reaching `main`.
- Slightly slower velocity per-feature, but significantly fewer bugs and regressions.
