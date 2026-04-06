# IMPLEMENTATION_PHASE4.md - Win/Loss State Transitions

## Architectural Design

This phase introduces formal state management to the game loop. It ensures the game correctly identifies when it has ended and prevents further interaction.

### State Definitions
- **GAME_STATES**: An enum-like object representing the possible states of the game.
    - `NOT_STARTED`: Board is ready, no clicks yet.
    - `IN_PROGRESS`: First click has occurred, timer should be running (timer logic is Phase 6, but state is needed now).
    - `WON`: All non-mine cells are revealed.
    - `LOST`: A mine has been revealed.

### Function Signatures
- `Game.prototype.updateStatusUI()`: Updates a new `#game-status` element to show "WON", "LOST", or "PLAYING".
- `Game.prototype.checkWinCondition()`: Scans `Board.grid` to see if all non-mine cells have `isRevealed === true`.
- `Game.prototype.handleLoss(index)`: Transitions state to `LOST`, marks the triggering mine, and reveals all other mines.
- `Game.prototype.handleWin()`: Transitions state to `WON` and updates UI.

---

## File-Level Strategy

### `index.html`
- **Responsibility**: Add a status indicator element to the HUD or just above/below the board.
- **Key Sections**:
    - Add `<div id="game-status"></div>` inside or near `#hud`.

### `app.js`
- **Responsibility**: Implement the state machine and win/loss detection.
- **Key Sections**:
    - Define `GAME_STATES` constant.
    - Add `this.state` to `Game` class.
    - Update `handleCellClick` to check state before proceeding.
    - Implement `checkWinCondition` and state transition logic.

### `style.css`
- **Responsibility**: Style the win/loss messages and the final board state.
- **Key Sections**:
    - Styles for `#game-status`.
    - `.won` and `.lost` helper classes for the status element.
    - Optional: `.board.disabled` to visually indicate it's non-interactive.

---

## Atomic Execution Steps

### Task 1: Implement Game State manager
- **Plan**: Define `GAME_STATES` and initialize `this.state` in `Game.constructor`. Update `newGame` to reset state to `NOT_STARTED`.
- **Act**: Modify `app.js` to include state tracking.
- **Validate**: Verify `game.state` changes from `NOT_STARTED` to `IN_PROGRESS` on the first click.

### Task 2: Implement Loss detection logic
- **Plan**: In `handleCellClick`, if the revealed cell is a mine, call `handleLoss(index)`. Set state to `LOST`.
- **Act**: Implement `handleLoss` and update `handleCellClick`.
- **Validate**: Click a mine (use `Board.debug()` to find one) and verify state becomes `LOST`.

### Task 3: Implement Win detection logic
- **Plan**: After every successful non-mine reveal, call `checkWinCondition()`. If all non-mine cells are revealed, call `handleWin()`.
- **Act**: Implement `checkWinCondition` and `handleWin`.
- **Validate**: Play a Beginner game (or mock a board with 1 mine) and reveal all non-mine cells. Verify state becomes `WON`.

### Task 4: Add visual "Win" and "Loss" indicators to the UI
- **Plan**: Create a status div in HTML and update it in `updateStatusUI`.
- **Act**: Update `index.html`, `style.css`, and `app.js`.
- **Validate**: Verify "You Win!" or "Game Over!" appears correctly.

---

## Edge Case & Boundary Audit

- **Interaction after Game End**: Ensure `handleCellClick` returns early if state is `WON` or `LOST`.
- **Win by Flagging**: Requirements specify win only on *reveal*. Ensure flags don't trigger win logic.
- **Restarting**: Ensure `newGame` resets the status UI and state.

---

## Verification Protocol

### State Transition Check
- [ ] Game starts in `NOT_STARTED`.
- [ ] First click moves state to `IN_PROGRESS`.
- [ ] Hitting a mine moves state to `LOST`.
- [ ] Revealing all non-mines moves state to `WON`.

### UI Feedback
- [ ] "Game Over" message appears on loss.
- [ ] "You Win!" message appears on win.
- [ ] Board is non-responsive to clicks after game end.
- [ ] "Restart" clears the status message and resets state.

---

## Code Scaffolding

### `app.js` State Constants
```javascript
const GAME_STATES = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    WON: 'WON',
    LOST: 'LOST'
};
```

### `Game.handleCellClick` Update
```javascript
handleCellClick(index) {
    if (this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST) return;
    
    // ... rest of logic
}
```
