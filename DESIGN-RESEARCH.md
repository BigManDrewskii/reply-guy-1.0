# Design Research: Claude Extension + Manus UI

## Claude Extension Sidebar
- **Background**: Dark warm tones (#1a1a1a to #2a2a2a range), NOT pure black
- **Text**: Off-white/cream (#f5f0e8 range), warm and easy on eyes
- **Accent**: Warm terracotta/orange for the Claude logo spark, subtle
- **Cards**: Slightly lighter than background, very subtle borders or no borders
- **Input fields**: Rounded corners (12-16px), subtle background fill, no harsh borders
- **Typography**: Clean sans-serif (likely Söhne or similar), generous line-height
- **Spacing**: Very generous padding — 16-24px between sections
- **Buttons/chips**: Rounded pill shapes, subtle backgrounds, no harsh outlines
- **Header**: Minimal — just "Claude" wordmark + settings gear + collapse icon
- **Sidebar nav**: Simple text list, active state with subtle highlight
- **Chat bubbles**: User messages in a warm tinted background, AI responses plain
- **Action chips**: Rounded rectangles with icon + text, subtle border
- **Overall feel**: Warm, premium, editorial, NOT cold/techy

## Manus Interface
- **Background**: Clean white (#ffffff) with warm dark sidebar (#2d2030 plum-tinted)
- **Text**: Standard dark (#1a1a1a) on white, light text on dark sidebar
- **Accent**: Subtle — mostly monochrome with occasional green for status
- **Cards**: White with very subtle shadow, rounded corners (8-12px)
- **Input fields**: Large, rounded (16px+), light gray background, generous padding
- **Typography**: Clean, modern sans-serif, large greeting text, smaller body
- **Spacing**: Extremely generous — lots of whitespace
- **Buttons**: Pill-shaped category filters, subtle borders
- **Task cards**: Clean grid layout, icon + title + description, subtle hover
- **Sidebar**: Dark plum/purple-black, simple text list, timestamps
- **Status indicators**: Colored left borders on cards (green, blue, etc.)
- **Progress**: Clean progress bars with status text
- **Overall feel**: Clean, spacious, professional, calm

## Key Design Patterns to Adopt for Reply Guy

### Color System
- Dark mode primary: warm dark (#1c1917 stone-900 or similar)
- NOT pure black — warm undertones
- Surface/card: slightly lighter (#292524 stone-800)
- Border: very subtle (#3f3f46 zinc-700 at 50% opacity)
- Text primary: warm off-white (#fafaf9 stone-50)
- Text secondary: muted (#a8a29e stone-400)
- Accent: Keep existing brand color but make it warmer/more refined

### Typography
- System font stack or Geist (already using Geist!)
- Larger body text (14-15px vs typical 13px)
- Generous line-height (1.6-1.7)
- Heavier headings, lighter body
- Letter-spacing: slightly loose on small caps/labels

### Spacing
- Base unit: 4px
- Section padding: 20-24px
- Card padding: 16-20px
- Element gaps: 12-16px
- Screen edge padding: 16-20px

### Components
- Rounded corners: 12px for cards, 8px for buttons, 16px for inputs
- Shadows: minimal, warm-toned (not blue-gray)
- Borders: 1px, very low opacity (10-15%)
- Transitions: 200-300ms ease, subtle
- Hover states: slight brightness/opacity shift, not color change

### Interactions
- Smooth page transitions (fade + slight slide)
- Skeleton loading states instead of spinners
- Subtle scale on press (0.98)
- Progress bars with smooth animation
