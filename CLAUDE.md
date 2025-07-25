# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

This project uses `mise` for tool version management. To set up the development environment:

```bash
./scripts/setup
```

This will trust the mise configuration and install the required tools (Node.js and GitHub CLI).

## Project Structure

Repository structure:
- `mise.toml` - Tool version management configuration
- `scripts/setup` - Development environment setup script
- `french-press-timer/` - French press coffee timer web application
  - `index.html` - Main application file with semantic HTML structure
  - `styles.css` - TV-friendly CSS with large, readable elements
  - `script.js` - JavaScript timer application (FrenchPressTimer class)
  - `assets/audio/` - Directory for notification sounds
  - `package.json` - Jest testing configuration
  - `tests/` - Test suite organized by GitHub issue scope

## Architecture

**French Press Timer Application:**
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (no external dependencies)
- **Design:** TV-optimized interface with large fonts and high contrast
- **Structure:** Single-page application with modal settings
- **State Management:** Simple class-based state in FrenchPressTimer
- **Testing:** Jest with jsdom for DOM testing
- **Workflow:** Two-stage brewing process (4min steep + 8min brew with stir reminder)

**Key Classes:**
- `FrenchPressTimer` (`script.js:2`) - Main application class handling all timer logic, UI updates, and settings

## Project Requirements

French Press Coffee Timer - Requirements Document is available in the repository for development guidance.

## Testing

The project uses Jest with jsdom for testing core functionality. Tests are organized by GitHub issue scope:

- **Run all active tests:** `npm test --prefix french-press-timer`
- **Run with coverage:** `npm run test:coverage --prefix french-press-timer`
- **Watch mode:** `npm run test:watch --prefix french-press-timer`

Tests are disabled/enabled per GitHub issue to avoid noise from unimplemented features:
- Issues #1-2 (Core timer and UI): ✅ Active
- Issues #3-8 (Future features): 🚫 Skipped until implementation

To enable tests for a specific issue, remove `.skip` from the relevant `describe.skip()` blocks.

## Development Notes

**Issue Status:**
- ✅ Issue #1: Core timer logic and countdown functionality (COMPLETE)
- ✅ Issue #2: TV-friendly UI design with large, readable elements (COMPLETE)
- ✅ Issue #3: Audio notifications for timer completion (COMPLETE)
- ✅ Issue #4: Visual alerts and stage indicators (COMPLETE - commit 6c518bb pushed to GitHub)
- 🔄 Issue #5: Settings page for customizable timing (READY - needs minutes:seconds precision)
- 🔄 Issue #6: localStorage persistence for user preferences (READY - basic structure implemented)
- 🔄 Issue #7: Chrome/Firefox compatibility testing (READY)
- 🔄 Issue #8: Offline functionality optimization (READY)

**Issue #4 - Complete Implementation:**
- Enhanced visual alerts with Kanagawa Paper Ink color palette
- Self-hosted JetBrains Mono font (fonts/jetbrains-mono/)
- Stage-specific colors and animations (green/yellow/blue/purple/red)
- Progress circle urgency indicators (color changes, stroke width, pulse)
- Centered "Coffee Timer" layout with flat SVG settings icon
- Fixed form controls (checkbox/slider) to use Kanagawa palette
- Comprehensive visual-alerts.test.js with 19 tests
- Complete KANAGAWA_PALETTE.md documentation
- Branch: issue-4-visual-alerts (commit 6c518bb) - pushed to GitHub, no PR created yet

**Issue #5 - Settings Enhancement Notes:**
- `saveSettings()` validation logic has test failures that need fixing:
  - Invalid inputs not properly rejected (values still saved from test setup)
  - localStorage mocking needs proper setup in tests
  - Validation should reject out-of-range values without saving
- Will be addressed during Issue #5 implementation

