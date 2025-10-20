# Twitter Collator Admin - Style Guide

## Design System Overview
This style guide provides comprehensive specifications for the Twitter Collator Admin interface, featuring a modern dark theme with teal accents and professional typography.

---

## Color Palette

### Primary Colors
- **Background**: `oklch(0.12 0.01 240)` - Deep navy blue, main app background
- **Foreground**: `oklch(0.95 0.01 240)` - Near white, primary text color
- **Primary**: `oklch(0.65 0.15 180)` - Teal accent, buttons and interactive elements
- **Primary Foreground**: `oklch(0.12 0.01 240)` - Dark text on primary buttons

### Surface Colors
- **Card**: `oklch(0.16 0.01 240)` - Slightly lighter than background for elevated surfaces
- **Card Foreground**: `oklch(0.95 0.01 240)` - Text on cards
- **Secondary**: `oklch(0.22 0.01 240)` - Input backgrounds, secondary surfaces
- **Secondary Foreground**: `oklch(0.95 0.01 240)` - Text on secondary surfaces

### Semantic Colors
- **Muted**: `oklch(0.22 0.01 240)` - Subtle backgrounds
- **Muted Foreground**: `oklch(0.55 0.01 240)` - Secondary text, timestamps, labels
- **Border**: `oklch(0.24 0.01 240)` - Dividers and borders
- **Destructive**: `oklch(0.55 0.22 25)` - Error states, delete actions
- **Viral**: `oklch(0.65 0.18 40)` - Orange accent for viral content badges

### Interactive States
- **Hover**: Primary color at 90% opacity
- **Focus Ring**: `oklch(0.65 0.15 180)` with 50% opacity
- **Active**: Primary color at full opacity

---

## Typography

### Font Families
- **Sans Serif**: Geist Sans (primary font for all UI text)
- **Monospace**: Geist Mono (for code or technical content)

### Font Sizes & Weights
- **Heading 1**: 24px (1.5rem), font-weight: 600, tracking: tight
- **Heading 2**: 20px (1.25rem), font-weight: 600, tracking: tight
- **Heading 3**: 18px (1.125rem), font-weight: 600
- **Body**: 14px (0.875rem), font-weight: 400, line-height: 1.5
- **Small**: 12px (0.75rem), font-weight: 400
- **Label**: 12px (0.75rem), font-weight: 500

### Line Height
- **Body Text**: 1.5 (leading-relaxed)
- **Headings**: 1.2
- **Compact**: 1.4

---

## Spacing System

### Base Unit: 4px (0.25rem)

- **xs**: 8px (0.5rem)
- **sm**: 12px (0.75rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)

### Component Spacing
- **Card Padding**: 24px (1.5rem)
- **Section Gap**: 24px (1.5rem)
- **Element Gap**: 12px (0.75rem)
- **Inline Gap**: 8px (0.5rem)

---

## Border Radius

- **Small**: 8px (0.5rem) - Badges, small buttons
- **Medium**: 10px (0.625rem) - Inputs, small cards
- **Large**: 12px (0.75rem) - Cards, main containers
- **Extra Large**: 16px (1rem) - Large feature cards

---

## Components

### Buttons

**Primary Button**
- Background: `var(--primary)`
- Text: `var(--primary-foreground)`
- Padding: 12px 24px
- Border Radius: 12px
- Font Weight: 500
- Hover: 90% opacity
- Transition: all 200ms

**Ghost Button**
- Background: transparent
- Text: `var(--muted-foreground)`
- Hover Background: `var(--secondary)`
- Hover Text: `var(--foreground)`

### Cards

**Standard Card**
- Background: `var(--card)`
- Border: 1px solid `var(--border)`
- Border Radius: 12px
- Padding: 24px
- Hover: Border color changes to `var(--primary)` at 50% opacity

**Interactive Card**
- Cursor: pointer
- Transition: border-color 200ms
- Group hover effects for child elements

### Badges

**Default Badge**
- Background: `var(--secondary)`
- Text: `var(--secondary-foreground)`
- Padding: 4px 12px
- Border Radius: 8px
- Font Size: 12px

**Viral Badge**
- Background: `var(--viral)` at 20% opacity
- Text: Orange-400
- Border: 1px solid `var(--viral)` at 30% opacity

### Inputs

**Text Input**
- Background: `var(--secondary)`
- Border: 1px solid `var(--border)`
- Border Radius: 10px
- Padding: 10px 12px
- Font Size: 14px
- Focus: Ring color `var(--ring)`

### Avatars

**Sizes**
- Small: 32px (2rem)
- Medium: 40px (2.5rem)
- Large: 48px (3rem)

**Style**
- Border: 1px solid `var(--border)`
- Border Radius: 50%
- Fallback Background: `var(--secondary)`

---

## Layout

### Grid System
- **Desktop**: 12-column grid
  - Left Sidebar: 3 columns
  - Main Content: 6 columns
  - Right Sidebar: 3 columns
- **Mobile**: Single column, stacked layout

### Container
- Max Width: 1400px
- Padding: 24px (1.5rem)

### Header
- Height: Auto
- Padding: 16px 24px
- Sticky positioning
- Backdrop blur effect
- Border bottom: 1px solid `var(--border)`

---

## Interactions

### Hover States
- Opacity change: 200ms ease
- Color transitions: 200ms ease
- Scale: Not used (prefer opacity/color changes)

### Focus States
- Ring: 2px solid `var(--ring)` at 50% opacity
- Offset: 2px

### Transitions
- Default: 200ms ease
- Color: 200ms ease
- Opacity: 200ms ease

---

## Icons

### Library
Lucide React icons

### Sizes
- Small: 16px (1rem)
- Medium: 20px (1.25rem)
- Large: 24px (1.5rem)

### Colors
- Default: `var(--muted-foreground)`
- Hover: `var(--foreground)` or accent colors
- Active: `var(--primary)`

---

## Accessibility

### Contrast Ratios
- Body text: Minimum 7:1 (AAA)
- Large text: Minimum 4.5:1 (AA)
- Interactive elements: Minimum 3:1

### Focus Indicators
- Always visible
- High contrast ring
- 2px width minimum

### Screen Reader Support
- Semantic HTML elements
- ARIA labels where needed
- Alt text for all images

---

## Usage Examples

### Distill Card
\`\`\`tsx
<Card className="border-border bg-card hover:border-primary/50 transition-colors">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
\`\`\`

### Viral Tweet Card
\`\`\`tsx
<Card className="border-border bg-card">
  <CardContent className="p-6 space-y-4">
    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
      Viral
    </Badge>
    {/* Tweet content */}
  </CardContent>
</Card>
\`\`\`

### Primary Button
\`\`\`tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Action
</Button>
\`\`\`

---

## Implementation Notes

- Use Tailwind CSS v4 with design tokens
- Prefer flexbox for most layouts
- Use CSS Grid only for complex 2D layouts
- Always use semantic color tokens (bg-background, text-foreground)
- Maintain consistent spacing using the 4px base unit
- Test all interactive states (hover, focus, active)
- Ensure proper contrast ratios for accessibility
