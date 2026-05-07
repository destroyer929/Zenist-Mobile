# Zenist: The 9-Stage Roadmap to Luxury Productivity

This roadmap breaks down the rebuild of the Todoist-like app into 9 logical phases. Each stage focuses on a specific pillar of the "Premium" experience.

---

## Stage 1: The Visual Foundation (Design System)
**Goal:** Establish the look and feel that makes the app feel "Luxurious."
*   **What to do:**
    *   Initialize the **Vite + React** project.
    *   Create `index.css` with all **Design Tokens** (HSL color scales, Glassmorphism blur variables, Typography scales).
    *   Implement **Theme Context** to support "Time-Aware" color shifts (Morning/Afternoon/Night).
    *   **Result:** A blank page that already feels "expensive" because of the background gradients and font choices.

## Stage 2: The Structural Shell (Bento Layout)
**Goal:** Create the high-end "Bento-Grid" dashboard layout.
*   **What to do:**
    *   Build the **Sidebar**: A semi-transparent glass panel with minimalist icons.
    *   Build the **Main Dashboard**: A grid-based area using CSS Grid.
    *   Build the **Top Bar**: User greeting ("Good evening, Karunakar") and subtle search entry.
    *   **Result:** A non-functional but visually complete layout where the user can see their "Personal Sanctuary."

## Stage 3: The Data Engine (Task Model & Persistence)
**Goal:** Build the "Digital Brain" that remembers everything.
*   **What to do:**
    *   Define the **Task Data Model** (ID, content, priority, date, etc.).
    *   Setup **React Context + useReducer** for global state management.
    *   Implement **LocalStorage Persistence** so data isn't lost on refresh.
    *   Create the `TaskCard` component with the "satisfied" checkbox animation.
    *   **Result:** The ability to add/delete tasks manually and see them persist.

## Stage 4: The Intelligence Hub (Command Bar & NLP)
**Goal:** Recreate Todoist’s best feature—Natural Language input—in a new way.
*   **What to do:**
    *   Build the **Floating Command Bar**: A sleek input field that rises from the bottom.
    *   Implement the **NLP Parser**: Code that detects "tomorrow," "next week," or "!1" for priority while typing.
    *   Add **Live Preview**: As the user types, small badges appear showing what the app "understands" (e.g., a small "Tomorrow" badge pops up).
    *   **Result:** A frictionless way to add tasks just by typing naturally.

## Stage 5: Organization Core (Projects & Labels)
**Goal:** Add layers of organization identified in the APK analysis.
*   **What to do:**
    *   Implement **Project Management**: Create folders and nested projects in the sidebar.
    *   Implement **Labels/Tags**: Color-coded tags for cross-project grouping.
    *   Implement **Section Support**: Allowing users to group tasks inside a project (e.g., "Backlog" vs "Doing").
    *   **Result:** A fully organized system capable of handling hundreds of tasks.

## Stage 6: Dynamic Views (Today, Upcoming & Filters)
**Goal:** Create specialized views for different user mindsets.
*   **What to do:**
    *   Build the **"Today" View**: Automatically filters tasks due now.
    *   Build the **"Upcoming" View**: A horizontal timeline of the next 7 days.
    *   Build **Custom Filters**: Logic to show "Priority 1 tasks in the Work project."
    *   **Result:** The user can switch between "Chaos" (all tasks) and "Clarity" (today only).

## Stage 7: Zen & Flow (Focus Mode & Productivity)
**Goal:** The "Different" part—helping the user focus and feel good.
*   **What to do:**
    *   Build **Focus Mode**: A full-screen, distraction-free view of a single task.
    *   Build the **Karma Heatmap**: A visual grid (like GitHub) showing task completion streaks.
    *   Build the **Daily Summary**: A "Reward" screen at the end of the day.
    *   **Result:** The app transitions from a "List" to a "Coach."

## Stage 8: The Sensory Experience (Motion & Sound)
**Goal:** Add the "Weight" and "Delight" we discussed.
*   **What to do:**
    *   Integrate **Framer Motion**: Smooth entries, layout transitions, and card "floating" effects.
    *   Add **The Soundscape**: High-quality, soft audio feedback for completion and adding.
    *   Add **Haptic Visuals**: Subtle glows and ripples when interacting with premium elements.
    *   **Result:** The app feels "alive" and tactile.

## Stage 9: Final Polish & Pro Shortcuts
**Goal:** Ensure the app is ready for "Power Users" and looks perfect.
*   **What to do:**
    *   Implement **Keyboard Shortcuts**: 'Q' for add, 'F' for focus, etc.
    *   **Responsive Audit**: Ensure the Bento Grid looks beautiful on tablets and phones.
    *   **Empty States**: Design beautiful "Nothing to do" illustrations.
    *   **Result:** A production-ready, luxurious app that rivals the best in the market.
