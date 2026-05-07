# Stages 3, 4, & 5: The Core Engine — Technical Specification

## 1. Overview
These stages build the "Functional Soul" of Zenist. We transition from a visual shell to a live, data-driven application with intelligent input and deep organization.

## 2. Stage 3: The Data Engine (Memory)
*   **Store (`src/hooks/useTaskStore.js`):** A custom hook that handles:
    *   `tasks`: The master array.
    *   `addTask()` / `deleteTask()` / `toggleComplete()`.
*   **Persistence:** Uses `localStorage` with a `JSON.stringify` buffer to ensure data integrity during crashes.
*   **Component:** `TaskCard.jsx`
    *   Uses **Framer Motion** for a "Scale-in" entrance.
    *   Uses a "Slide-out" exit when deleted.

## 3. Stage 4: The Intelligence Hub (NLP)
*   **CommandBar Component:**
    *   `position: absolute`, bottom of the screen.
    *   `z-index: 1000`.
*   **Parser Logic (`src/utils/nlp.js`):**
    *   Regex-based detection for:
        *   Dates: `today`, `tomorrow`, `monday`, etc.
        *   Priority: `!1`, `!2`, `!3`, `!4`.
        *   Project: `#packageName`.
        *   Label: `@labelName`.
*   **Integration:** The parser returns a "Draft Task" object that is visualized in a small "Preview" bubble above the input.

## 4. Stage 5: The Organization Core
*   **Project Schema:**
    *   Each project has a `name`, `id`, and a `colorHex`.
*   **Label Schema:**
    *   Each label is a simple string key mapped to a color.
*   **Logic:** 
    *   The `DashboardGrid` receives a `filter` prop from the Sidebar.
    *   `activeTasks = tasks.filter(t => t.projectId === activeProject)`.

## 5. Integration Flow
1.  Initialize the **Context Provider**.
2.  Implement the **Storage Hook**.
3.  Build the **Command Bar UI**.
4.  Write the **NLP Regex Library**.
5.  Link the **Sidebar** to the Task Filter.

## 6. Mental Visualization
You are no longer looking at a "Layout." You are looking at a living system. Every time you type in the command bar, the dashboard reacts. Every time you finish a task, the counters in the sidebar update. It feels cohesive, fast, and remarkably smart.
