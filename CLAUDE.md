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
- ✅ Issue #4: Visual alerts and stage indicators (COMPLETE - merged to main via PR #10)
- ✅ Issue #5: Settings page for customizable timing (COMPLETE - enhanced with minutes:seconds precision)
- ✅ Issue #6: localStorage persistence for user preferences (COMPLETE - full save/load/error handling)
- 🔄 Issue #7: Chrome/Firefox compatibility testing (READY)
- ✅ Issue #8: Offline functionality optimization (COMPLETE - PWA manifest + font preloading)

**Issue #5 - Settings Enhancement (COMPLETE):**
- **Branch:** issue-5-settings-enhancement (merged to main)
- **Completed Features:**
  - ✅ Fixed `saveSettings()` validation logic
  - ✅ Enhanced input validation with proper rejection of invalid values
  - ✅ Added minutes:seconds precision to timer settings
  - ✅ Improved error handling for non-numeric inputs
  - ✅ Updated UI with separate minutes/seconds input fields
  - ✅ Comprehensive test coverage for validation logic
- **Enhancement:** Settings now support precise timing with minutes:seconds format (e.g., 4:30 for 4 minutes 30 seconds)

**Issue #6 - localStorage Persistence (COMPLETE):**
- **Branch:** issue-6-localstorage-persistence (PR #12 ready for merge)
- **Completed Features:**
  - ✅ localStorage save/load functionality for all timer settings
  - ✅ Automatic settings restoration on app initialization  
  - ✅ Robust error handling for localStorage failures (private browsing, quota exceeded)
  - ✅ Defensive DOM checks for test environment compatibility
  - ✅ Enhanced UX with TV-optimized sizing and accessibility improvements
  - ✅ Complete test coverage: 17/17 tests passing (persistence, validation, UI, modal)
- **Technical Implementation:**
  - `saveSettingsToStorage()` and `loadSettings()` methods with try/catch error handling
  - Settings persist as JSON in localStorage with key `frenchPressSettings`
  - Graceful fallbacks when localStorage unavailable
  - All settings tests enabled and working (Issues #5 & #6 functionality)

**Issue #8 - Offline Functionality Optimization (COMPLETE):**
- **Branch:** issue-8-offline-functionality  
- **Completed Features:**
  - ✅ PWA Web App Manifest with proper icons and metadata
  - ✅ Font preloading for faster initial load performance
  - ✅ Offline-first architecture analysis (no service worker needed)
  - ✅ Surge.sh deployment preparation with optimal caching strategy
- **Technical Implementation:**
  - `manifest.json` with PWA configuration for installability
  - Font preload hints for JetBrains Mono variants (Regular, Medium, SemiBold)
  - App already offline-capable due to zero external dependencies
  - localStorage persistence ensures settings survive offline usage
- **Deployment:**
  - Surge CLI installed and ready for deployment
  - Target domain: `brewer.surge.sh`
  - Next step: `surge login` then `cd french-press-timer && surge . --domain brewer.surge.sh`

