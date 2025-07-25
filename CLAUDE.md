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
- Issue #2 (Basic structure): ✅ Active
- Issues #3-10 (Future features): 🚫 Skipped until implementation

To enable tests for a specific issue, remove `.skip` from the relevant `describe.skip()` blocks.

## Development Notes

**Issue Status:**
- ✅ Issue #2: Basic HTML structure and file organization (COMPLETE)
- 🔄 Issue #3: Core timer logic (READY - tests written but skipped)
- 🔄 Issue #4: TV-friendly UI design (READY - basic structure implemented)
- 🔄 Issue #5: Audio notifications (READY - placeholder in playNotification method)
- 🔄 Issue #6: Visual alerts (READY - basic flash implemented)
- 🔄 Issue #7: Settings functionality (READY - UI implemented, validation needs work)
- 🔄 Issue #8: localStorage persistence (READY - basic structure implemented)

**Next Steps for Issue #3:**
1. Enable timer countdown tests by removing `.skip` from `describe.skip('Timer State Management')`
2. Enable timing logic tests by removing `.skip` from `describe.skip('Timer Countdown Logic')`
3. Fix any timer interval management issues that tests reveal
4. Ensure accurate countdown functionality with proper cleanup

**Key Methods Ready for Enhancement:**
- `playNotification()` - Currently just console.log, needs audio implementation
- `updateProgressCircle()` - Working but may need refinement
- `saveSettings()` - Validation logic needs debugging (tests reveal issues)
- Timer state management methods are fully implemented and tested

