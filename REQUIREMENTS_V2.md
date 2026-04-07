# REQUIREMENTS_V2.md - PXL Sweeper V2

## Project Overview
PXL Sweeper V2 is a cross-platform Minesweeper game built with **Phaser 3**. It replaces the original DOM-based implementation with a WebGL/Canvas renderer, adding particle effects, Web Audio sound, mobile touch support, keyboard navigation, and a persistent highscore system.

## V2 Goals

- **Engine Upgrade**: Phaser 3 (WebGL/Canvas) for rendering, animation, and input.
- **Zero-Scroll Layout**: Intelligent viewport scaling — entire board always visible, no scrolling required.
- **Multi-Platform Support**: Desktop (mouse + keyboard) and mobile (touch).
- **Aesthetic Polish**: Particle effects and tween animations on tile reveal, win, and loss.
- **Audio Immersion**: Web Audio API sound effects for all core actions.
- **Keyboard Accessibility**: Full keyboard navigation (arrow keys, Enter, Space).

---

## Technical Requirements

### 1. Game Engine & Rendering
- The game shall use **Phaser 3.x**.
- Rendering shall prioritise WebGL with Canvas fallback (`Phaser.AUTO`).
- Particle textures are generated at runtime via Phaser graphics; no external asset files are required.

### 2. Viewport & Scaling (Zero-Scroll Mandate)
- The game shall use a **Fit-to-Viewport** strategy (`Phaser.Scale.FIT`).
- The canvas shall automatically scale to fit the window at all difficulty levels.
- The layout shall be centred horizontally and vertically.
- No scrolling shall be required to access the board or HUD.

### 3. Input

#### Mouse
- **Left-click**: Reveal a hidden cell.
- **Right-click**: Cycle mark (Flag → Question → Unmarked).

#### Touch (Mobile)
- **Tap**: Reveal a hidden cell.
- **Long-press (300 ms)**: Toggle a flag on a hidden cell.
- **Haptic feedback**: `navigator.vibrate` on flag placement and mine explosion (where supported).

#### Keyboard
- **Arrow keys**: Navigate between cells. Keyboard mode activates on first arrow key press (opt-in, to avoid interfering with mouse-first play).
- **Enter**: Reveal the focused cell.
- **Space**: Flag/unflag the focused cell.

### 4. First-Click Safety
- The first revealed cell shall **never be a mine**.
- The first revealed cell shall have **zero adjacent mines**, guaranteeing flood-fill expansion on every first click.
- Mine placement is deferred until the first reveal and excludes the clicked cell plus all its neighbours (up to 9 cells).

### 5. Audio Engine
Sound effects are implemented via the Web Audio API (no external audio files):

| Action | Sound |
|---|---|
| Tile reveal | Sine sweep 400→800 Hz |
| Flag placement | Triangle wave 300→100 Hz |
| Game win | 4-note ascending chord (440, 554, 659, 880 Hz) |
| Game loss | Sawtooth sweep 100→10 Hz |

- Rapid reveal sounds are throttled (50 ms) to prevent audio artefacts.
- `AudioContext` is created lazily on first interaction (browser autoplay policy compliance).
- A mute toggle is available in the HUD.
- UI button interaction sounds: **not implemented**.

### 6. Highscores
- Best times per difficulty are persisted to `localStorage`.
- New personal records are detected and highlighted in the game-over overlay.
- Scores can be cleared via the Highscores modal on the main menu.
- V1 highscores used a different storage key and are not migrated.

---

## Visual Requirements

### Particles & Effects
- **Win**: 150-particle confetti burst (rainbow colours) at screen centre.
- **Loss**: 50-particle fire burst at the triggered mine location.
- **Tile reveal**: Scale tween 0.8→1.0, `Back.easeOut`, 150 ms.
- **Game-over overlay**: Fade-in, 500 ms.

### HUD & Screens
- **Main Menu**: Difficulty selection (Beginner / Intermediate / Expert), Highscores modal, How-to-Play modal.
- **Game HUD**: Mine counter (top-left), timer (top-right, `000` padded), menu button and mute toggle (top-centre/right).
- **Game-over overlay**: Status (YOU WIN / GAME OVER / NEW RECORD), time and best time (padded `000s` format), Play Again / Main Menu / View Board buttons.
- **Keyboard focus indicator**: Yellow border on the focused tile when keyboard navigation is active.

### Typography
- Font: system `monospace` (custom/bitmap font: not implemented).

### Themes
- Single dark theme. Theme switching infrastructure: **not implemented**.

---

## Accessibility
- `aria-live="polite"` region (`#a11y-hud`) announces mine count, game start, win/loss, and keyboard-focused cell position.
- `overflow: hidden` on `<body>` enforces the zero-scroll mandate.
- Keyboard navigation covers full board traversal and all actions.

---

## Performance & Reliability
- Target: **60 FPS** on standard desktop and modern mobile hardware.
- Initial load: **under 5 MB** (Phaser is the only runtime dependency; no external assets).
- `updateBoardUI` uses a `Set` for O(1) lookup of newly revealed cells.

---

## Acceptance Criteria

1. Entire board visible without scrolling at all difficulty levels.
2. First click always opens a blank (zero-neighbor) area via flood-fill.
3. Audio feedback plays for reveal, flag, win, and loss actions.
4. Touch controls (tap / long-press) work on mobile.
5. Full keyboard play is possible after pressing any arrow key.
6. Highscores persist across sessions and new records are indicated.
7. All unit and e2e tests pass (`npm test` + `npm run test:e2e`).
