# Stage 6: Dynamic Views — Technical Deep-Dive

## 1. Component: UpcomingTimeline.jsx
*   **Logic:**
    ```javascript
    const days = Array.from({length: 7}, (_, i) => dayjs().add(i, 'day'));
    ```
*   **UI:** A horizontal row of 7 glass cards. The "Active" card has a `--accent-gold` border.

## 2. Overdue Logic
*   **Function:** `getTaskStatus(task)`
*   **Return:** `OVERDUE` | `TODAY` | `FUTURE`.
*   **Style:** Overdue tasks use `color: var(--accent-amber)` for a "Gentle Warning."

---

# Stage 7: Zen & Flow — Technical Deep-Dive

## 1. Feature: Focus Mode
*   **State:** `isFocusMode: boolean`.
*   **UI Overlay:** A `fixed` div that covers the screen with `backdrop-filter: blur(50px)`.
*   **Centerpiece:** The active `TaskCard` is cloned into this overlay with `layoutId="task-focus"` for a hero-transition effect.

## 2. Feature: Karma Heatmap
*   **Data Structure:** An object `{ "2026-05-01": 5, "2026-05-02": 12 }`.
*   **Component:** `Heatmap.jsx` using a simple loop to render 365 small `div` elements.

---

# Stage 8: Sensory Experience — Technical Deep-Dive

## 1. Motion Details (Framer Motion)
*   **Entrance:** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`.
*   **Haptic Pulse:** `whileTap={{ scale: 0.95 }}` on all buttons.

## 2. Sound Logic
*   **Hook:** `useSound(type)`
*   **Implementation:**
    ```javascript
    const playSound = (file) => {
      const audio = new Audio(`/assets/sounds/${file}.mp3`);
      audio.volume = 0.3;
      audio.play();
    };
    ```

---

# Stage 9: Final Polish — Technical Deep-Dive

## 1. Shortcut Registry
*   **File:** `src/hooks/useShortcuts.js`
*   **Mapping:**
    *   `/`: `focusSearch()`
    *   `q`: `openCommandBar()`
    *   `f`: `toggleFocusMode()`

## 2. Responsive Breakpoints
*   **Mobile (<768px):** Sidebar is a bottom drawer. Bento Grid becomes 1 column.
*   **Desktop (>1200px):** Full 12-column Bento Layout with fixed Sidebar.
