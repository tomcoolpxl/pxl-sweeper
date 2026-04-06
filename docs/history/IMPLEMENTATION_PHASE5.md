# IMPLEMENTATION_PHASE5.md - Zero Expansion and First-Click Safety

## Architectural Design

This phase implements the two most critical gameplay features for a "classic" Minesweeper feel: the recursive reveal of empty areas (Zero Expansion) and the guarantee that the first click is never a mine (First-Click Safety).

### State Definitions
- **Zero-Adjacent Cell**: A cell where `neighborMines === 0`.
- **Numbered Cell**: A cell where `neighborMines > 0` and `isMine === false`.

### Function Signatures
- `Game.prototype.revealCell(index)`: Refactored to handle recursion or an iterative queue for expansion.
- `Board.prototype.moveMine(fromIndex)`: (Optional/Refactor) If we shift from "lazy placement" to "relocation", this moves a mine from a specific index to the first available empty cell and recalculates adjacency.
- `Board.prototype.placeMines(excludeIndex)`: (Current approach) Ensures mines are only placed *after* the first click is received, excluding that index.

### Algorithm: Iterative Zero Expansion
To avoid potential stack overflow in the browser (though unlikely for a 30x16 grid), we will use a stack-based iterative approach:
1.  Initialize a `stack` with the `startIndex`.
2.  While `stack` is not empty:
    a.  Pop `currentIndex`.
    b.  If `grid[currentIndex]` is already revealed or flagged, skip.
    c.  Mark `grid[currentIndex].isRevealed = true`.
    d.  Update UI for `currentIndex`.
    e.  If `grid[currentIndex].neighborMines === 0`:
        i.  Get all neighbor indices of `currentIndex`.
        ii. For each neighbor: push neighbor index to `stack`.

---

## File-Level Strategy

### `app.js`
- **Responsibility**: Implement the expansion algorithm and ensure the safety guarantee is met.
- **Key Sections**:
    - Update `revealCell(index)` to use the iterative stack algorithm.
    - Review `handleCellClick(index)` to ensure `placeMines(index)` is called exactly once per game.
    - Review `Board.placeMines(excludeIndex)` to ensure it never places a mine on the excluded index.

---

## Atomic Execution Steps

### Task 1: Implement iterative zero-expansion logic
- **Plan**: Replace the single-cell reveal in `revealCell` with a `while` loop and a stack. Only push neighbors if the current cell is a '0'.
- **Act**: Modify `app.js` to implement the iterative reveal.
- **Validate**: Click an area known to be '0' (use `Board.debug()` to find one) and verify it opens a large "island" of cells, stopping at numbered cells.

### Task 2: Implement/Verify first-click safety (mine relocation/lazy placement)
- **Plan**: Ensure the current "lazy placement" strategy in `handleCellClick` is bulletproof. It should only trigger if `state === GAME_STATES.NOT_STARTED`.
- **Act**: Verify `Board.placeMines` is robust and the `excludeIndex` check is working.
- **Validate**: Simulate 100 first-clicks (via a test script or repetitive manual starts) and verify that the `cell.isMine` is *always* false for that first click.

### Task 3: Verify expansion logic matches classic Minesweeper rules
- **Plan**: Ensure that flags block expansion (clicking a neighbor of a flag shouldn't reveal the flagged cell) and that numbered cells *are* revealed at the boundary but do not expand further.
- **Act**: Test boundary cases manually.
- **Validate**: Verify that a '0' next to a '1' reveals the '1' but the '1' does not reveal its own neighbors.

---

## Edge Case & Boundary Audit

- **Flagged Cells in Expansion**: If a cell is flagged but would have been revealed by zero-expansion, it MUST NOT be revealed (classic rules).
- **Multiple Zero-Areas**: Ensure the algorithm handles cases where two zero-areas are connected by a single zero-cell or a numbered cell boundary.
- **Expert Board Size**: Verify the performance of revealing ~100+ cells at once on the 30x16 grid.

---

## Verification Protocol

### Logic Check
- [ ] Clicking a '0' cell reveals all connected '0's and their bordering numbers.
- [ ] Numbered cells stop the recursion.
- [ ] Flagged cells are NOT revealed during zero-expansion.
- [ ] The first click NEVER results in a mine (100% success rate).

### UX Check
- [ ] The expansion happens "instantly" (no noticeable delay).
- [ ] Win condition is checked *after* the full expansion is complete.
- [ ] "Game Over" only happens if a mine is clicked directly (never via expansion).

---

## Code Scaffolding

### `Game.revealCell` (Iterative Stack)
```javascript
revealCell(startIndex) {
    const stack = [startIndex];
    const revealedIndices = new Set(); // To prevent redundant UI updates in the same cycle

    while (stack.length > 0) {
        const index = stack.pop();
        const cell = this.board.grid[index];

        if (cell.isRevealed || cell.isFlagged) continue;

        cell.isRevealed = true;
        this.updateCellUI(index);
        revealedIndices.add(index);

        if (cell.isMine) {
            this.handleLoss(index);
            return; // Exit expansion on loss (though expansion shouldn't hit mines)
        }

        if (cell.neighborMines === 0) {
            const neighbors = this.board.getNeighborsByIndex(index);
            for (const neighborIdx of neighbors) {
                if (!this.board.grid[neighborIdx].isRevealed) {
                    stack.push(neighborIdx);
                }
            }
        }
    }

    this.checkWinCondition();
}
```
