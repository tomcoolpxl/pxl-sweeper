# Implementation Plan - PXL Sweeper

## Overview

This project delivers a classic Minesweeper clone as a self-contained, single-page static web application. It uses a "logic-first" approach where the game engine is built and verified before final visual polish is applied. The implementation follows a hybrid delivery strategy, starting with core data structures and proceeding through vertical slices of functionality (e.g., reveal logic, then marking logic).

## Assumptions

-   Modern Chromium-based browsers provide consistent behavior for `contextmenu` events (to disable the default right-click menu).
-   A single `script.js` (or `app.js`) is sufficient for the logic given the small scope, but logic will be modularized internally.
-   Standard CSS Grid is the preferred method for rendering the game board.
-   Recursive flood-fill is acceptable for the "Expert" grid size (30x16) as it remains well within browser stack limits.

## Delivery strategy

This plan uses a **hybrid** strategy. 
-   **Phase 1-2** focus on structural and logical foundations (Layered).
-   **Phase 3-6** implement functional vertical slices (Interaction -> Logic -> UI).
-   **Phase 7-8** focus on stabilization and polish.

This fits the project because it ensures the complex "Zero Expansion" and "First Click Safety" logic is verified early, while keeping UI changes separate to allow for rapid iteration on the game's look and feel.

## Phase list

-   Phase 1: Project Shell and Layout
-   Phase 2: Game Engine Foundations
-   Phase 3: Board Rendering and Basic Reveal
-   Phase 4: Win/Loss State Transitions
-   Phase 5: Zero Expansion and First-Click Safety
-   Phase 6: Marking Logic and HUD Elements
-   Phase 7: Enhanced Loss Visualization and Polish
-   Phase 8: Final Stabilization and Review

## Detailed phases

### Phase 1: Project Shell and Layout

**Goal**: Establish the basic HTML/CSS structure and difficulty controls.

**Scope**: 
- Create `index.html` with containers for the HUD and the Board.
- Define CSS for the basic grid layout and difficulty buttons.
- Setup basic project structure.

**Expected files to change**:
- `index.html`
- `style.css`
- `README.md`

**Dependencies**:
- None.

**Risks**: Low. Simple static asset setup.

**Tests and checks to run**:
- Manual check: Verify difficulty buttons are visible.
- Manual check: Verify `#board-container`, `#timer-display`, `#mine-count-display`, and `#restart-btn` exist in the DOM.
- Manual check: Verify board container is centered and responsive to basic layout rules.

**Review check before moving work to `DONE.md`**:
- Does the layout match the "Required UI Elements" in `REQUIREMENTS.md`?
- Are the CSS styles isolated and clean?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Create `index.html` with HUD (timer, counter, restart) and Board containers
- [ ] Implement basic CSS for difficulty selection and grid layout
- [ ] Verify page loads in Chromium with correct initial layout

**Exit criteria for moving items to `DONE.md`**:
- `index.html` contains `#board-container`, `#timer-display`, `#mine-count-display`, and `#restart-btn`.
- `style.css` defines a responsive grid layout that adapts to the 30x16 Expert size without overflow.

---

### Phase 2: Game Engine Foundations

**Goal**: Implement the core data structures and mine placement logic.

**Scope**:
- Define `Cell` and `Board` logic (classes or objects).
- Implement difficulty presets (Beginner, Intermediate, Expert).
- Implement mine placement and adjacency count calculation.

**Expected files to change**:
- `app.js`

**Dependencies**:
- Phase 1 (for context, though logic is decoupled).

**Risks**: Medium. Incorrect adjacency counts are a common bug.

**Tests and checks to run**:
- Implement a `Board.debug()` method (or equivalent) that prints the grid to the console.
- Verify mine count matches preset for all three difficulties.
- Verify adjacency counts against 3 manual patterns: Corner mine, Edge mine, and Center mine.

**Review check before moving work to `DONE.md`**:
- Are the difficulty presets exactly as specified (9x9/10, 16x16/40, 30x16/99)?
- Is mine placement randomized?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Define Difficulty presets in `app.js`
- [ ] Implement `Board` class/logic for grid generation
- [ ] Implement Mine placement logic
- [ ] Implement Adjacency count calculation logic

**Exit criteria for moving items to `DONE.md`**:
- Logic for board generation exists and correctly populates mines/numbers in memory.
- `Board.debug()` confirms correct adjacency matrix for test patterns.

---

### Phase 3: Board Rendering and Basic Reveal

**Goal**: Connect the engine to the DOM and enable basic left-click reveals.

**Scope**:
- Generate DOM elements (cells) based on the `Board` state.
- Implement left-click event listener to reveal a cell.
- Update cell styling when revealed (showing number or mine).

**Expected files to change**:
- `index.html`
- `app.js`
- `style.css`

**Dependencies**:
- Phase 2.

**Risks**: 
- Low: DOM performance with 480 cells (Expert) is trivial.
- Refactor Risk: First-click safety is unimplemented; accidental losses during testing are expected until Phase 5.

**Tests and checks to run**:
- Manual check: Clicking a cell reveals its content.
- Manual check: Clicking an already revealed cell does nothing.

**Review check before moving work to `DONE.md`**:
- Does left-clicking a hidden cell reveal it correctly?
- Is the board cleared and re-rendered when a difficulty is selected?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Implement DOM generation for the grid
- [ ] Implement left-click reveal handler
- [ ] Map revealed cell state to visual display (numbers 1-8)

**Exit criteria for moving items to `DONE.md`**:
- Users can click cells to reveal numbers or mines.
- Difficulty buttons trigger a board reset and re-render.

---

### Phase 4: Win/Loss State Transitions

**Goal**: Implement the core game loop and state management.

**Scope**:
- Track game state: `NOT_STARTED`, `IN_PROGRESS`, `WON`, `LOST`.
- Implement loss detection (hitting a mine).
- Implement win detection (all non-mine cells revealed).
- Disable board interaction after win/loss.

**Expected files to change**:
- `app.js`

**Dependencies**:
- Phase 3.

**Risks**: Low.

**Tests and checks to run**:
- Manual check: Clicking a mine transitions to `LOST`.
- Manual check: Board is non-interactive after loss.
- Manual check: Revealing all non-mine cells transitions to `WON`.
- Reset check: Verify that 'Restart' generates a fresh mine layout rather than just clearing the current one.
- Reset check: Check for 'ghost clicks'—ensure event listeners from the previous game do not persist after a reset.

**Review check before moving work to `DONE.md`**:
- Does the "Restart" button return the game to `NOT_STARTED`?
- Does win detection ignore flags (per requirements)?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Implement Game State manager
- [ ] Implement Win detection logic
- [ ] Implement Loss detection logic
- [ ] Add visual "Win" and "Loss" indicators to the UI

**Exit criteria for moving items to `DONE.md`**:
- Game correctly identifies and stops on win or loss.

---

### Phase 5: Zero Expansion and First-Click Safety

**Goal**: Implement the advanced reveal logic and safety features.

**Scope**:
- Implement recursive expansion when a '0' cell is clicked.
- Implement first-click safety (moving mine if first click hits one).
- Ensure expansion stops at numbered cells.

**Expected files to change**:
- `app.js`

**Dependencies**:
- Phase 4.

**Risks**: 
- Medium: Recursive expansion must be bug-free to avoid infinite loops.
- Refactor Risk: First-click safety requires relocating a mine and re-calculating adjacency counts for all affected neighbors. This may introduce bugs in logic established in Phase 2.

**Tests and checks to run**:
- Manual check: Clicking a 0-cell reveals the correct "island" of cells.
- Automated Logic Test: Simulate 50 'first-clicks' on a known mine location and verify the game state remains `IN_PROGRESS` every time.
- Manual check: Verify expansion logic stops correctly at the boundary of numbered cells.

**Review check before moving work to `DONE.md`**:
- Does first-click safety *only* guarantee the cell is not a mine (no 0-guarantee)?
- Does zero expansion reveal the "bordering numbered cells"?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Implement recursive/iterative zero-expansion logic
- [ ] Implement first-click safety (mine relocation)
- [ ] Verify expansion logic matches classic Minesweeper rules

**Exit criteria for moving items to `DONE.md`**:
- Large empty areas are revealed in a single click.
- First click never results in a loss (verified via 50-click simulation).

---

### Phase 6: Marking Logic and HUD Elements

**Goal**: Implement flagging and active UI components (Timer/Counter).

**Scope**:
- Disable default context menu on the board.
- Implement right-click cycle: `unmarked` -> `flagged` -> `question` -> `unmarked`.
- Implement the Timer (starts on first reveal, stops on win/loss).
- Implement the Mine Counter (Mine Count - Flag Count).

**Expected files to change**:
- `app.js`
- `style.css`

**Dependencies**:
- Phase 5.

**Risks**: Low.

**Tests and checks to run**:
- Manual check: Right-click cycles through all three states.
- Manual check: Timer increments correctly and stops on win.
- Manual check: Mine counter goes negative if >mines flags are placed.

**Review check before moving work to `DONE.md`**:
- Does right-clicking a revealed cell do nothing?
- Does the timer reset to 0 on restart?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Disable context menu on the board
- [ ] Implement right-click flagging/question-mark cycle
- [ ] Implement active Timer logic
- [ ] Implement real-time Mine Counter logic

**Exit criteria for moving items to `DONE.md`**:
- Flags and question marks work correctly.
- Timer and Mine Counter display accurate information.

---

### Phase 7: Enhanced Loss Visualization and Polish

**Goal**: Finalize visual feedback and loss-state details.

**Scope**:
- Implement special styling for the "triggering mine".
- Implement reveal of all mines on loss.
- Implement "incorrect flag" visual for mines that were flagged but weren't mines.
- Finalize CSS for a "simple and modern" look.

**Expected files to change**:
- `style.css`
- `app.js`

**Dependencies**:
- Phase 6.

**Risks**: Low.

**Tests and checks to run**:
- Manual check: On loss, verify all mines are shown.
- Manual check: Verify "wrong flags" are visually distinct.
- Manual check: Verify the mine that was clicked is distinct.

**Review check before moving work to `DONE.md`**:
- Is the UI modern and clean per visual requirements?
- Are question-marked cells treated normally on loss?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Implement "reveal all mines" on loss
- [ ] Add distinct styling for the triggering mine
- [ ] Add distinct styling for incorrect flags on loss
- [ ] Finalize CSS theme (colors, spacing, typography)

**Exit criteria for moving items to `DONE.md`**:
- Loss state provides all required visual feedback.
- CSS is complete and follows the visual direction.

---

### Phase 8: Final Stabilization and Review

**Goal**: Ensure full requirement compliance and cross-check.

**Scope**:
- Bug fixing and edge-case handling.
- Verify all difficulty presets in a desktop viewport.
- Document code and clean up.

**Expected files to change**:
- `app.js`
- `style.css`
- `index.html`

**Dependencies**:
- All previous phases.

**Risks**: Low.

**Tests and checks to run**:
- Smoke test: Play all three difficulties to completion (Win and Loss).
- Lint/Format check.
- Verification against `REQUIREMENTS.md` checklist.

**Review check before moving work to `DONE.md`**:
- Does the application require any frameworks or backend? (Must be "No").
- Does it work in Chromium?

**Exact `TODO.md` entries to refresh from this phase**:
- [ ] Perform final smoke tests on all difficulty levels
- [ ] Verify requirement traceability (Acceptance Criteria)
- [ ] Final code cleanup and documentation update

**Exit criteria for moving items to `DONE.md`**:
- All requirements in `REQUIREMENTS.md` are met.
- Project is ready for static hosting.

---

## Dependency notes

-   **Logic Core**: Phase 2 and 5 are the most critical for gameplay integrity.
-   **Interaction**: Phase 3 and 4 must be completed before the game is "playable" even in a basic form.
-   **Blocked by Decisions**: None. All requirements are defined in `REQUIREMENTS.md`.

## Review policy

-   Each phase should be reviewed independently.
-   Max review size: ~200 lines of code change per phase (estimated for this scope).
-   If a phase introduces more than 3 distinct bugs in testing, it must be reworked before review proceeds.
-   Split phases if the implementation of expansion logic (Phase 5) becomes overly complex.

## Definition of done for the plan

-   The application is a single-page static site.
-   All three difficulty levels (Beginner, Intermediate, Expert) are fully functional.
-   First-click safety and zero-expansion logic are verified.
-   UI includes Board, Mine Counter, Timer, Restart, and Difficulty selectors.
-   Game handles Win/Loss states and transitions correctly.
-   Code is verified in a Chromium desktop browser.

## Open questions

-   None. (Requirements are exhaustive for this scope).
