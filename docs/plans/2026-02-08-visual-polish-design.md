# Visual Polish & Micro-Interactions Design

**Date:** 2026-02-08
**Status:** Ready for Implementation
**Phases:** 4

## Overview

This design improves UI/UX across all Reply Guy screens through visual polish, micro-interactions, refined spacing, and motion. The extension will feel modern, responsive, and premium while maintaining the 320px side panel constraints.

**Design Principles:**
- Respect existing design tokens and dark theme
- Maintain 8px border-radius standard
- Use 150ms transitions for all state changes
- Keep motion subtle and purposeful
- Ensure accessibility throughout

---

## Phase 1: Loading States & Feedback

### Enhanced Skeleton System

**New Variants:**

1. **PulseSkeleton** - Standard content loading with shimmer
2. **TextSkeleton** - Simulates paragraphs with varying line widths
3. **AvatarSkeleton** - Circular loading for profile images
4. **CardSkeleton** - Pre-built card layouts (ProfileCardSkeleton exists)

**Implementation:**
```tsx
// Skeleton.tsx enhancements
interface SkeletonProps {
  variant?: 'pulse' | 'text' | 'avatar' | 'card'
  className?: string
}

// Accessibility
<div
  role="status"
  aria-label="Loading content"
  className="bg-muted animate-shimmer rounded-lg"
/>
```

### Progress Indicators

**Linear Progress Bar**
- Placement: Top of screen for long operations
- Color: Success (#00c853) with smooth transitions
- Animation: Width changes over 300ms with cubic-bezier easing
- Use cases: API analysis, voice training, data export

**Circular Progress**
- Placement: Button-level loading
- Implementation: Enhance existing Loader2 icon
- Size: Matches button text (16px-20px)
- Animation: Continuous rotation

**Step Progress**
- Implementation: Polish existing Voice Training steps
- Visual: Numbered circles with connecting lines
- Active: Filled with accent color
- Completed: Green checkmark

### Toast Notification System

**Toast Types:**
1. **Success** - Green checkmark, auto-dismiss 3s
2. **Error** - Red warning, manual dismiss
3. **Info** - Blue info icon, auto-dismiss 2s

**Positioning:**
- Fixed at bottom, 48px above nav
- Stacks up to 3 toasts
- Z-index: 100 (above content, below modals)

**Animations:**
- Enter: Slide up with fade-in (150ms ease-out)
- Exit: Slide down with fade-out (150ms ease-in)
- Stack: New toasts push existing up

### Status Feedback

**Action Feedback Timing:**

| Action | Feedback | Duration |
|--------|----------|----------|
| Copy button | Checkmark icon | 1s |
| Delete success | Toast + confirmation | Toast 3s |
| Save success | Button text "Saved!" | 1s |
| API validate | Status icon (✓/✗/↻) | Until complete |

**Implementation:**
```tsx
// Example: Copy button feedback
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 1000)
}

<Button
  onClick={handleCopy}
  aria-label={copied ? "Copied!" : "Copy to clipboard"}
>
  {copied ? <Check /> : <Copy />}
</Button>
```

---

## Phase 2: Interactive Elements

### Button States

**State Timeline:**

| State | Visual | Duration | Easing |
|-------|--------|----------|--------|
| Default | Base styles | - | - |
| Hover | Background shift | 150ms | ease-out |
| Active | Scale 0.95 | 100ms | ease-in |
| Focus | Ring 2px | 150ms | ease-out |
| Loading | Spinner + disabled | - | - |
| Disabled | 50% opacity | - | - |

**Hover Colors by Variant:**
- Primary/CTA: `bg-cta-hover`
- Secondary: `bg-card-hover`
- Ghost: `bg-muted` with 0.5 opacity

**Focus Ring:**
- Color: Primary at 50% opacity
- Offset: 2px from button
- Radius: Matches button border-radius (8px)

### Card Interactions

**All Interactive Cards:**

| State | Property | Value | Transition |
|-------|----------|-------|------------|
| Default | Border | `border-border` | - |
| Hover | Border | Lighter shade | 150ms ease |
| Focus | Ring | 2px primary/50 | 150ms ease |
| Press | Scale | 0.98 | 100ms ease-in |

**Implementation:**
```tsx
<Card
  className="hover:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] transition-all duration-150"
>
  {content}
</Card>
```

### Input Fields

**Input States:**

| State | Border | Background | Icon | Animation |
|-------|--------|------------|------|-----------|
| Default | 1px #262626 | #111 | - | - |
| Focus | 1px #0070f3 | #111 | Ring | 150ms |
| Error | 1px #ee0000 | #111 | Warning | Shake 300ms |
| Success | 1px #00c853 | #111 | Checkmark | 150ms |
| Disabled | 1px #262626 | #111 | - | - |

**Shake Animation:**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0) }
  25% { transform: translateX(-4px) }
  75% { transform: translateX(4px) }
}

.input-error {
  animation: shake 300ms ease-in-out
}
```

### Icon Buttons

**Touch Targets:**
- Minimum: 44x44px
- Implementation: Padding ensures this
- Visual: Icon may be smaller (16-20px)

**Hover Effect:**
- Background: `bg-muted/50`
- Transition: 150ms ease
- Border-radius: 8px

**Active Feedback:**
- Scale: 0.95
- Duration: 100ms ease-in
- Optional: Subtle ripple effect

**Tooltips:**
- Delay: 500ms on hover
- Implementation: HTML `title` attribute
- Position: Above button (default browser behavior)

### Tab Navigation

**Active Tab:**
- Background: `bg-cta` (#ededed)
- Text: `text-cta-foreground` (#000)
- Transition: 150ms ease

**Inactive Tab:**
- Background: Transparent
- Text: `text-muted-foreground`
- Hover: `bg-muted/30`

**Indicator:**
- Slides to active position
- Height: 2px
- Color: Primary accent
- Transition: 250ms ease-out

---

## Phase 3: Visual Hierarchy & Spacing

### Spacing Scale

**Consistent Gaps:**

| Name | Value | Use Case |
|------|-------|----------|
| Tight | 4px | Icon + text, checkbox + label |
| Base | 8px | Default spacing, siblings |
| Comfortable | 12px | Form groups, card sections |
| Spacious | 16px | Major sections |
| Generous | 24px | Screen-level separation |

**Tailwind Classes:**
- Tight: `gap-1`
- Base: `gap-2`
- Comfortable: `gap-3`
- Spacious: `gap-4`
- Generous: `gap-6`

### Card Padding

**By Card Type:**

| Type | Padding | Example |
|------|---------|---------|
| Compact | 12px | MessageCard, small items |
| Standard | 16px | ProfileCard, settings sections |
| Large | 20px | Analysis sections |

**Implementation:**
```tsx
// Compact
<p className="p-3">

// Standard
<p className="p-4">

// Large
<p className="p-5">
```

### Typography Scale

**Size Hierarchy:**

| Name | Size | Weight | Line Height | Use |
|------|------|--------|-------------|-----|
| Display | 16px | Semibold | 1.2 | Screen titles |
| Heading | 14px | Semibold | 1.2 | Section headers |
| Body | 13px | Normal | 1.5 | Default content |
| Small | 11px | Normal | 1.4 | Labels, metadata |
| Tiny | 10px | Normal | 1.4 | Fine print |

**Tailwind Classes:**
- Display: `text-base font-semibold leading-tight`
- Heading: `text-sm font-semibold leading-tight`
- Body: `text-[13px] leading-relaxed`
- Small: `text-xs leading-normal`
- Tiny: `text-[10px] leading-normal`

### Visual Grouping

**Background Variations:**

| Element | Background | Opacity | Use |
|---------|------------|---------|-----|
| Group container | `bg-card` | 50% | Related items |
| Section divider | `border-border` | 100% | 1px horizontal rule |
| Active region | `bg-muted` | 30% | Focused area |

**Implementation:**
```tsx
// Group
<div className="bg-card/50 p-4 rounded-lg space-y-3">
  {relatedItems}
</div>

// Divider
<hr className="border-border my-2" />

// Active region
<div className="bg-muted/30 p-4 rounded-lg">
  {focusedContent}
</div>
```

### Information Density

**Density Modes:**

| Mode | Spacing | Use Case |
|------|---------|----------|
| Compact | 75% of base | Data-heavy (History list) |
| Comfortable | 100% (default) | Most screens |
| Generous | 125% of base | Focused (Onboarding, Training) |

**Implementation via CSS Variables:**
```css
:root {
  --spacing-multiplier: 1;
}

.compact { --spacing-multiplier: 0.75; }
.generous { --spacing-multiplier: 1.25; }
```

---

## Phase 4: Motion & Animation

### Page Transitions

**Navigation Types:**

| Direction | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| Forward | Slide-in-left | 250ms | ease-out |
| Back | Slide-out-right | 250ms | ease-in |
| Modal entry | Slide-up | 250ms | ease-out |
| Modal exit | Slide-down | 250ms | ease-in |

**Implementation:**
```tsx
// Existing animations in tailwind.config.ts
'fade-in': 'fade-in 0.2s ease-out',
'slide-up': 'slide-up 0.3s ease-out',

// New animations needed
'slide-in-left': 'slide-in-left 0.25s ease-out',
'slide-out-right': 'slide-out-right 0.25s ease-in',
```

**Backdrop Fade:**
- Modals: `bg-black/50` fades in over 150ms
- Z-index: Backdrop at 40, modal at 50

### List Animations

**Staggered Entry:**

```tsx
// History conversation list
{conversations.map((conv, index) => (
  <ConversationCard
    key={conv.id}
    style={{
      animation: `fade-in-up 0.3s ease-out ${index * 30}ms forwards`,
      opacity: 0, // Initial state
    }}
  />
))}
```

**Animation:**
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Performance:**
- Batch limit: 10 items visible at once
- Pagination or virtualization for longer lists

### Micro-interactions

**Interaction Feedback:**

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button press | Scale 0.95→1.0 | 100ms | spring |
| Checkbox toggle | Scale 1.1→1.0 | 150ms | bounce |
| Toggle switch | Slide | 200ms | ease-in-out |
| Copy success | Stroke draw | 300ms | ease-out |
| Delete confirm | Scale 0.9→1.0 | 150ms | ease-out |

**Spring Animation:**
```css
@keyframes spring {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.button-active {
  animation: spring 100ms ease-out;
}
```

**Bounce Animation:**
```css
@keyframes bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.checkbox-toggle {
  animation: bounce 150ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Loading Motion

**Skeleton Shimmer:**

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-muted) 25%,
    var(--color-muted-hover) 50%,
    var(--color-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
```

**Note:** Current implementation uses hardcoded colors. Update to use design tokens.

### Progress Animations

**Linear Progress Bar:**

```tsx
<div
  className="h-1 bg-success transition-all duration-300"
  style={{
    width: `${progress}%`,
    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  }}
/>
```

**Color Shifts (Optional Enhancement):**
- 0-33%: Warning (#ff9800)
- 34-66%: Info (#0070f3)
- 67-100%: Success (#00c853)

---

## Implementation Priority

### Quick Wins (1-2 hours)

1. **Button hover states** - Add transition classes
2. **Input focus states** - Enhance ring visibility
3. **Copy feedback** - Add 1s checkmark timeout
4. **Toast system** - Implement basic 3-toast stack

### Medium Effort (3-5 hours)

5. **Skeleton variants** - Add TextSkeleton, AvatarSkeleton
6. **Progress bars** - Implement linear and circular
7. **Card interactions** - Hover, focus, press states
8. **List animations** - Staggered fade-in for History

### Larger Effort (6-10 hours)

9. **Page transitions** - Slide animations between screens
10. **Micro-interactions** - Spring, bounce, shake animations
11. **Spacing refactor** - Apply consistent scale across all screens
12. **Typography update** - Refine sizes and line heights

---

## Design Tokens Reference

**Existing Colors (No Changes):**
```css
--bg-base: #000
--bg-card: #111
--border: #262626
--text-1: #ededed
--text-2: #a1a1a1
--accent: #0070f3
--success: #00c853
--danger: #ee0000
```

**New Animation Durations:**
```css
--duration-instant: 100ms
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 300ms
```

**New Animation Easing:**
```css
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55)
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1)
```

---

## Accessibility Considerations

**Motion Preferences:**
- Respect `prefers-reduced-motion`
- Provide static alternatives
- No auto-play for animations longer than 1s

**Focus Indicators:**
- Minimum 2px contrast ratio
- Visible on all interactive elements
- Don't rely on color alone

**Screen Readers:**
- Announce loading states (role="status")
- Label animated elements
- Provide text equivalents

---

## Success Metrics

**Qualitative:**
- Extension feels modern and premium
- Interactions feel responsive
- Visual hierarchy is clear
- Spacing feels comfortable

**Quantitative:**
- Reduce perceived wait time (better loading feedback)
- Increase task completion rate (clearer feedback)
- Improve user satisfaction (smoother interactions)

---

## Next Steps

1. Review and approve this design
2. Create detailed implementation plan with file-by-file changes
3. Set up isolated git worktree for implementation
4. Implement phase by phase with testing
5. Deploy and gather user feedback
