# Visual Polish & Micro-Interactions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement visual polish, micro-interactions, refined spacing, and motion across all Reply Guy screens to create a modern, responsive, premium feel.

**Architecture:** Systematic enhancement of 6 screens (Idle, Onboarding, Outreach, History, Settings, VoiceTraining) through 4 phases: loading states, interactive elements, visual hierarchy, and motion. All changes respect existing design tokens and 320px side panel constraints.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, WXT framework, Chrome Extension APIs

**Design Reference:** `docs/plans/2026-02-08-visual-polish-design.md`

---

## Phase 1: Loading States & Feedback

### Task 1: Enhanced Skeleton Component

**Files:**
- Modify: `components/ui/Skeleton.tsx`
- Test: `components/ui/__tests__/Skeleton.test.tsx` (create)

**Step 1: Write failing test for variant prop**

```tsx
// components/ui/__tests__/Skeleton.test.tsx
import { render, screen } from '@testing-library/react'
import Skeleton from '../Skeleton'

describe('Skeleton', () => {
  it('renders pulse variant by default', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })

  it('renders avatar variant with rounded-full', () => {
    render(<Skeleton variant="avatar" />)
    expect(screen.getByRole('status')).toHaveClass('rounded-full')
  })

  it('renders text variant with varying widths', () => {
    render(<Skeleton variant="text" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'text')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- Skeleton.test.tsx`
Expected: FAIL - variant prop doesn't exist, aria-label missing

**Step 3: Implement Skeleton variants**

```tsx
// components/ui/Skeleton.tsx
interface SkeletonProps {
  className?: string
  variant?: 'pulse' | 'text' | 'avatar'
}

export default function Skeleton({ className = '', variant = 'pulse' }: SkeletonProps) {
  const baseClasses = 'bg-muted animate-shimmer'
  const variantClasses = {
    pulse: 'rounded-lg',
    text: 'rounded h-4 w-full',
    avatar: 'rounded-full'
  }

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- Skeleton.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/Skeleton.tsx components/ui/__tests__/Skeleton.test.tsx
git commit -m "feat: add Skeleton variants with accessibility support

- Add pulse, text, avatar variants
- Add role=status and aria-label for screen readers
- Add tests for variant behavior"
```

---

### Task 2: Linear Progress Bar Component

**Files:**
- Create: `components/ui/Progress.tsx` (already exists, enhance)
- Modify: `components/ui/Progress.tsx`

**Step 1: Write failing test for smooth animation**

```tsx
// components/ui/__tests__/Progress.test.tsx
import { render, screen } from '@testing-library/react'
import Progress from '../Progress'

describe('Progress smooth animation', () => {
  it('animates width changes with cubic-bezier', () => {
    render(<Progress value={50} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle({
      transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- Progress.test.tsx`
Expected: FAIL - transition timing not set

**Step 3: Enhance Progress component**

```tsx
// components/ui/Progress.tsx
interface ProgressProps {
  value: number
  className?: string
}

export default function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1 bg-muted overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-success transition-all duration-300"
        style={{
          width: `${value}%`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
      />
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- Progress.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/Progress.tsx components/ui/__tests__/Progress.test.tsx
git commit -m "feat: enhance Progress with smooth animation

- Add cubic-bezier easing for width transitions
- Add proper ARIA attributes for accessibility
- Test animation timing function"
```

---

### Task 3: Toast Notification System

**Files:**
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/useToast.ts`
- Modify: `entrypoints/sidepanel/App.tsx`

**Step 1: Write failing test for toast hook**

```tsx
// components/ui/__tests__/useToast.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast', () => {
  it('adds toast to queue', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: 'Test', type: 'success' })
    })
    expect(result.current.toasts).toHaveLength(1)
  })

  it('removes toast after timeout', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: 'Test', type: 'success' })
    })
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(result.current.toasts).toHaveLength(0)
    jest.useRealTimers()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- useToast.test.tsx`
Expected: FAIL - useToast hook doesn't exist

**Step 3: Implement toast system**

```tsx
// components/ui/useToast.ts
import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ message, type }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, message, type }

    setToasts(prev => [...prev.slice(-2), newToast])

    // Auto-dismiss
    const duration = type === 'error' ? 0 : (type === 'info' ? 2000 : 3000)
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, remove }
}
```

```tsx
// components/ui/Toast.tsx
import { X, Check, AlertCircle, Info } from '@/lib/icons'
import { Toast } from './useToast'

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const icons = {
    success: <Check size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />
  }

  const colors = {
    success: 'bg-success/10 border-success text-success',
    error: 'bg-destructive/10 border-destructive text-destructive',
    info: 'bg-accent/10 border-accent text-accent'
  }

  return (
    <div
      className={`fixed bottom-14 left-2 right-2 p-3 rounded-lg border flex items-center gap-3 animate-slide-up ${colors[toast.type]}`}
      style={{ zIndex: 100 }}
    >
      {icons[toast.type]}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss toast"
        className="p-1 hover:bg-black/10 rounded"
      >
        <X size={14} />
      </button>
    </div>
  )
}
```

```tsx
// entrypoints/sidepanel/App.tsx - Add ToastContainer
import { useToast } from '@/components/ui/useToast'
import Toast from '@/components/ui/Toast'

export default function App() {
  const { toasts, remove } = useToast()

  return (
    <div className="h-screen flex flex-col">
      {/* existing content */}
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={remove} />
      ))}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- useToast.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/ui/Toast.tsx components/ui/useToast.ts entrypoints/sidepanel/App.tsx
git commit -m "feat: add toast notification system

- Add useToast hook for state management
- Add Toast component with success/error/info variants
- Add auto-dismiss with configurable timeouts
- Add ToastContainer to App.tsx
- Stack toasts up to 3, fixed above bottom nav"
```

---

### Task 4: Copy Button Feedback

**Files:**
- Modify: `components/messages/CopyButton.tsx`

**Step 1: Write failing test for feedback timeout**

```tsx
// components/messages/__tests__/CopyButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CopyButton from '../CopyButton'

describe('CopyButton feedback', () => {
  it('shows checkmark for 1s after copy', async () => {
    render(<CopyButton text="test" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(screen.getByLabelText('Copied!')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByLabelText('Copied!')).not.toBeInTheDocument()
    }, { timeout: 1500 })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CopyButton.test.tsx`
Expected: FAIL - no feedback mechanism exists

**Step 3: Implement copy feedback**

```tsx
// components/messages/CopyButton.tsx
import { useState } from 'react'
import { Copy, Check } from '@/lib/icons'

interface CopyButtonProps {
  text: string
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className="p-2 hover:bg-muted rounded-lg transition-colors"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CopyButton.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/messages/CopyButton.tsx
git commit -m "feat: add visual feedback to copy button

- Show checkmark icon for 1s after successful copy
- Update aria-label to reflect current state
- Add hover state for better interactivity"
```

---

## Phase 2: Interactive Elements

### Task 5: Button State Transitions

**Files:**
- Modify: `components/ui/button.tsx`

**Step 1: Add transition classes**

All button variants already exist. Add consistent transition classes:

```tsx
// components/ui/button.tsx - Add to base classes
className={cn(
  // Base styles
  'relative inline-flex items-center justify-center font-semibold',
  'transition-all duration-150 ease-out', // ADD THIS
  'rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
  // ... rest
)}
```

**Step 2: Test button hover states manually**

Run: `npm run dev`
Open extension, hover over buttons, verify smooth color transitions

**Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat: add smooth transitions to all button states

- Add transition-all duration-150 to base button class
- Ensures hover, active, focus states animate smoothly"
```

---

### Task 6: Card Hover and Press States

**Files:**
- Modify: `components/ui/card.tsx`

**Step 1: Add interactive classes**

```tsx
// components/ui/card.tsx - Update Card component
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-card',
          'transition-all duration-150 ease-out', // ADD
          'hover:border-border/80 active:scale-[0.98]', // ADD
          'focus-within:ring-2 focus-within:ring-primary/50', // ADD
          {
            'border border-border': variant === 'default' || variant === 'elevated',
            'border-2 border-border': variant === 'bordered',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
```

**Step 2: Test card interactions**

Run: `npm run dev`
Hover over cards in History screen, verify border brightens and scale effect

**Step 3: Commit**

```bash
git add components/ui/card.tsx
git commit -m "feat: add hover and press states to cards

- Add border brightening on hover
- Add subtle scale down on press (0.98)
- Add focus ring for keyboard navigation"
```

---

### Task 7: Input Focus and Error States

**Files:**
- Modify: `components/ui/input.tsx`

**Step 1: Add shake animation for errors**

```css
/* styles/globals.css - Add animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.input-error {
  animation: shake 300ms ease-in-out;
}
```

**Step 2: Enhance input component**

```tsx
// components/ui/input.tsx
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm text-foreground',
          'transition-colors duration-150', // ADD
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50', // ENHANCE
          error && 'border-destructive animate-shake', // ADD
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
```

**Step 3: Test input states**

Run: `npm run dev`
Test focus ring on OnboardingScreen, test error state with invalid API key

**Step 4: Commit**

```bash
git add components/ui/input.tsx styles/globals.css
git commit -m "feat: enhance input states with animations

- Add shake animation for error state
- Enhance focus ring with accent color
- Add smooth color transitions"
```

---

### Task 8: Tab Navigation Polish

**Files:**
- Modify: `entrypoints/sidepanel/App.tsx` (bottom nav)

**Step 1: Update tab button styles**

```tsx
// entrypoints/sidepanel/App.tsx - Find tab buttons
<Button
  variant="ghost"
  className={cn(
    'flex-1 flex flex-col items-center gap-1 py-2',
    activeScreen === 'outreach' && 'bg-cta text-cta-foreground', // KEEP
    'transition-all duration-150', // ADD
  )}
>
  <Icon size={18} />
  <span className="text-[10px]">{label}</span>
</Button>
```

**Step 2: Add sliding indicator**

```tsx
// entrypoints/sidepanel/App.tsx - Add indicator div
<div className="relative flex">
  <div
    className="absolute top-0 h-0.5 bg-accent transition-all duration-250 ease-out"
    style={{
      left: activeScreen === 'outreach' ? '0%' : activeScreen === 'history' ? '33.33%' : '66.66%',
      width: '33.33%'
    }}
  />
  {tabs}
</div>
```

**Step 3: Test tab transitions**

Run: `npm run dev`
Click through tabs, verify indicator slides smoothly

**Step 4: Commit**

```bash
git add entrypoints/sidepanel/App.tsx
git commit -m "feat: add sliding indicator to tab navigation

- Add animated indicator bar that slides to active tab
- Add smooth transitions to tab buttons
- 250ms ease-out for indicator movement"
```

---

## Phase 3: Visual Hierarchy & Spacing

### Task 9: Apply Consistent Spacing Scale

**Files:**
- Modify: `components/screens/HistoryScreen.tsx`
- Modify: `components/screens/SettingsScreen.tsx`
- Modify: `components/screens/OnboardingScreen.tsx`

**Step 1: Update HistoryScreen spacing**

```tsx
// components/screens/HistoryScreen.tsx - Adjust spacing
// Search section: Comfortable (12px)
<div className="p-4 space-y-3"> { /* Changed from space-y-4 */ }
  <Input placeholder="Search..." />
  <div className="flex gap-2"> { /* Changed from gap-3 */ }
    {/* filter chips */}
  </div>
</div>

// Conversation cards: Compact (12px padding)
<Card className="p-3"> { /* Changed from p-4 */ }
  <div className="space-y-2"> { /* Changed from space-y-3 */ }
    {/* content */}
  </div>
</Card>
```

**Step 2: Update SettingsScreen spacing**

```tsx
// components/screens/SettingsScreen.tsx - Standard spacing
<div className="p-4 space-y-4"> { /* Keep at 16px for major sections */}
  <section className="space-y-3"> { /* Use 12px for section items */ }
    {/* settings items */}
  </section>
</div>
```

**Step 3: Update OnboardingScreen spacing**

```tsx
// components/screens/OnboardingScreen.tsx - Generous spacing
<div className="p-6 space-y-6"> { /* Changed from p-4 space-y-4 */ }
  {/* content */}
</div>
```

**Step 4: Test spacing visually**

Run: `npm run dev`
Check each screen, verify spacing feels balanced

**Step 5: Commit**

```bash
git add components/screens/HistoryScreen.tsx components/screens/SettingsScreen.tsx components/screens/OnboardingScreen.tsx
git commit -m "style: apply consistent spacing scale across screens

- History: Compact spacing (12px) for density
- Settings: Standard spacing (16px) for readability
- Onboarding: Generous spacing (24px) for focus
- Use gap-2 (8px), gap-3 (12px), gap-4 (16px), gap-6 (24px)"
```

---

### Task 10: Typography Refinement

**Files:**
- Modify: All screen components

**Step 1: Update typography sizes**

```tsx
// Apply to all screens consistently:

// Screen titles (Display: 16px semibold)
<h1 className="text-base font-semibold leading-tight">

// Section headers (Heading: 14px semibold)
<h2 className="text-sm font-semibold leading-tight">

// Body text (Body: 13px normal)
<p className="text-[13px] leading-relaxed">

// Labels/metadata (Small: 11px normal)
<span className="text-xs leading-normal">

// Fine print (Tiny: 10px normal)
<span className="text-[10px] leading-normal">
```

**Step 2: Apply to key screens**

```tsx
// HistoryScreen.tsx example
<h1 className="text-base font-semibold leading-tight mb-4">History</h1>
<h2 className="text-sm font-semibold leading-tight mb-3">Today</h2>
<p className="text-[13px] leading-relaxed">{message}</p>
<span className="text-xs leading-normal text-muted-foreground">{timestamp}</span>
```

**Step 3: Test readability**

Run: `npm run dev`
Verify hierarchy is clear, text is readable at all sizes

**Step 4: Commit**

```bash
git add components/screens/
git commit -m "style: refine typography scale across all screens

- Display: 16px semibold (screen titles)
- Heading: 14px semibold (sections)
- Body: 13px normal (content)
- Small: 11px normal (labels)
- Tiny: 10px normal (fine print)
- Adjust line heights for optimal readability"
```

---

## Phase 4: Motion & Animation

### Task 11: Page Transition Animations

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `entrypoints/sidepanel/App.tsx`

**Step 1: Add slide animations to Tailwind**

```tsx
// tailwind.config.ts - Add to keyframes
keyframes: {
  // ... existing
  'slide-in-left': {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  'slide-out-right': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-100%)' },
  },
}

animation: {
  // ... existing
  'slide-in-left': 'slide-in-left 0.25s ease-out',
  'slide-out-right': 'slide-out-right 0.25s ease-in',
}
```

**Step 2: Add transition wrapper to App**

```tsx
// entrypoints/sidepanel/App.tsx
import { useEffect, useState } from 'react'

export default function App() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayScreen, setDisplayScreen] = useState(activeScreen)

  useEffect(() => {
    if (activeScreen !== displayScreen) {
      setIsTransitioning(true)
      setTimeout(() => {
        setDisplayScreen(activeScreen)
        setIsTransitioning(false)
      }, 250)
    }
  }, [activeScreen])

  return (
    <div className="h-screen flex flex-col">
      <main className={cn(
        'flex-1 overflow-y-auto',
        isTransitioning && 'animate-slide-out-right',
        !isTransitioning && 'animate-slide-in-left'
      )}>
        {screenContent}
      </main>
    </div>
  )
}
```

**Step 3: Test transitions**

Run: `npm run dev`
Navigate between screens, verify smooth slide animations

**Step 4: Commit**

```bash
git add tailwind.config.ts entrypoints/sidepanel/App.tsx
git commit -m "feat: add page transition animations

- Add slide-in-left and slide-out-right animations
- Apply transitions on screen navigation change
- 250ms duration with ease-out/ease-in timing"
```

---

### Task 12: List Stagger Animation

**Files:**
- Modify: `components/screens/HistoryScreen.tsx`

**Step 1: Add staggered animation**

```tsx
// components/screens/HistoryScreen.tsx
{conversations.map((conv, index) => (
  <ConversationCard
    key={conv.id}
    conversation={conv}
    style={{
      animation: `fade-in-up 0.3s ease-out ${index * 30}ms forwards`,
      opacity: 0,
    }}
  />
))}
```

**Step 2: Add fade-in-up keyframe**

```css
/* styles/globals.css */
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

**Step 3: Test stagger effect**

Run: `npm run dev`
Open History screen, verify conversations animate in sequentially

**Step 4: Commit**

```bash
git add components/screens/HistoryScreen.tsx styles/globals.css
git commit -m "feat: add staggered list animation to History

- Conversations fade in sequentially with 30ms delays
- Subtle translateY motion for polished feel
- Batch limited to 10 items for performance"
```

---

### Task 13: Micro-interaction Animations

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx` (checkbox if exists)

**Step 1: Add spring and bounce keyframes**

```tsx
// tailwind.config.ts
keyframes: {
  // ... existing
  'spring': {
    '0%': { transform: 'scale(0.95)' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(1)' },
  },
  'bounce': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
  },
}

animation: {
  // ... existing
  spring: 'spring 100ms ease-out',
  bounce: 'bounce 150ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
```

**Step 2: Add active state animations**

```tsx
// components/ui/button.tsx - Add to base classes
className={cn(
  'active:animate-spring', // ADD THIS
  // ... rest
)}

// For checkboxes/toggles
className={cn(
  'transition-transform duration-150',
  checked && 'animate-bounce', // ADD THIS
)}
```

**Step 3: Test micro-interactions**

Run: `npm run dev`
Click buttons, verify spring animation on press
Click checkboxes/toggles, verify bounce effect

**Step 4: Commit**

```bash
git add tailwind.config.ts components/ui/
git commit -m "feat: add micro-interaction animations

- Add spring animation to button active states
- Add bounce animation to checkbox/toggle toggles
- Enhances perceived responsiveness and feedback"
```

---

### Task 14: Skeleton Shimmer Refinement

**Files:**
- Modify: `components/ui/Skeleton.tsx`
- Modify: `styles/globals.css`

**Step 1: Update shimmer animation**

```css
/* styles/globals.css - Replace existing shimmer */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    oklch(var(--color-muted)) 0%,
    oklch(var(--color-muted-hover)) 50%,
    oklch(var(--color-muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
```

**Step 2: Update Skeleton to use CSS class**

```tsx
// components/ui/Skeleton.tsx
export default function Skeleton({ className = '', variant = 'pulse' }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`skeleton-shimmer ${variantClasses[variant]} ${className}`}
    />
  )
}
```

**Step 3: Test shimmer effect**

Run: `npm run dev`
Trigger loading states, verify smooth shimmer animation

**Step 4: Commit**

```bash
git add components/ui/Skeleton.tsx styles/globals.css
git commit -m "refactor: use design tokens for skeleton shimmer

- Replace hardcoded colors with CSS variables
- Move shimmer animation to global CSS
- Ensures consistent theming across all skeletons"
```

---

## Final Tasks

### Task 15: Accessibility Audit

**Files:**
- All modified components

**Step 1: Test keyboard navigation**

Run: `npm run dev`
Navigate extension using only Tab key
Verify all interactive elements are focusable
Verify focus indicators are visible

**Step 2: Test screen reader compatibility**

Run with ChromeVox or NVDA
Verify all icons have aria-labels
Verify loading states are announced
Verify toasts are announced

**Step 3: Test reduced motion preference**

Chrome Settings → Accessibility → Reduce motion
Verify all animations respect preference
Add `prefers-reduced-motion` media query if needed

**Step 4: Commit accessibility fixes**

```bash
git add .
git commit -m "a11y: improve accessibility across all components

- Ensure keyboard navigation works throughout
- Add ARIA labels to all icon-only buttons
- Respect prefers-reduced-motion setting
- Test with screen readers"
```

---

### Task 16: Cross-Browser Testing

**Step 1: Test in Chrome**

Run: `npm run build && npm run zip`
Load unpacked extension in Chrome
Test all features

**Step 2: Test visual polish**

- Load all screens
- Trigger all animations
- Verify spacing and typography
- Check color contrast

**Step 3: Document any issues**

Create: `docs/testing-notes.md`

**Step 4: Final commit**

```bash
git add docs/testing-notes.md
git commit -m "test: document cross-browser testing results

- Test all visual polish in Chrome
- Verify animations, spacing, typography
- Document any browser-specific issues"
```

---

## Testing Strategy

### Manual Testing Checklist

For each screen:
- [ ] Load time feels fast (perceived performance)
- [ ] Hover states work on all interactive elements
- [ ] Press states provide feedback
- [ ] Focus rings are visible
- [ ] Loading states are clear
- [ ] Error states provide guidance
- [ ] Success feedback is satisfying
- [ ] Transitions are smooth
- [ ] Spacing feels balanced
- [ ] Typography hierarchy is clear

### Automated Testing

Add tests for:
- Toast timeout behavior
- Copy button feedback timing
- Skeleton variant rendering
- Progress bar animation
- List stagger delays

### Performance Testing

- Monitor bundle size impact
- Check animation performance (use Chrome DevTools Performance tab)
- Verify 60fps animations
- Test on low-end devices

---

## Rollback Plan

If issues arise:
1. Revert last commit: `git revert HEAD`
2. If needed, revert to baseline: `git reset --hard <commit-before-phase1>`
3. Report issue with reproduction steps

---

## Success Criteria

- All 4 phases implemented
- All tests passing
- Manual testing complete
- No regressions in functionality
- Visual polish meets design spec
- Performance remains acceptable
- Accessibility standards met

---

## Next Steps After Implementation

1. Deploy to test environment
2. Gather user feedback
3. Iterate on specific issues
4. Update design docs with learnings
5. Consider Phase 5 enhancements

---

**Estimated Timeline:**
- Phase 1: 3-4 hours
- Phase 2: 2-3 hours
- Phase 3: 2-3 hours
- Phase 4: 3-4 hours
- Testing & Polish: 2-3 hours

**Total: 12-17 hours**
