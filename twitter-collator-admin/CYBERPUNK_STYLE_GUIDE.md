# Cyberpunk Theme Style Guide

## Overview
The Cyberpunk theme transforms the Twitter Collator Admin into a futuristic, neon-lit interface inspired by cyberpunk aesthetics. It features high-contrast neon colors, dark backgrounds, and glowing effects.

## Color Palette

### Primary Colors
- **Background**: `oklch(0.08 0.02 270)` - Deep dark blue-purple, almost black
- **Foreground**: `oklch(0.95 0.05 180)` - Bright cyan-tinted white
- **Card**: `oklch(0.12 0.03 270)` - Slightly lighter dark blue-purple
- **Card Foreground**: `oklch(0.95 0.05 180)` - Bright cyan-tinted white

### Accent Colors
- **Primary (Cyan)**: `oklch(0.7 0.25 180)` - Electric cyan, used for primary actions and highlights
- **Accent (Magenta)**: `oklch(0.75 0.28 330)` - Hot magenta/pink, used for secondary accents
- **Destructive (Red)**: `oklch(0.65 0.28 0)` - Neon red for warnings and destructive actions
- **Viral (Orange)**: `oklch(0.7 0.28 30)` - Neon orange for viral badges

### Neutral Colors
- **Secondary**: `oklch(0.18 0.04 270)` - Dark blue-purple for secondary backgrounds
- **Muted**: `oklch(0.18 0.04 270)` - Same as secondary, for muted elements
- **Muted Foreground**: `oklch(0.6 0.05 180)` - Dimmed cyan for secondary text
- **Border**: `oklch(0.25 0.08 270)` - Slightly brighter purple for borders

## Typography

### Font Families
- **Sans**: Geist Sans - Modern, clean sans-serif
- **Mono**: Geist Mono - For code and technical elements

### Font Sizes & Weights
- **Headings**: 
  - H1: 2xl (1.5rem), font-semibold (600)
  - H2: 2xl (1.5rem), font-semibold (600)
  - H3: lg (1.125rem), font-semibold (600)
  - H4: sm (0.875rem), font-semibold (600)
- **Body**: sm (0.875rem), font-normal (400)
- **Small**: xs (0.75rem), font-normal (400)
- **Labels**: xs (0.75rem), font-medium (500)

### Line Height
- Body text: leading-relaxed (1.625)
- Headings: tracking-tight (-0.025em)

## Visual Effects

### Glow Effects
The cyberpunk theme features signature neon glow effects:

- **Cyan Glow**: Applied to primary elements
  \`\`\`css
  box-shadow: 0 0 10px oklch(0.7 0.25 180), 0 0 20px oklch(0.7 0.25 180 / 0.5);
  \`\`\`

- **Magenta Glow**: Applied to accent elements
  \`\`\`css
  box-shadow: 0 0 10px oklch(0.75 0.28 330), 0 0 20px oklch(0.75 0.28 330 / 0.5);
  \`\`\`

- **Text Glow**: Applied to important text
  \`\`\`css
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
  \`\`\`

- **Border Glow**: Applied to focused/active borders
  \`\`\`css
  border-color: oklch(0.7 0.25 180);
  box-shadow: 0 0 5px oklch(0.7 0.25 180 / 0.5), inset 0 0 5px oklch(0.7 0.25 180 / 0.3);
  \`\`\`

### Border Radius
- Default: 0.5rem (8px) - Slightly sharper than light theme for a more technical feel
- Small: calc(0.5rem - 4px)
- Medium: calc(0.5rem - 2px)
- Large: 0.5rem
- Extra Large: calc(0.5rem + 4px)

## Component Styles

### Buttons
- **Primary**: Cyan background with glow effect on hover
- **Secondary**: Dark purple background with cyan border
- **Ghost**: Transparent with cyan text on hover
- **Outline**: Cyan border with transparent background

### Cards
- **Background**: Dark blue-purple (`oklch(0.12 0.03 270)`)
- **Border**: Subtle purple border with optional glow on hover
- **Hover State**: Border glow effect with cyan accent

### Badges
- **Collection Badges**: Color-coded with semi-transparent backgrounds
  - Blue: `bg-blue-500/20 text-blue-400 border-blue-500/40`
  - Purple: `bg-purple-500/20 text-purple-400 border-purple-500/40`
  - Green: `bg-green-500/20 text-green-400 border-green-500/40`
  - Amber: `bg-amber-500/20 text-amber-400 border-amber-500/40`
- **Viral Badge**: Neon orange with glow effect

### Inputs
- **Background**: Dark purple (`oklch(0.25 0.08 270)`)
- **Border**: Cyan border with glow on focus
- **Text**: Bright cyan-tinted white
- **Placeholder**: Dimmed cyan

### Avatars
- **Border**: Cyan border with subtle glow
- **Fallback**: Dark purple background with cyan text

## Layout & Spacing

### Grid System
- **Container**: max-width with responsive padding
- **Columns**: 12-column grid for responsive layouts
  - Left Sidebar: 3 columns
  - Main Content: 6 columns
  - Right Sidebar: 3 columns

### Spacing Scale
- Base unit: 4px
- Common spacing: 0.5rem (8px), 0.75rem (12px), 1rem (16px), 1.5rem (24px), 2rem (32px)

### Gaps
- Card spacing: 1rem (16px)
- Section spacing: 1.5rem (24px)
- Component spacing: 0.75rem (12px)

## Interactive States

### Hover
- Cards: Border glow with cyan accent
- Buttons: Increased glow intensity
- Links: Cyan color with underline

### Focus
- Ring: Cyan glow with 2px offset
- Border: Cyan with glow effect

### Active
- Buttons: Slightly darker with maintained glow
- Filters: Cyan background with glow

## Accessibility

### Contrast Ratios
- Body text: 14:1 (exceeds WCAG AAA)
- Secondary text: 7:1 (exceeds WCAG AA)
- Interactive elements: Minimum 4.5:1

### Focus Indicators
- All interactive elements have visible focus states
- Cyan glow ring for keyboard navigation

## Usage Guidelines

### When to Use Cyberpunk Theme
- For users who prefer dark themes with high visual impact
- In low-light environments
- For a futuristic, tech-forward aesthetic
- When you want to emphasize the cutting-edge nature of the content

### Best Practices
- Use glow effects sparingly to maintain readability
- Ensure sufficient contrast for all text elements
- Maintain consistent spacing and alignment
- Use neon colors purposefully for hierarchy and emphasis
- Test in various lighting conditions

## Theme Switching
Users can toggle between Light and Cyberpunk themes using the theme switcher in the header. The theme preference is applied immediately and affects all UI elements consistently.
