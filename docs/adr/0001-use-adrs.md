# ADR 0001: Use Architecture Decision Records

## Status

Accepted

## Context

We need a way to capture important architectural decisions made along with their context and consequences. Without a record, decisions get lost, revisited without context, or forgotten entirely.

## Decision

We will use Architecture Decision Records (ADRs) as described by Michael Nygard. Each ADR will be a short markdown file in `docs/adr/` numbered sequentially. ADRs are immutable once accepted — if a decision is reversed, a new ADR supersedes the old one.

## Consequences

- All significant architectural decisions will be documented.
- New contributors can understand why things are the way they are.
- We accept the small overhead of writing an ADR for each decision.
