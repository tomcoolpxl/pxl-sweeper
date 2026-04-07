# TODO

## Phase 1: Project Shell and Layout
- [x] Create `index.html` with HUD (timer, counter, restart) and Board containers
- [x] Implement basic CSS for difficulty selection and grid layout
- [x] Verify page loads in Chromium with correct initial layout

## Phase 2: Game Engine Foundations
- [x] Define Difficulty presets in `app.js`
- [x] Implement `Board` class/logic for grid generation
- [x] Implement Mine placement logic
- [x] Implement Adjacency count calculation logic

## Phase 3: Board Rendering and Basic Reveal
- [x] Implement DOM generation for the grid
- [x] Implement left-click reveal handler
- [x] Map revealed cell state to visual display (numbers 1-8)

## Phase 4: Win/Loss State Transitions
- [x] Implement Game State manager
- [x] Implement Win detection logic
- [x] Implement Loss detection logic
- [x] Add visual "Win" and "Loss" indicators to the UI

## Phase 5: Zero Expansion and First-Click Safety
- [x] Implement iterative zero-expansion logic
- [x] Implement first-click safety (lazy placement)
- [x] Verify expansion logic matches classic Minesweeper rules

## Phase 6: Marking Logic and HUD Elements
- [x] Disable context menu on the board
- [x] Implement right-click flagging/question-mark cycle
- [x] Implement active Timer logic
- [x] Implement real-time Mine Counter logic

## Phase 7: Enhanced Loss Visualization and Polish
- [x] Implement "reveal all mines" on loss
- [x] Add distinct styling for the triggering mine
- [x] Add distinct styling for incorrect flags on loss
- [x] Finalize CSS theme (colors, spacing, typography)

## Phase 10: Code Review and Refactoring
- [x] Perform automated code review (`CODE_REVIEW.md`)
- [x] Centralize DOM selectors and constants in `CONFIG` object
- [x] Refactor UI rendering to reduce cyclomatic complexity
- [x] Implement ESLint for automated style enforcement
- [x] Achieve 99% statement coverage in core logic

## Phase 11: Layout Optimization (Landscape Mode)
- [x] Swapped Expert difficulty dimensions from portrait (30x16) to landscape (16x30)
- [x] Updated `REQUIREMENTS.md` and tests to reflect the new layout

## Phase 12: Instructions Dialog
- [x] Add instructions trigger and modal UI
- [x] Implement instructions content (rules and mechanics)
- [x] Verify modal functionality with integration tests

## Phase 13: Local Highscores
- [x] Implement `localStorage` persistence for fastest times
- [x] Create highscore screen UI and data binding
- [x] Implement win-condition record checking and "New Record" HUD feedback
- [x] Add "Clear Highscores" functionality
- [x] Verify persistence and UI logic with comprehensive test suite

## Phase 24: GitHub Pages Asset Path Fix
- [x] Configure Vite with a relative base path for project-site deployments
- [x] Add a regression test for the Pages asset-base setting
- [x] Verify the production build emits relative asset URLs

## Phase 25: Persistent Ambient Music
- [x] Register the bundled ambient `.ogg` track for V2 boot
- [x] Loop background music across menu, gameplay, and overlays
- [x] Respect the HUD mute toggle for both music and synthesized SFX
- [x] Add unit coverage for music activation and mute/resume behavior
