"""Teleprompter application."""

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static
from textual.containers import VerticalScroll


SAMPLE_TEXT = """\
Welcome to Teleprompter.

This is a simple terminal-based teleprompter. Load your script and it will \
scroll smoothly so you can read naturally while presenting.

Use the controls to adjust speed, pause, or restart.
"""


class ScriptDisplay(Static):
    """Widget that displays the teleprompter script text."""

    def __init__(self, text: str = SAMPLE_TEXT) -> None:
        super().__init__(text)
        self._script_text = text

    @property
    def script_text(self) -> str:
        return self._script_text


class TeleprompterApp(App):
    """A terminal-based teleprompter."""

    CSS = """
    Screen {
        background: $surface;
    }

    VerticalScroll {
        height: 1fr;
    }

    ScriptDisplay {
        padding: 2 4;
        text-style: bold;
        color: $text;
    }
    """

    TITLE = "Teleprompter"

    BINDINGS = [
        ("q", "quit", "Quit"),
        ("space", "toggle_scroll", "Pause/Resume"),
    ]

    def __init__(self, script_text: str = SAMPLE_TEXT) -> None:
        super().__init__()
        self._script_text = script_text
        self._scrolling = False

    def compose(self) -> ComposeResult:
        yield Header()
        with VerticalScroll():
            yield ScriptDisplay(self._script_text)
        yield Footer()

    def action_toggle_scroll(self) -> None:
        self._scrolling = not self._scrolling


def main() -> None:
    app = TeleprompterApp()
    app.run()


if __name__ == "__main__":
    main()
