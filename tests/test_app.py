"""Tests for the teleprompter application."""

from teleprompter.app import ScriptDisplay, TeleprompterApp, SAMPLE_TEXT


class TestScriptDisplay:
    def test_default_text(self):
        widget = ScriptDisplay()
        assert widget.script_text == SAMPLE_TEXT

    def test_custom_text(self):
        widget = ScriptDisplay("Hello, world!")
        assert widget.script_text == "Hello, world!"


class TestTeleprompterApp:
    def test_app_creates(self):
        app = TeleprompterApp()
        assert app.TITLE == "Teleprompter"

    def test_app_starts_paused(self):
        app = TeleprompterApp()
        assert app._scrolling is False
