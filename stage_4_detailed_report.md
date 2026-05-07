# Stage 3: The Data Engine — Technical Deep-Dive

## 1. Data Structure (The Task Object)
```javascript
{
  id: "nanoid()",
  content: "String",
  priority: 1 | 2 | 3 | 4,
  projectId: "String (ID)",
  labels: ["String"],
  dueDate: "ISO Date",
  completed: Boolean,
  subtasks: [TaskObject]
}
```

## 2. Component: TaskCard.jsx
*   **Visual Architecture:**
    *   **Container:** `min-height: 80px`, `padding: 16px`, `glassmorphism-card`.
    *   **Left Side:** The Checkbox. A custom `motion.div` that draws a SVG checkmark on completion.
    *   **Center:** Task Title (Outfit, 500 weight) + Meta line (Inter, 400 weight).
    *   **Right Side:** Context Menu (3 dots) for quick move/delete.
*   **Workflow:**
    *   On `onClick(checkbox)`, a `scale: [1, 0.9, 1]` keyframe animation plays to give "Haptic" feedback.

---

# Stage 4: The Intelligence Hub — Technical Deep-Dive

## 1. Component: CommandBar.jsx
*   **UX Pattern:** Spotlight-style floating input.
*   **State:** `inputValue` (string), `parsedData` (object).
*   **Logic:**
    *   `onKeyDown`: Intercepts `/` to open, `Enter` to submit, `Esc` to close.
    *   `onChange`: Runs `nlpParser(value)` and updates the `PreviewBadge` components.

## 2. Utility: nlp.js
*   **Library:** Custom Regex patterns.
    *   Priority: `/!([1-4])/`
    *   Project: `/#(\w+)/`
    *   Label: `/@(\w+)/`
    *   Date: A dictionary of keywords (`today`, `tomorrow`, `mon`...) mapped to `dayjs` offsets.

---

# Stage 5: The Organization Core — Technical Deep-Dive

## 1. Project Management Logic
*   **Store:** `projects` array in `TaskProvider`.
*   **Workflow:**
    1.  User adds project `Work` with color `Blue`.
    2.  `Work` gets ID `proj_1`.
    3.  User adds task `Meeting #Work`.
    4.  Parser sets `task.projectId = 'proj_1'`.
    5.  Sidebar `Work` item shows a "badge count" of `1`.

## 2. Sidebar Navigation Flow
*   **State:** `activeView` (Inbox | Today | Upcoming | ProjectID).
*   **Filter Logic:**
    ```javascript
    const visibleTasks = tasks.filter(t => {
      if (activeView === 'Today') return isToday(t.dueDate);
      if (activeView.startsWith('proj_')) return t.projectId === activeView;
      return true;
    });
    ```

