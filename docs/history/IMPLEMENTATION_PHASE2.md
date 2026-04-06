# IMPLEMENTATION_PHASE2.md - Game Engine Foundations

## Architectural Design

This phase focuses on the internal logic of the Minesweeper engine. We will move from a static UI to a memory-represented game state that can be validated via the console.

### Data Structures

1.  **Difficulty Presets**:
    -   A constant object `DIFFICULTIES` defining `rows`, `cols`, and `mines` for each level.
2.  **Cell State**:
    -   An object or class `Cell` representing a single square.
    -   Properties:
        -   `isMine` (boolean)
        -   `isRevealed` (boolean)
        -   `isFlagged` (boolean)
        -   `isQuestionMarked` (boolean)
        -   `neighborMines` (integer, 0-8)
3.  **Board Representation**:
    -   A class `Board` that manages a 2D array (or flattened 1D array) of `Cell` objects.
    -   State: `rows`, `cols`, `mineCount`, `grid`.

### Function Signatures

-   `Board.prototype.initialize()`: Creates the grid of empty cells.
-   `Board.prototype.placeMines(excludeIndex)`: Randomly distributes mines (excludeIndex will be used in Phase 5 for first-click safety, but stubbed now).
-   `Board.prototype.calculateAdjacency()`: Iterates through the grid and calculates `neighborMines` for every non-mine cell.
-   `Board.prototype.getNeighbors(row, col)`: Helper to return an array of adjacent cell coordinates, handling boundaries.

---

## File-Level Strategy

### `app.js`
-   **Responsibility**: The core engine logic. 
-   **Key Sections**:
    -   Difficulty constants.
    -   `Cell` and `Board` logic.
    -   Initialization sequence.
    -   `Board.debug()` utility for console-based verification.

---

## Atomic Execution Steps

### Task 1: Define Difficulty presets in `app.js`
-   **Plan**: Create the `DIFFICULTIES` constant according to `REQUIREMENTS.md`.
-   **Act**: Define `BEGINNER`, `INTERMEDIATE`, and `EXPERT` configurations.
-   **Validate**: Log `DIFFICULTIES` to the console and verify values match (9x9/10, 16x16/40, 30x16/99).

### Task 2: Implement `Board` class/logic for grid generation
-   **Plan**: Create a `Board` class that takes a difficulty config. Implement a nested loop to fill `this.grid` with `Cell` instances.
-   **Act**: Write the constructor and grid generation logic.
-   **Validate**: Use `console.table()` on a 9x9 grid to ensure 81 objects exist with the correct default properties.

### Task 3: Implement Mine placement logic
-   **Plan**: Randomly select N distinct indices from the grid and set `isMine = true`.
-   **Act**: Use a `while` loop or Fisher-Yates-style selection to ensure exactly the required number of unique mines are placed.
-   **Validate**: Count `isMine` properties in the grid; ensure it matches the difficulty setting (e.g., 10 for Beginner).

### Task 4: Implement Adjacency count calculation logic
-   **Plan**: For every cell that is NOT a mine, count how many of its 8 neighbors ARE mines.
-   **Act**: Implement the `calculateAdjacency` method using relative coordinate offsets `[-1, 0, 1]`.
-   **Validate**: Manually verify specific patterns (Corner, Edge, Center) using `Board.debug()`.

---

## Edge Case & Boundary Audit

-   **Grid Boundaries**: Neighbors at `(0,0)` or `(max, max)` must not throw "undefined" errors or wrap around to the other side of the board.
-   **Duplicate Mines**: Ensure the random placement doesn't pick the same cell twice (resulting in fewer mines than required).
-   **Flat vs 2D**: If using a flat array, ensure neighbor math `(index + width)` correctly handles the "end of row" jump.

---

## Verification Protocol

### Adjacency Accuracy Test
1.  Initialize a Beginner board.
2.  Print the grid to the console.
3.  Pick 3 cells (one corner, one edge, one center).
4.  Manually count neighboring mines in the output.
5.  Confirm the cell's `neighborMines` property matches your count.

### Mine Count Integrity
1.  Initialize Expert mode.
2.  Count all cells where `isMine === true`.
3.  Confirm count is exactly 99.

---

## Code Scaffolding

### `app.js` - Engine Skeleton
```javascript
const DIFFICULTIES = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 30, cols: 16, mines: 99 }
};

class Cell {
    constructor() {
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.isQuestionMarked = false;
        this.neighborMines = 0;
    }
}

class Board {
    constructor(config) {
        this.rows = config.rows;
        this.cols = config.cols;
        this.mineCount = config.mines;
        this.grid = [];
        this.init();
    }

    init() {
        // Task 2: Generate Grid
    }

    placeMines() {
        // Task 3: Random Placement
    }

    calculateAdjacency() {
        // Task 4: Adjacency Logic
    }

    debug() {
        // Print a visual representation to the console
    }
}
```
