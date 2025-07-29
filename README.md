# French Press Timer

A clean, accessible web-based timer for French press coffee brewing. Designed for TV displays, desktops, and mobile devices with large fonts, high contrast, and intuitive controls.

## 🚀 Live Demo

Visit [brewer.surge.sh](https://brewer.surge.sh) to try it out.

## ✨ Features

- **Two-stage brewing process**: 4-minute steeping + 8-minute brewing with stir reminder
- **TV-optimized interface**: Large fonts, high contrast, readable from across the room
- **Progressive Web App**: Install on iOS/Android, works offline
- **Audio notifications**: Synthesized audio alerts including a musical arpeggio for completion
- **Customizable settings**: Adjust timing, audio volume, and preferences
- **Persistent storage**: Settings saved locally and restored on reload
- **Accessibility focused**: Screen reader support, keyboard navigation, proper ARIA labels

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (zero dependencies)
- **Testing**: Jest with jsdom
- **Deployment**: Surge.sh
- **PWA**: Web App Manifest, offline-first architecture

## 🏃‍♂️ Quick Start

### Prerequisites

- [mise](https://mise.jdx.dev/) (or Node.js 20+ and GitHub CLI)

### Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd french-press-timer
./scripts/setup

# Run tests
cd app
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Deployment

```bash
./scripts/deploy
```

## 📁 Project Structure

```
app/
├── index.html          # Main application
├── script.js           # Core timer logic (FrenchPressTimer class)
├── styles.css          # TV-friendly responsive design
├── manifest.json       # PWA configuration
├── fonts/              # JetBrains Mono web fonts
├── assets/             # Audio files and other assets
├── tests/              # Jest test suite
└── package.json        # Jest configuration
```

## 🧪 Testing

The project uses Jest with jsdom for comprehensive DOM testing:

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

Test coverage includes:
- Timer logic and state management
- UI interactions and updates
- Settings persistence and validation
- Audio system functionality
- Edge cases and error handling

## 🎨 Design System

Built with the Kanagawa color palette for optimal readability:
- **Background**: `#16161D` (dark charcoal)
- **Primary**: `#DCD7BA` (warm cream)
- **Accent**: `#7E9CD8` (soft blue)
- **Typography**: JetBrains Mono for consistency across devices

## 📱 Device Support

- **TV displays**: 1920×1080+ with large touch-friendly controls
- **Desktop**: All modern browsers (Chrome, Firefox, Safari)
- **Mobile**: iOS Safari, Android Chrome with PWA installation
- **Accessibility**: Screen readers, keyboard navigation, reduced motion support

## 🏗 Architecture

### Core Components

- **FrenchPressTimer**: Main application class handling timer logic, UI updates, and settings
- **Audio System**: Synthesized beep notifications with musical arpeggio and volume control
- **Settings Modal**: Customizable timing and audio preferences
- **Progress Visualization**: SVG-based circular progress indicator

### State Management

Simple class-based state management with localStorage persistence:
- Timer state (idle, steeping, brewing, paused)
- User preferences (timing, audio settings)
- UI state (modal visibility, button states)

## 📄 License

MIT License - see LICENSE file for details