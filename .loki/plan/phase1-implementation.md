# Phase 1 Implementation Plan - Working Extension

**Goal**: Build app shell that loads in Chrome with header, bottom nav, and three screens using correct fonts and colors.

**Quality Gates**:
- [ ] Extension installs without errors
- [ ] Side panel opens on icon click
- [ ] All three screens render with correct styling
- [ ] Build passes (`npm run build`)

---

## Task 1.1: UI Primitives (Priority: CRITICAL)
**Estimated**: 30 minutes

### 1.1.1 Button Component
**File**: `components/ui/Button.tsx`
```typescript
variants: 'default' | 'inverted' | 'ghost'
sizes: 'sm' | 'md' | 'lg'
```
- Default: bg-100, hover:bg-150, text-primary
- Inverted: bg-primary, text-inverted (CTA style)
- Ghost: transparent, hover:bg-100

### 1.1.2 Input Component
**File**: `components/ui/Input.tsx`
- bg-100 background
- border-border border
- border-focus on focus
- Proper padding (12px)

### 1.1.3 Card Component
**File**: `components/ui/Card.tsx`
- bg-100 background
- border-border border
- radius-lg

### 1.1.4 Badge Component
**File**: `components/ui/Badge.tsx`
- Small status indicators
- Platform pills (𝕏, in, GH, 🌐)

### 1.1.5 Utility Functions
**File**: `lib/utils/cn.ts`
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Verification**:
- [ ] Visual inspection of all variants
- [ ] TypeScript types pass
- [ ] Build succeeds

---

## Task 1.2: App Chrome (Priority: HIGH)
**Estimated**: 20 minutes

### 1.2.1 Header Component
**File**: `components/app/Header.tsx`
```typescript
interface HeaderProps {
  platformBadge?: string;
}
```
- Fixed height: 48px (h-12)
- bg-050 background
- border-bottom
- Logo: "⚡ Reply Guy" (16px semibold)
- Optional platform badge right-aligned

### 1.2.2 Bottom Nav Component
**File**: `components/app/BottomNav.tsx`
```typescript
interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}
```
- Fixed height: 56px (h-14)
- bg-050 background
- border-top
- 3 buttons: Outreach (💬), History (📋), Settings (⚙️)
- Active: text-primary, Inactive: text-tertiary

**Verification**:
- [ ] Header renders with logo
- [ ] Platform badge displays when provided
- [ ] Bottom nav switches tabs
- [ ] Active tab highlighted

---

## Task 1.3: Onboarding Screen (Priority: HIGH)
**Estimated**: 25 minutes

**File**: `components/screens/OnboardingScreen.tsx`

**Layout**:
```
┌────────────────────────────┐
│     [KeyIcon xxl #666]     │
│                            │
│   Set up your API key      │
│                            │
│  Reply Guy uses OpenRouter │
│  to analyze pages and...   │
│                            │
│  ┌──────────────────────┐ │
│  │  Enter API key       │ │
│  └──────────────────────┘ │
│  ┌──────────────────────┐ │
│  │   Get Started →      │ │
│  └──────────────────────┘ │
│  Get a key at openrouter.ai │
└────────────────────────────┘
```

**Behavior**:
1. Check `chrome.storage.local` for `apiKey` on mount
2. If exists, skip to IdleScreen
3. On submit:
   - Validate non-empty
   - Save to `chrome.storage.local`
   - Transition to IdleScreen

**Verification**:
- [ ] Screen renders centered content
- [ ] API key saves to storage
- [ ] Transition to IdleScreen on success
- [ ] Error handling for empty input

---

## Task 1.4: Idle Screen (Priority: HIGH)
**Estimated**: 20 minutes

**File**: `components/screens/IdleScreen.tsx`

**Layout**:
```
┌────────────────────────────┐
│   [ConfidenceIcon xxl]     │
│                            │
│    Browse any page         │
│  Navigate to any profile... │
│                            │
│  Works best on:            │
│  ┌────┐ ┌────┐ ┌────┐     │
│  │ 𝕎  │ │ in │ │ GH │     │
│  └────┘ └────┘ └────┘     │
└────────────────────────────┘
```

**State**: Shown when `hasApiKey` true, `pageData` null

**Verification**:
- [ ] Renders with icon and text
- [ ] Platform badges display correctly
- [ ] Disappears when pageData arrives

---

## Task 1.5: App Integration (Priority: CRITICAL)
**Estimated**: 30 minutes

**File**: Update `entrypoints/sidepanel/App.tsx`

**Changes**:
1. Import screens
2. Import Header, BottomNav
3. Add state management for `hasApiKey`
4. Route to correct screen based on state:
   - No API key → OnboardingScreen
   - Has API key, no pageData → IdleScreen
   - Has pageData → OutreachScreen (placeholder)

```typescript
const [hasApiKey, setHasApiKey] = useState(false);
const [pageData, setPageData] = useState<ScrapedData | null>(null);

useEffect(() => {
  // Check for API key
  chrome.storage.local.get(['apiKey'], (result) => {
    setHasApiKey(!!result.apiKey);
  });
  // Listen for page data
  chrome.storage.session.onChanged.addListener((changes) => {
    if (changes.currentPageData) {
      setPageData(changes.currentPageData.newValue);
    }
  });
}, []);
```

**Verification**:
- [ ] OnboardingScreen shows first launch
- [ ] IdleScreen shows after API key entered
- [ ] Bottom nav switches screens
- [ ] Page data triggers state change

---

## Task 1.6: Toast System (Priority: MEDIUM)
**Estimated**: 20 minutes

**File**: `components/app/Toast.tsx`

**Features**:
- Fixed position bottom-center (above nav)
- Auto-dismiss after 3s
- Types: success, error, info
- Animation: slide up + fade in

**Zustand Integration**:
```typescript
// Add to store
toasts: Toast[];
addToast: (toast: Omit<Toast, 'id'>) => void;
removeToast: (id: string) => void;
```

**Verification**:
- [ ] Toast appears on trigger
- [ ] Auto-dismisses after timeout
- [ ] Multiple toasts stack correctly
- [ ] Manual dismiss works

---

## Task 1.7: Build Verification (Priority: CRITICAL)
**Estimated**: 10 minutes

**Steps**:
1. Run `npm run build`
2. Check output size (< 300 kB target)
3. Verify no TypeScript errors
4. Verify manifest.json has correct permissions

**Load Test**:
1. Open `chrome://extensions`
2. Enable Developer Mode
3. "Load unpacked" → `.output/chrome-mv3`
4. Click extension icon
5. Verify side panel opens

**Verification**:
- [ ] Build succeeds (exit code 0)
- [ ] Extension loads without errors
- [ ] Side panel opens on icon click
- [ ] OnboardingScreen displays
- [ ] Can enter API key
- [ ] Tab switching works

---

## Task Order (Dependency Chain)

```
1.1 (UI Primitives)
  ├─→ 1.2 (App Chrome)
  │     ├─→ 1.3 (Onboarding)
  │     └─→ 1.4 (Idle)
  └─→ 1.5 (App Integration)
        └─→ 1.6 (Toast)
              └─→ 1.7 (Build Verification)
```

**Critical Path**: 1.1 → 1.2 → 1.3 → 1.5 → 1.7
**Parallelizable**: 1.4 (can build while 1.3 in progress)
**Optional**: 1.6 (can add later if needed)

---

## Total Time Estimate
- **Core Path**: 1.1 (30) + 1.2 (20) + 1.3 (25) + 1.5 (30) + 1.7 (10) = **115 minutes**
- **With Toast**: +20 minutes = **135 minutes**

---

## Exit Criteria

Phase 1 is complete when:
1. Extension installs and loads
2. Side panel opens on icon click
3. Onboarding flow works (enter API key)
4. Idle screen displays with platform badges
5. Tab navigation switches between screens
6. All components use correct design tokens
7. Build passes and loads in Chrome

---

## Next Phase Preview

**Phase 2**: Page Scraping
- Integrate existing content.ts scraping
- Display real page data in ProfileCard/PageCard
- Platform detection working (X, LinkedIn, GitHub, generic)
