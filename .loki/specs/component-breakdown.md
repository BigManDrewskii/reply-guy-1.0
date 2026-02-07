# Component Breakdown - Phase 1

## App Shell Components (Already Created)
- ✅ `entrypoints/sidepanel/App.tsx` - Main app with tab routing
- ✅ Basic header with "⚡ Reply Guy" title
- ✅ Bottom nav with 3 tabs (Outreach, History, Settings)

## Screen Components To Build

### 1. Onboarding Screen (`components/screens/OnboardingScreen.tsx`)
**Purpose**: First-time setup - user enters OpenRouter API key
**State**: `hasApiKey` from chrome.storage.local

**UI Elements**:
- Large API key icon centered
- "Set up your API key" heading
- Description text about OpenRouter
- Input field for API key (bg-100, border)
- "Get Started →" button (inverted CTA)
- Link to openrouter.ai

**Dependencies**:
- `components/ui/Input.tsx`
- `components/ui/Button.tsx`

---

### 2. Idle Screen (`components/screens/IdleScreen.tsx`)
**Purpose**: Shown when side panel is open but no page data yet
**State**: `hasApiKey` true, `pageData` null

**UI Elements**:
- Confidence icon centered
- "Browse any page" heading
- Description text
- Platform pills (𝕏, in, GH)

**Dependencies**:
- `components/ui/Badge.tsx`

---

### 3. Outreach Screen (`components/screens/OutreachScreen.tsx`)
**Purpose**: Main screen showing analysis and generated messages
**State**: `hasApiKey` true, `pageData` loaded

**Sub-components**:
- `components/profile/ProfileCard.tsx` - Adapts to platform
- `components/profile/PageCard.tsx` - For generic sites
- `components/profile/ConfidenceBar.tsx` - Outreach score
- `components/profile/ConversationWarning.tsx` - Prior contact alert
- `components/messages/AngleTabs.tsx` - 4 angle selector
- `components/messages/MessageCard.tsx` - Individual message
- `components/messages/CopyButton.tsx` - Copy to clipboard
- `components/messages/ActionBar.tsx` - Regenerate/Edit actions

**States**:
- Loading (skeletons)
- Ready (messages generated)
- Error

---

### 4. History Screen (`components/screens/HistoryScreen.tsx`)
**Purpose**: Browse past conversations
**Components**:
- `components/history/FilterChips.tsx` - Platform filters
- `components/history/ConversationRow.tsx` - List item
- `components/history/ConversationDetail.tsx` - Expanded view

**Dependencies**:
- `lib/db.ts` - Dexie queries
- `hooks/useConversation.ts` - Live query hook

---

### 5. Settings Screen (`components/screens/SettingsScreen.tsx`)
**Purpose**: API key, voice training, data management
**Components**:
- `components/settings/ApiKeyInput.tsx` - Show/hide key
- `components/settings/VoiceProfileCard.tsx` - Training status
- `components/settings/DataManagement.tsx` - Clear cache/delete

---

## UI Components (Atomic Design)

### `components/ui/Button.tsx`
Variants: default, inverted, ghost
Sizes: sm, md, lg

### `components/ui/Input.tsx`
Standard text input with border focus states

### `components/ui/Card.tsx`
bg-100 background with border

### `components/ui/Badge.tsx`
Small status indicators and platform pills

### `components/ui/Skeleton.tsx`
Shimmer loading states

### `components/ui/Tabs.tsx`
Tab navigation (horizontal)

### `components/ui/Sheet.tsx`
Bottom sheet for post-copy confirmation

### `components/ui/Divider.tsx`
1px border separator

---

## Shared Components

### `components/app/Header.tsx`
**Props**: `platformBadge?: string`
**Layout**: Logo left, optional platform badge right

### `components/app/BottomNav.tsx`
**Props**: `activeTab: Tab`, `onTabChange: (tab: Tab) => void`
**Layout**: 3 icon + label buttons

### `components/app/Toast.tsx`
**Props**: `message`, `type`, `duration`
**Behavior**: Auto-dismiss after N ms

---

## Utility Components

### `lib/icons.ts`
Centralized icon registry (already specified in PRD)

### `lib/utils/cn.ts`
`clsx` + `tailwind-merge` helper

---

## Component Priority

**Phase 1a (Core Shell)**:
1. Button, Input, Card, Badge (UI primitives)
2. Header, BottomNav (app chrome)
3. OnboardingScreen, IdleScreen (empty states)

**Phase 1b (Data Display)**:
4. Skeleton, Toast (feedback)
5. ProfileCard, PageCard (data cards)
6. ConfidenceBar (analysis display)

**Phase 1c (Interactive)**:
7. AngleTabs, MessageCard, CopyButton
8. OutreachScreen (full flow)
9. HistoryScreen, SettingsScreen

---

## File Structure

```
components/
├── app/
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   └── Toast.tsx
├── screens/
│   ├── OnboardingScreen.tsx
│   ├── IdleScreen.tsx
│   ├── OutreachScreen.tsx
│   ├── HistoryScreen.tsx
│   └── SettingsScreen.tsx
├── profile/
│   ├── ProfileCard.tsx
│   ├── PageCard.tsx
│   ├── ConfidenceBar.tsx
│   └── ConversationWarning.tsx
├── messages/
│   ├── AngleTabs.tsx
│   ├── MessageCard.tsx
│   ├── CopyButton.tsx
│   └── ActionBar.tsx
├── history/
│   ├── FilterChips.tsx
│   ├── ConversationRow.tsx
│   └── ConversationDetail.tsx
├── settings/
│   ├── ApiKeyInput.tsx
│   ├── VoiceProfileCard.tsx
│   └── DataManagement.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Card.tsx
    ├── Badge.tsx
    ├── Skeleton.tsx
    ├── Tabs.tsx
    ├── Sheet.tsx
    └── Divider.tsx
```
