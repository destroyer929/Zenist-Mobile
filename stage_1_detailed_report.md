# Stage 1: The Visual Foundation — Technical Specification

## 1. Overview
Stage 1 is the most critical phase for establishing the **Luxurious** feel of Zenist. We are building the "Atmosphere" of the app using advanced CSS and React state management.

## 2. Component Breakdown

### A. ThemeProvider (`src/context/ThemeContext.jsx`)
*   **Work Flow:** 
    1.  On mount, calculates current hour (`new Date().getHours()`).
    2.  Sets a state `timeState` (morning: 5-11, afternoon: 11-17, evening: 17-21, night: 21-5).
    3.  Exposes `timeState` to the app.
    4.  Runs a `setInterval` every 60 seconds to check if the state needs to change.
*   **Integration:** Injects a class or data-attribute to the `root` element to trigger CSS variable shifts.

### B. Design Token Manifest (`src/styles/tokens.css`)
*   **Features:**
    *   **HSL Color Matrix:** Define base hues.
    *   **Glassmorphism Utility:** `.glass-panel` class with optimized blur and transparency.
    *   **Fluid Typography:** `clamp()` based font sizes that adjust perfectly to screen size.

## 3. Feature Details & Implementation

### 1. The Living Background
*   **Feature:** Multi-layer CSS gradients.
*   **Implementation:** 
    *   Layer 1: Base color (Deep Midnight).
    *   Layer 2: Radial gradient "Orb" that moves slightly based on mouse position (for that premium interactive feel).
    *   Layer 3: Subtle grain/noise texture overlay to prevent color banding and add a "paper" or "tactile" feel.

### 2. Premium Font Pairing
*   **Heading:** `Outfit` (Weights: 300, 500, 600).
*   **Body:** `Inter` (Weights: 400, 500).
*   **Implementation:** Imported via `@fontface` in the main CSS file to ensure maximum performance.

## 4. Integration Workflow
1.  Initialize **Vite/React**.
2.  Establish **File Directory** (src/context, src/styles, src/components).
3.  Write the **Global Variable Map** (Colors, Shadows, Blurs).
4.  Wrap `main.jsx` with the `ThemeProvider`.
5.  Validate that the `body` background changes correctly when the time state is manually toggled.

## 5. Mental Visualization
The screen is a deep, immersive dark canvas. There is no "flat" white or black. Everything has a slight blue-tinted depth. The typography is crisp and "expensive" looking. It feels like a high-end physical product (like an Apple device or a luxury watch dashboard) rather than a website.
