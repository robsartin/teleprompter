# Teleprompter

A terminal-based teleprompter built with Python and [Textual](https://textual.textualize.io/).

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Run

```bash
teleprompter
```

## Test

```bash
pytest
```

## Development

We follow strict TDD (see [ADR 0003](docs/adr/0003-tdd-workflow.md)). All changes require a PR with passing tests and at least one approval.
