# French Press Coffee Timer

A responsive web application for timing the perfect French press coffee brewing process.

## Features

- **Two-stage brewing process**: 4-minute steep + 8-minute brew with stir reminder
- **Musical audio notifications**: C major arpeggio (C-E-G-C) for brewing completion
- **Responsive design**: Optimized for iPhone, tablet, desktop, and 4K TV
- **PWA support**: Installable on mobile devices with offline functionality
- **Customizable settings**: Adjustable timing with minutes:seconds precision
- **Persistent preferences**: Settings saved to localStorage

## Live Application

🚀 **Live at:** [brewer.surge.sh](https://brewer.surge.sh)

## Development

```bash
# Setup development environment
./scripts/setup

# Run tests
npm test --prefix app

# Deploy to production
./scripts/deploy
```

## Architecture

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (zero dependencies)
- **Design**: TV-friendly UI with large fonts and high contrast
- **Audio**: Web Audio API with synthesized musical notifications
- **Responsive**: CSS custom properties with device-specific breakpoints
- **Testing**: Jest with jsdom for DOM testing

## Target Devices

- iPhone 11 (390×844px) - PWA priority
- 4K TV (4096×2160) at 300% Windows scaling
- Standard desktop (1920×1080)
- Tablet landscape (1024×768)

For detailed development information, see [CLAUDE.md](CLAUDE.md).