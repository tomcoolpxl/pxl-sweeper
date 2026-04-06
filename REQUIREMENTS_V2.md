# REQUIREMENTS_V2.md - PXL Sweeper Evolution

## Project Overview
PXL Sweeper V2 is a high-fidelity, cross-platform Minesweeper game built with **Phaser 3**. It transitions the project from a DOM-based minimalist clone to a robust gaming application with advanced graphics, audio, and mobile-first interactions.

## V2 Goals
*   **Engine Upgrade**: Migrate from vanilla JS/DOM to **Phaser 3** (WebGL/Canvas) for superior performance and animation capabilities.
*   **Zero-Scroll Layout**: Implement intelligent viewport scaling to ensure the entire game board is always visible without scrolling, regardless of difficulty or screen size.
*   **Multi-Platform Support**: Optimized for both desktop (mouse) and mobile (touch).
*   **Aesthetic Polish**: Introduce high-quality graphics, particle effects, and dynamic transitions.
*   **Audio Immersion**: Add a full sound engine for tactile feedback.

---

## Technical Requirements

### 1. Game Engine & Rendering
*   The game shall use **Phaser 3.x**.
*   Rendering shall prioritize WebGL with Canvas fallback.
*   All assets (sprites, icons) shall be packed into **Texture Atlases** to minimize draw calls.

### 2. Viewport & Scaling (The "Zero-Scroll" Mandate)
*   The game shall use a **Fit-to-Viewport** strategy.
*   On **Desktop**, the canvas shall automatically scale down if the board dimensions exceed the window height/width.
*   The layout shall be centered horizontally and vertically within the browser window.
*   No vertical or horizontal scrolling shall be required to access any part of the game board or HUD during play.

### 3. Mobile Interactions
*   **Tap**: Reveal a hidden cell.
*   **Long-Press (300ms)**: Toggle a flag on a hidden cell.
*   **Haptic Feedback**: Trigger `navigator.vibrate` on flagging or mine explosion (if supported).
*   **Pinch-to-Zoom**: Support zooming in on large boards (Expert) for precision play on small screens.
*   **PWA**: The app shall include a `manifest.json` and Service Worker to be "Installable" as a Progressive Web App.

### 4. Audio Engine
The application shall provide high-quality SFX for:
*   **Tile Reveal**: A satisfying click or pop.
*   **Flagging**: A soft thud or flag-furl sound.
*   **Game Win**: A triumphant fanfare.
*   **Game Loss**: An explosive boom or rumble.
*   **UI Interaction**: Subtle sounds for button clicks and difficulty selection.

---

## Visual Requirements

### 1. Graphics & Effects
*   **Particles**: Confetti/sparkles on win; smoke and fire on loss.
*   **Tweens**: Smooth tile flipping/revealing animations.
*   **Typography**: Integrated custom fonts (e.g., Google Fonts or Bitmap Fonts) consistent with the "PXL" pixel-art aesthetic.
*   **Themes**: Infrastructure to support multiple skins (Classic, Neon, Dark Mode).

### 2. HUD & Screens
*   **Main Menu Scene**: difficulty selection with animated background.
*   **Game Scene**: HUD fixed to the top or bottom, board in the center.
*   **Game Over Scene**: Overlay with statistics, "New Record" indicators, and a restart prompt.
*   **Interactive Tutorial**: A visual walkthrough of rules (V2 upgrade from the text dialog).

---

## Performance & Reliability
*   The game shall maintain **60 FPS** on standard desktop and modern mobile devices.
*   Initial load size shall remain under **5MB** (compressed assets).
*   Highscores from V1 shall be migrated or handled gracefully within the new V2 storage logic.

---

## Acceptance Criteria (V2)
1.  **Requirement**: Entire board visible without scrolling.
2.  **Requirement**: Satisfying audio feedback for every core action.
3.  **Requirement**: Seamless touch controls (tap/long-press) on mobile.
4.  **Requirement**: Automated CI/CD pipeline correctly builds and deploys the Phaser project.
