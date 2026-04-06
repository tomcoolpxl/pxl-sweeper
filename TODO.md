# TODO

## Phase 1: Project Shell and Layout
- [ ] Create `index.html` with HUD (timer, counter, restart) and Board containers
- [ ] Implement basic CSS for difficulty selection and grid layout
- [ ] Verify page loads in Chromium with correct initial layout

## Phase 2: Game Engine Foundations
- [ ] Define Difficulty presets in `app.js`
- [ ] Implement `Board` class/logic for grid generation
- [ ] Implement Mine placement logic
- [ ] Implement Adjacency count calculation logic

## Phase 3: Board Rendering and Basic Reveal
- [ ] Implement DOM generation for the grid
- [ ] Implement left-click reveal handler
- [ ] Map revealed cell state to visual display (numbers 1-8)

## Phase 4: Win/Loss State Transitions
- [ ] Implement Game State manager
- [ ] Implement Win detection logic
- [ ] Implement Loss detection logic
- [ ] Add visual "Win" and "Loss" indicators to the UI

## Phase 5: Zero Expansion and First-Click Safety
- [ ] Implement recursive/iterative zero-expansion logic
- [ ] Implement first-click safety (mine relocation)
- [ ] Verify expansion logic matches classic Minesweeper rules

## Phase 6: Marking Logic and HUD Elements
- [ ] Disable context menu on the board
- [ ] Implement right-click flagging/question-mark cycle
- [ ] Implement active Timer logic
- [ ] Implement real-time Mine Counter logic

## Phase 7: Enhanced Loss Visualization and Polish
- [ ] Implement "reveal all mines" on loss
- [ ] Add distinct styling for the triggering mine
- [ ] Add distinct styling for incorrect flags on loss
- [ ] Finalize CSS theme (colors, spacing, typography)

## Phase 8: Final Stabilization and Review
- [ ] Perform final smoke tests on all difficulty levels
- [ ] Verify requirement traceability (Acceptance Criteria)
- [ ] Final code cleanup and documentation update
