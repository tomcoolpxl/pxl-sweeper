# IMPLEMENTATION_PHASE6.md - Marking Logic and HUD Elements

## Architectural Design

This phase implements the interaction layer for flagging mines and the dynamic HUD elements (Timer and Mine Counter). It connects user "marking" actions to the visual status displays.

### State Definitions
- **Marking Cycle**: `Unmarked` -> `Flagged` (blocks reveal) -> `QuestionMarked` (allows reveal) -> `Unmarked`.
- **Timer State**: `timerInterval` (ID for `setInterval`), `secondsElapsed` (integer).
- **Mine Counter**: Dynamic calculation: `Board.mineCount - countOf(isFlagged === true)`.

### Function Signatures
- `Game.prototype.init()`: Add `contextmenu` listener to `#board-container`.
- `Game.prototype.handleCellRightClick(index)`: Entry point for right-click events.
- `Game.prototype.toggleMark(index)`: Advances the mark state for a specific cell.
- `Game.prototype.startTimer()`: Initializes `setInterval` to increment `secondsElapsed` every 1000ms.
- `Game.prototype.stopTimer()`: Clears the `timerInterval`.
- `Game.prototype.updateMineCounterUI()`: Updates the text content of `#mine-count-display`.
- `Game.prototype.updateTimerUI()`: Formats and updates the text content of `#timer-display`.

---

## File-Level Strategy

### `app.js`
- **Responsibility**: Implement the marking state machine and timer lifecycle.
- **Key Sections**:
    - Update `init()` to handle `contextmenu` and prevent defaults.
    - Implement `handleCellRightClick(index)`.
    - Update `handleCellClick(index)` to trigger `startTimer()` on the first successful reveal.
    - Update `handleWin()` and `handleLoss()` to call `stopTimer()`.
    - Update `newGame()` to reset timer state and mine counter.
    - Update `updateCellUI(index)` to render flags (🚩) and question marks (?).

### `style.css`
- **Responsibility**: Define styles for flagged and question-marked cells.
- **Key Sections**:
    - Add `.cell.flagged` and `.cell.question` styles.
    - Ensure flagged cells have a distinct look (e.g., specific color or icon).

---

## Atomic Execution Steps

### Task 1: Disable context menu on the board
- **Plan**: Add a `contextmenu` event listener to the `#board-container` that calls `e.preventDefault()`.
- **Act**: Update `Game.init()` to include the listener.
- **Validate**: Right-click anywhere on the game board in the browser; the standard browser menu should not appear.

### Task 2: Implement right-click flagging/question-mark cycle
- **Plan**: Create a `handleCellRightClick` method. If the cell is hidden, cycle through `isFlagged = true` -> `isQuestionMarked = true` -> `both = false`.
- **Act**: Implement logic in `app.js` and update `updateCellUI` to show 🚩 or ?.
- **Validate**: Right-click a hidden cell multiple times. It should cycle: empty -> 🚩 -> ? -> empty. Ensure left-click on 🚩 does nothing.

### Task 3: Implement active Timer logic
- **Plan**: Use `setInterval` starting on the first reveal. Store the interval ID on the `Game` instance.
- **Act**: Implement `startTimer`, `stopTimer`, and ensure they are called in `handleCellClick`, `handleWin`, and `handleLoss`.
- **Validate**: Start a game and click a cell. The timer should start ticking. Winning or losing should stop it. Restarting should reset it to 000.

### Task 4: Implement real-time Mine Counter logic
- **Plan**: Create `updateMineCounterUI`. Call it whenever a flag is added or removed.
- **Act**: Calculate `totalMines - flaggedCount` and update the DOM.
- **Validate**: Place a flag; the counter should decrease. Remove a flag; it should increase. Ensure it can go negative (e.g., -01 if 11 flags are placed on Beginner).

---

## Edge Case & Boundary Audit

- **Flagging after Game Over**: Right-click should be ignored if state is `WON` or `LOST`.
- **Flagging a Revealed Cell**: Right-click should be ignored on revealed cells.
- **Timer starting on Mark**: Ensure the timer ONLY starts on a successful reveal (left-click), not on a flag (right-click).
- **Multiple Interals**: Ensure `stopTimer()` is called before starting a new one (e.g., on restart) to avoid multiple intervals running.
- **Timer Maximum**: While not strictly required, decide if timer stops at 999.

---

## Verification Protocol

### Logic Check
- [ ] Right-click cycles correctly: Unmarked -> Flag -> Question -> Unmarked.
- [ ] Left-clicking a Flagged cell does NOT reveal it.
- [ ] Left-clicking a Question-marked cell DOES reveal it.
- [ ] Timer starts on first reveal, NOT on first flag.
- [ ] Timer stops on win/loss.
- [ ] Mine counter = `Total Mines - Flags`.

### UX Check
- [ ] Context menu is successfully suppressed on the board.
- [ ] Timer updates every second without lag.
- [ ] Mine counter updates instantly when a flag is placed.

---

## Code Scaffolding

### Timer Implementation
```javascript
startTimer() {
    if (this.timerInterval) return; // Already running
    this.secondsElapsed = 0;
    this.timerInterval = setInterval(() => {
        this.secondsElapsed++;
        this.updateTimerUI();
    }, 1000);
}

stopTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
}
```

### Marking Logic
```javascript
toggleMark(index) {
    const cell = this.board.grid[index];
    if (cell.isRevealed) return;

    if (!cell.isFlagged && !cell.isQuestionMarked) {
        cell.isFlagged = true;
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.isQuestionMarked = true;
    } else {
        cell.isQuestionMarked = false;
    }

    this.updateCellUI(index);
    this.updateMineCounterUI();
}
```
