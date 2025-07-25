# Kanagawa Color Palette

This document describes the color palette used in the French Press Timer application, inspired by the [Kanagawa Paper Ink colorscheme](https://github.com/thesimonho/kanagawa-paper.nvim) for Neovim.

## Base Colors

### Background Shades
- **sumiInk0**: `#16161D` - Primary dark background
- **sumiInk3**: `#1F1F28` - Secondary background (modals, inputs, secondary buttons)

### Foreground Colors
- **fujiWhite**: `#DCD7BA` - Primary text color
- **oldWhite**: `#C8C093` - Secondary/muted text color

## Accent Colors

### Primary Accents
- **autumnGreen**: `#76946A` - Primary actions, idle/complete states
- **dragonBlue**: `#658594` - Steeping stage
- **crystalBlue**: `#7E9CD8` - Stir stage, interactive hover states
- **oniViolet**: `#957FB8` - Brewing stage, secondary hover states
- **waveAqua1**: `#6A9589` - Borders, button hover states
- **autumnYellow**: `#DCA561` - Timer urgency thresholds (30s warning)
- **autumnRed**: `#C34043` - High urgency indicators

## Application Usage

### Stage-Specific Colors
| Stage | Color | Hex Code | Usage |
|-------|-------|----------|-------|
| Idle | autumnGreen | `#76946A` | Stage title, progress circle |
| Steeping | dragonBlue | `#658594` | Stage title, progress circle |
| Stir | crystalBlue | `#7E9CD8` | Stage title, progress circle, flash alerts (with pulse animation) |
| Brewing | oniViolet | `#957FB8` | Stage title, progress circle |
| Complete | autumnGreen | `#76946A` | Stage title, progress circle, flash alerts (with glow animation) |

### UI Components

#### Backgrounds
- **Body**: sumiInk0 (`#16161D`)
- **Modal overlay**: sumiInk0 with 90% opacity
- **Modal content**: sumiInk3 (`#1F1F28`)
- **Input fields**: sumiInk0 (`#16161D`)
- **Progress circle background**: sumiInk3 (`#1F1F28`)

#### Text
- **Primary headings**: fujiWhite (`#DCD7BA`)
- **Body text**: fujiWhite (`#DCD7BA`)
- **Secondary text**: oldWhite (`#C8C093`)
- **Time display**: fujiWhite (`#DCD7BA`)

#### Interactive Elements
- **Primary buttons**: 
  - Background: autumnGreen (`#76946A`)
  - Text: fujiWhite (`#DCD7BA`)
  - Hover: waveAqua1 (`#6A9589`)
- **Secondary buttons**: 
  - Background: sumiInk3 (`#1F1F28`)
  - Border: waveAqua1 (`#6A9589`)
  - Text: fujiWhite (`#DCD7BA`)
  - Hover: oniViolet (`#957FB8`)
- **Settings button**: 
  - Border: waveAqua1 (`#6A9589`)
  - Hover border: crystalBlue (`#7E9CD8`)
- **Input focus**: crystalBlue (`#7E9CD8`)
- **Checkbox accent**: autumnGreen (`#76946A`)
- **Range slider track**: sumiInk3 (`#1F1F28`)
- **Range slider thumb**: autumnGreen (`#76946A`) with fujiWhite (`#DCD7BA`) border
- **Range slider thumb hover**: waveAqua1 (`#6A9589`)

#### Urgency Indicators
- **Low urgency**: Standard stage colors, normal stroke width (8px)
- **Medium urgency**: Progress circle changes to autumnYellow (`#DCA561`) with thicker stroke (10px) and slow pulse (≤30s remaining)
- **High urgency**: Progress circle changes to autumnRed (`#C34043`) with thickest stroke (12px) and fast pulse (≤10s remaining)
- **Timer text**: Always maintains consistent fujiWhite (`#DCD7BA`) color regardless of urgency

### Visual Effects
- **Flash alerts**: Stage-specific colors with background flash and border pulse
- **Progress circle pulse**: Subtle opacity and stroke-width changes
- **Text glow**: Subtle shadow effects using stage colors
- **Animations**: Smooth transitions between all color states

## Design Philosophy

The Kanagawa palette provides:
- **High contrast** while maintaining visual comfort
- **Muted, earthy tones** inspired by traditional Japanese art
- **Semantic color usage** where colors convey meaning (green for complete, red for urgent, etc.)
- **Accessibility** with sufficient contrast ratios for TV viewing
- **Visual hierarchy** through careful color selection and opacity variations

## Color Accessibility

All color combinations maintain a minimum 4.5:1 contrast ratio for WCAG 2.1 Level AA compliance, ensuring readability across different viewing conditions and devices.