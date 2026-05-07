# Stage 2: The Structural Shell — Technical Specification

## 1. Overview
Stage 2 builds the physical layout of the application. We are moving from a background to a structured **Bento-style Dashboard** using modern CSS Layout techniques.

## 2. Component Breakdown

### A. Sidebar (`src/components/layout/Sidebar.jsx`)
*   **Role:** Main navigation hub.
*   **Implementation:**
    *   Width: 280px.
    *   Style: `position: fixed`, `glass-morphism` class.
    *   Elements: Logo, Main Navigation (Inbox, Today, Upcoming), Projects List, Labels List.
*   **Animation:** Items use a scale-up effect on hover (`1.02x`) with a spring transition.

### B. TopBar (`src/components/layout/TopBar.jsx`)
*   **Role:** Contextual header.
*   **Implementation:**
    *   Dynamic Greeting: Uses `ThemeContext` to greet the user.
    *   Global Search: A minimalist input with a `Ctrl+K` shortcut placeholder.
    *   Profile: Small avatar with a status indicator (Active/Away).

### C. BentoGrid (`src/components/layout/DashboardGrid.jsx`)
*   **Role:** The "Heart" of the UI.
*   **Implementation:**
    *   `display: grid`.
    *   `grid-template-columns: repeat(12, 1fr)`.
    *   Gap: `24px` (for that luxurious spacing).
*   **Tiles:**
    *   Task Tile: Spans 8 columns (Primary).
    *   Progress Tile: Spans 4 columns (Secondary).
    *   Heatmap Tile: Spans 12 columns (Full-width bottom).

## 3. CSS Layout Strategy
We will use a **Mobile-First** approach. 
*   **Mobile:** 1-column stack.
*   **Tablet:** 2-column layout.
*   **Desktop:** Full 12-column Bento Grid.

## 4. Integration Workflow
1.  Create the `LayoutShell` component.
2.  Build the `Sidebar` and `TopBar` components.
3.  Implement the `DashboardGrid` with placeholder "Glass Cards."
4.  Verify that the layout remains perfectly balanced at all screen resolutions.

## 5. Mental Visualization
The screen is organized into high-definition "Glass Tiles." Each tile has a subtle inner glow. The navigation is tucked neatly to the left. The whole app feels like a single, unified "Command Center" where everything has its designated spot.
