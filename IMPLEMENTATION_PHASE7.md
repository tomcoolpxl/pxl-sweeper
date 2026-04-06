# IMPLEMENTATION_PHASE7.md - Enhanced Loss Visualization and Polish

## Architectural Design

This phase enhances the feedback loop when a player loses a game and applies final visual refinements to ensure the "simple and modern" aesthetic required by `REQUIREMENTS.md`.

### State Transitions & Logic
- **Loss Triggering**: The `handleLoss(triggeredIdx)` method will be updated to explicitly store the index of the mine that caused the loss.
- **Cell State Expansion**: We will introduce visual-only states that are calculated during the loss transition:
    - **Triggered Mine**: The cell that was clicked.
    - **Hidden Mine**: A mine that was not flagged and not revealed.
    - **Incorrect Flag**: A cell that was flagged but does not contain a mine.
- **CSS Variable Refinement**: Standardizing spacing and typography using CSS variables for a cohesive look.

### Function Signatures
- `Game.prototype.handleLoss(triggeredIdx)`: Updated to iterate through all cells and apply specific terminal states.
- `Game.prototype.updateCellUI(index)`: Updated to handle new classes: `.mine.triggered` and `.flagged.wrong`.

---

## File-Level Strategy

### `app.js`
- **Responsibility**: Logic for identifying and revealing terminal cell states.
- **Key Sections**:
    - Refactor `handleLoss` to track the `triggeredIdx`.
    - Update `updateCellUI` to render the correct icons/classes for the three loss scenarios.
    - Ensure `handleWin` also performs a clean-up (e.g., auto-flagging remaining mines).

### `style.css`
- **Responsibility**: Finalize the visual theme and implement loss-specific styles.
- **Key Sections**:
    - `.cell.revealed.mine.triggered`: High-contrast red background or unique icon.
    - `.cell.flagged.wrong`: A mine icon with a red "X" or strikethrough.
    - Global styles: Refine button hover states, HUD borders, and font-weight consistency.
    - Add a subtle animation (e.g., scale-in) for revealed mines.

---

## Atomic Execution Steps

### Task 1: Implement "reveal all mines" on loss
- **Plan**: In `handleLoss`, iterate over the entire `board.grid`. For every cell where `isMine` is true and it's not the `triggeredIdx`, set a temporary "show as mine" state or call `updateCellUI`.
- **Act**: Update the loop in `handleLoss` to call `updateCellUI(idx)` for all mine cells.
- **Validate**: Lose a game; verify that every single mine on the board becomes visible.

### Task 2: Add distinct styling for the triggering mine
- **Plan**: Pass the `triggeredIdx` to `updateCellUI` or set a temporary property on the cell object (e.g., `isTriggered = true`).
- **Act**: Add `cellDiv.classList.add('triggered')` in `updateCellUI` if the index matches the trigger. Update `style.css` with `.cell.mine.triggered`.
- **Validate**: The specific mine you clicked should have a bright red background, while others remain standard.

### Task 3: Add distinct styling for incorrect flags on loss
- **Plan**: During the `handleLoss` loop, check for cells where `isFlagged === true` but `isMine === false`.
- **Act**: In `handleLoss`, mark these cells and update UI. In `updateCellUI`, add a `.wrong` class to flagged cells that aren't mines.
- **Validate**: Place a flag on a non-mine cell and then intentionally hit a mine elsewhere. The incorrect flag should show a crossed-out mine (💣 + ❌).

### Task 4: Finalize CSS theme (colors, spacing, typography)
- **Plan**: Review `REQUIREMENTS.md` visual direction. Ensure colors are consistent and the layout is centered.
- **Act**: Refine `:root` variables. Add a "Game Over" overlay or more prominent status message. Improve responsiveness for the Expert grid.
- **Validate**: Open the game in Chromium and verify it looks "modern and clean" across all three difficulties.

---

## Edge Case & Boundary Audit

- **Loss with Question Marks**: Per requirements, question marks get no special treatment on loss. Ensure they are just ignored or cleared.
- **Win State Polish**: Ensure that when a user wins, the board is locked just as strictly as on loss.
- **Rapid Clicks**: Ensure that only the first mine clicked is marked as "triggered".
- **Expert Grid Performance**: Verify that the O(N) loop in `handleLoss` (where N=480) doesn't cause a frame drop.

---

## Verification Protocol

### Logic Check
- [ ] On loss, all mines are revealed.
- [ ] The clicked mine has a `triggered` class.
- [ ] Flagged cells that are NOT mines have a `wrong` class.
- [ ] After loss, reveal and mark actions no longer change board state.

### UX Check
- [ ] Visual distinction between "Trigger Mine", "Hidden Mine", and "Wrong Flag" is clear.
- [ ] The "Game Over" / "You Win" message is easily readable.
- [ ] No browser scrollbars appear on Beginner/Intermediate; Expert fits within a standard 1080p viewport.

---

## Code Scaffolding

### Enhanced Loss Loop
```javascript
handleLoss(triggeredIdx) {
    this.state = GAME_STATES.LOST;
    this.stopTimer();
    this.triggeredMineIndex = triggeredIdx; 
    
    this.board.grid.forEach((cell, idx) => {
        if (cell.isMine || cell.isFlagged) {
            this.updateCellUI(idx);
        }
    });
}
```

### Complex Cell UI Update
```javascript
// Inside updateCellUI(index)
if (this.state === GAME_STATES.LOST) {
    if (cell.isMine) {
        cellDiv.classList.add('revealed', 'mine');
        cellDiv.textContent = '💣';
        if (index === this.triggeredMineIndex) {
            cellDiv.classList.add('triggered');
        }
    } else if (cell.isFlagged && !cell.isMine) {
        cellDiv.classList.add('revealed', 'flagged', 'wrong');
        cellDiv.textContent = '❌'; 
    }
}
```
