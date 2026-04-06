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

## Phase 9: Testing Strategy and Implementation
- [x] Design and implement robust testing strategy (`TESTING_STRATEGY.md`)
- [x] Implement unit tests for core game logic (`src/js/__tests__/unit/`)
- [x] Implement integration tests for UI and game interactions (`src/js/__tests__/integration/`)
- [x] Configure Vitest and jsdom for automated testing
- [x] Verify 100% pass rate for the test suite
