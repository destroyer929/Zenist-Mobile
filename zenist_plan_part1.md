# Zenist — Complete Implementation Plan (Part 1 of 4)
## Foundation, Design System, Architecture & Data Models

---

## 1. App Identity

| Property | Value |
|---|---|
| **Name** | Zenist |
| **Tagline** | "Your calm command center" |
| **Philosophy** | Calm over chaos. Whisper, don't shout. Grace over guilt. |
| **Platform** | Web App (Vite + React) |
| **Styling** | Vanilla CSS with CSS Custom Properties |
| **State** | React Context + useReducer |
| **Storage** | localStorage (Phase 1), Supabase (Phase 2) |
| **Animations** | Framer Motion |
| **Font** | Google Fonts — "Outfit" (headings) + "Inter" (body) |

---

## 2. Design System — Every Visual Token

### 2.1 Color Palette (HSL-based for easy theming)

```css
:root {
  /* --- Base Background Layers --- */
  --bg-deep:        hsl(230, 25%, 7%);    /* Deepest background - almost black with blue tint */
  --bg-primary:     hsl(230, 20%, 11%);   /* Main app background */
  --bg-secondary:   hsl(230, 18%, 15%);   /* Card backgrounds */
  --bg-tertiary:    hsl(230, 16%, 20%);   /* Elevated cards, hover states */
  --bg-glass:       hsla(230, 20%, 18%, 0.6); /* Glassmorphism panels */

  /* --- Text Hierarchy --- */
  --text-primary:   hsl(0, 0%, 95%);      /* Main text - near white */
  --text-secondary: hsl(230, 10%, 65%);   /* Secondary info - muted */
  --text-tertiary:  hsl(230, 10%, 45%);   /* Placeholder, timestamps */
  --text-inverse:   hsl(230, 25%, 7%);    /* Text on light backgrounds */

  /* --- Accent Colors --- */
  --accent-gold:    hsl(38, 90%, 58%);    /* Primary accent - warm gold */
  --accent-amber:   hsl(28, 85%, 55%);    /* Warnings, overdue (gentle) */
  --accent-emerald: hsl(160, 70%, 45%);   /* Success, completed */
  --accent-rose:    hsl(350, 70%, 60%);   /* Priority 1 - urgent */
  --accent-blue:    hsl(215, 80%, 60%);   /* Priority 3, links */
  --accent-violet:  hsl(265, 70%, 65%);   /* Labels, tags */

  /* --- Priority Colors --- */
  --priority-1:     hsl(350, 70%, 60%);   /* Urgent - soft rose, not aggressive red */
  --priority-2:     hsl(28, 85%, 55%);    /* High - warm amber */
  --priority-3:     hsl(215, 80%, 60%);   /* Medium - calm blue */
  --priority-4:     hsl(230, 10%, 45%);   /* Low - muted, blends in */

  /* --- Surfaces --- */
  --border-subtle:  hsla(230, 20%, 40%, 0.15);
  --border-hover:   hsla(230, 20%, 60%, 0.25);
  --shadow-soft:    0 4px 24px hsla(0, 0%, 0%, 0.3);
  --shadow-glow:    0 0 20px hsla(38, 90%, 58%, 0.1);

  /* --- Glassmorphism --- */
  --glass-blur:     blur(20px);
  --glass-border:   1px solid hsla(230, 20%, 60%, 0.1);
  --glass-bg:       hsla(230, 20%, 15%, 0.5);

  /* --- Spacing Scale (8px base) --- */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* --- Border Radius --- */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* --- Typography Scale --- */
  --font-heading: 'Outfit', sans-serif;
  --font-body:    'Inter', sans-serif;
  --text-xs:   0.75rem;   /* 12px - timestamps */
  --text-sm:   0.875rem;  /* 14px - secondary text */
  --text-base: 1rem;      /* 16px - body text */
  --text-lg:   1.125rem;  /* 18px - task titles */
  --text-xl:   1.5rem;    /* 24px - section headers */
  --text-2xl:  2rem;      /* 32px - page titles */
  --text-3xl:  2.5rem;    /* 40px - greeting */

  /* --- Transitions --- */
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --duration-slow:   500ms;
}
```

### 2.2 Time-Aware Theme Adaptation

The app changes its visual "mood" based on time of day:

| Time | Background Tint | Accent | Greeting |
|---|---|---|---|
| 5 AM - 11 AM | Warm blue-gray | Soft gold | "Good morning, {name}" |
| 11 AM - 5 PM | Neutral deep blue | Clear blue | "Good afternoon, {name}" |
| 5 PM - 9 PM | Warm amber-blue | Warm amber | "Good evening, {name}" |
| 9 PM - 5 AM | Deep midnight | Soft violet | "Wind down, {name}" |

**How it works**: A `useTimeOfDay()` hook returns `morning|afternoon|evening|night`. The `<App>` component adds a `data-time="morning"` attribute to the root. CSS adjusts accent colors via `[data-time="morning"] { --accent-gold: hsl(38, 85%, 62%); }`.

### 2.3 Typography Rules

| Element | Font | Weight | Size | Letter Spacing |
|---|---|---|---|---|
| Greeting | Outfit | 300 (Light) | 40px | -0.02em |
| Page Title | Outfit | 600 (Semi) | 32px | -0.01em |
| Section Header | Outfit | 500 (Medium) | 24px | 0 |
| Task Title | Inter | 400 (Regular) | 18px | 0 |
| Task Meta | Inter | 400 | 14px | 0.01em |
| Timestamp | Inter | 500 | 12px | 0.05em |
| Command Bar | Inter | 400 | 16px | 0 |
| Button | Outfit | 500 | 14px | 0.03em |

### 2.4 Glassmorphism Card System

Every card in the app follows this structure:
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-lg);
  transition: all var(--duration-normal) var(--ease-out);
}
.glass-card:hover {
  background: hsla(230, 20%, 18%, 0.7);
  border-color: hsla(230, 20%, 60%, 0.2);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}
```

---

## 3. Project Architecture

### 3.1 Folder Structure

```
zenist/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Root component + routing
│   ├── index.css                   # Design tokens + global styles
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useTimeOfDay.js         # Returns morning/afternoon/evening/night
│   │   ├── useTaskStore.js         # Task CRUD operations
│   │   ├── useProjectStore.js      # Project management
│   │   ├── useLabelStore.js        # Label management
│   │   ├── useCommandBar.js        # Command bar state + NLP parsing
│   │   ├── useSound.js             # Audio feedback
│   │   ├── useLocalStorage.js      # Persistent storage wrapper
│   │   └── useKeyboard.js          # Global keyboard shortcuts
│   │
│   ├── context/                    # React Context providers
│   │   ├── AppContext.jsx          # Global app state
│   │   ├── ThemeContext.jsx        # Time-aware theming
│   │   └── UserContext.jsx         # User preferences + name
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Left navigation panel
│   │   │   ├── TopBar.jsx          # Greeting + search + profile
│   │   │   └── Shell.jsx           # Main layout wrapper
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskCard.jsx        # Individual task display
│   │   │   ├── TaskCheckbox.jsx    # Animated priority checkbox
│   │   │   ├── TaskList.jsx        # Scrollable task list
│   │   │   ├── TaskEditor.jsx      # Inline task editing
│   │   │   ├── SubtaskList.jsx     # Nested subtasks
│   │   │   └── TaskMeta.jsx        # Due date, project, labels display
│   │   │
│   │   ├── command/
│   │   │   ├── CommandBar.jsx      # Bottom command input
│   │   │   ├── CommandSuggestions.jsx  # Autocomplete dropdown
│   │   │   └── NLPPreview.jsx      # Shows parsed result in real-time
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.jsx     # Project in sidebar
│   │   │   ├── ProjectForm.jsx     # Create/edit project
│   │   │   └── ProjectPicker.jsx   # Dropdown project selector
│   │   │
│   │   ├── common/
│   │   │   ├── GlassCard.jsx       # Reusable glass card
│   │   │   ├── Badge.jsx           # Count/label badge
│   │   │   ├── Avatar.jsx          # User avatar
│   │   │   ├── EmptyState.jsx      # Beautiful empty states
│   │   │   ├── ProgressRing.jsx    # Circular progress indicator
│   │   │   ├── Tooltip.jsx         # Hover tooltips
│   │   │   └── ConfettiEffect.jsx  # Completion celebration
│   │   │
│   │   └── productivity/
│   │       ├── Heatmap.jsx         # Weekly activity grid
│   │       ├── StreakCounter.jsx    # Current streak display
│   │       └── DailyProgress.jsx   # Today's progress ring
│   │
│   ├── pages/                      # Full page views
│   │   ├── Dashboard.jsx           # Bento grid home
│   │   ├── Today.jsx               # Today's focused view
│   │   ├── Upcoming.jsx            # Future tasks timeline
│   │   ├── ProjectView.jsx         # Single project view
│   │   ├── SearchResults.jsx       # Search results page
│   │   ├── FocusMode.jsx           # Single-task focus
│   │   ├── Settings.jsx            # User preferences
│   │   └── Productivity.jsx        # Stats + karma
│   │
│   ├── utils/
│   │   ├── nlpParser.js            # Natural language date parser
│   │   ├── dateUtils.js            # Date formatting helpers
│   │   ├── soundManager.js         # Audio playback
│   │   ├── storage.js              # localStorage abstraction
│   │   └── constants.js            # App-wide constants
│   │
│   └── assets/
│       └── sounds/
│           ├── complete.mp3        # Task completion chime
│           ├── add.mp3             # Task added swoosh
│           └── delete.mp3          # Soft removal sound
│
├── index.html
├── package.json
└── vite.config.js
```

### 3.2 Data Models

Every piece of data in the app and its shape:

#### Task
```javascript
{
  id:          "t_abc123",          // Unique ID (nanoid)
  content:     "Buy groceries",     // Task title
  description: "Milk, eggs, bread", // Optional long description
  priority:    2,                   // 1=urgent, 2=high, 3=medium, 4=low
  projectId:   "p_xyz789",          // Parent project (null = Inbox)
  parentId:    null,                // Parent task ID (for subtasks)
  labels:      ["shopping"],        // Array of label names
  dueDate:     "2026-05-03",        // ISO date string or null
  dueTime:     "18:00",             // 24h time string or null
  recurring:   null,                // "daily"|"weekly"|"monthly"|null
  completed:   false,               // Completion state
  completedAt: null,                // ISO timestamp when completed
  createdAt:   "2026-05-02T18:30",  // Creation timestamp
  order:       3,                   // Sort order within project/section
  sectionId:   "s_sec456",          // Section within project (null = no section)
}
```

#### Project
```javascript
{
  id:        "p_xyz789",
  name:      "Work",
  color:     "hsl(215, 80%, 60%)", // User-chosen color
  icon:      "briefcase",           // Emoji or icon name
  favorite:  true,                  // Pinned to top
  archived:  false,
  order:     1,
  createdAt: "2026-05-01T10:00",
}
```

#### Label
```javascript
{
  id:    "l_lbl001",
  name:  "shopping",
  color: "hsl(265, 70%, 65%)",
}
```

#### Section (within a project)
```javascript
{
  id:        "s_sec456",
  name:      "In Progress",
  projectId: "p_xyz789",
  order:     2,
  collapsed: false,
}
```

#### UserPreferences
```javascript
{
  name:           "Karunakar",
  theme:          "auto",          // "auto"|"dark"|"light"
  soundEnabled:   true,
  focusOnStart:   false,           // Open in focus mode?
  weekStartsOn:   1,               // 0=Sun, 1=Mon
  defaultProject: null,            // Default project for quick-add
  completionSound: "chime",        // "chime"|"pop"|"none"
}
```

### 3.3 State Management Flow

```
UserAction (click/type/keyboard)
       |
       v
  Component (e.g., TaskCard)
       |
       v
  Hook (e.g., useTaskStore)
       |
       v
  Dispatch Action to Reducer
       |
       v
  AppContext (useReducer)
       |
       +---> Updates localStorage (persist)
       |
       +---> Re-renders subscribed components
       |
       +---> Triggers side effects (sounds, animations)
```

**Action types for tasks:**
- `ADD_TASK` — creates new task from command bar
- `UPDATE_TASK` — edit any field
- `COMPLETE_TASK` — marks done, triggers animation + sound
- `UNCOMPLETE_TASK` — undo completion
- `DELETE_TASK` — soft delete with undo snackbar
- `REORDER_TASK` — drag-and-drop reorder
- `MOVE_TASK` — move to different project

---

## 4. NLP Parser — How Natural Input Works

The Command Bar is the heart of Zenist. When a user types, the parser extracts structured data in real-time.

### Input Examples → Parsed Output

| User Types | Parsed Task | Date | Priority | Project | Labels |
|---|---|---|---|---|---|
| `buy milk` | "buy milk" | none | P4 | Inbox | none |
| `buy milk tomorrow` | "buy milk" | 2026-05-04 | P4 | Inbox | none |
| `call mom today 6pm` | "call mom" | 2026-05-03 18:00 | P4 | Inbox | none |
| `fix bug !1 #work` | "fix bug" | none | P1 | Work | none |
| `gym every monday @health` | "gym" | recurring:weekly(mon) | P4 | Inbox | health |
| `submit report friday !2 #work @urgent` | "submit report" | 2026-05-08 | P2 | Work | urgent |

### Parser Logic (simplified)

```
Input: "call mom tomorrow 6pm !2 #work @errands"

Step 1: Extract priority   → !2 found → priority = 2, remove from string
Step 2: Extract project     → #work found → projectId = lookup("work"), remove
Step 3: Extract labels      → @errands found → labels = ["errands"], remove
Step 4: Extract date/time   → "tomorrow 6pm" → dueDate = tomorrow, dueTime = 18:00, remove
Step 5: Remaining text      → "call mom" → content = "call mom"

Result: { content: "call mom", dueDate: "2026-05-04", dueTime: "18:00", priority: 2, project: "work", labels: ["errands"] }
```

### Supported Date Keywords
| Keyword | Maps To |
|---|---|
| `today`, `tod` | Current date |
| `tomorrow`, `tom` | Current + 1 day |
| `monday`..`sunday` | Next occurrence of that day |
| `next week` | Next Monday |
| `next month` | 1st of next month |
| `jan 15`, `feb 3` | Specific month + day |
| `3pm`, `15:00`, `6pm` | Time (added to date) |
| `every day/week/month` | Recurring flag |

---

## 5. Sound System

| Event | Sound | Duration | Character |
|---|---|---|---|
| Task completed | Soft wind-chime | 400ms | Peaceful, rewarding |
| Task added | Gentle "whoosh" | 250ms | Quick, confirming |
| Task deleted | Low soft thud | 200ms | Subtle, non-alarming |
| All tasks done | Warm chord | 800ms | Celebratory, calm |
| Error/invalid | Soft double-tap | 150ms | Gentle correction |

**Implementation**: `soundManager.js` uses the Web Audio API. Sounds are small MP3s (~5KB each) loaded once and played via `AudioContext`. Volume respects user preference.

---

## 6. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Q` or `/` | Open Command Bar (focus input) |
| `Escape` | Close Command Bar / Cancel edit |
| `Ctrl+Enter` | Submit task from Command Bar |
| `1-4` (in task hover) | Set priority |
| `F` | Toggle Focus Mode |
| `S` | Open Search |
| `H` | Go to Home/Dashboard |
| `T` | Go to Today view |
| `?` | Show shortcut help overlay |

---

> [!IMPORTANT]
> **Part 1 Complete.** This covers the foundation — tokens, architecture, data models, NLP, sounds, and shortcuts. Part 2 will cover every screen in detail with component breakdowns and user flows.
