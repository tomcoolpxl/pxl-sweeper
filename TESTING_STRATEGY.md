# Testing Strategy - PXL Sweeper

This document outlines the testing strategy for the PXL Sweeper project, focusing on reliability, maintainability, and high coverage of both game logic and UI interactions.

## Infrastructure Check

### Detected Tools & Chosen Frameworks
- **Language**: JavaScript (ESM)
- **Test Runner**: [Vitest](https://vitest.dev/) - A fast, modern test runner with native ESM support and Jest-compatible API.
- **Assertion Library**: Included with Vitest (Chai-based).
- **Environment**: `jsdom` - For simulating the DOM environment during integration tests.

### Directory Structure
```text
pxl-sweeper/
├── src/
│   ├── js/
│   │   ├── app.js
│   │   └── __tests__/
│   │       ├── unit/          # Logic isolation (Cell, Board)
│   │       │   └── board.test.js
│   │       └── integration/   # Cross-module & DOM verification
│   │           └── game.test.js
```

---

## Test Map

| Category | Feature | Scenario | Type |
| :--- | :--- | :--- | :--- |
| **Unit** | Board Initialization | Grid is created with correct dimensions and empty cells. | Happy Path |
| **Unit** | Mine Placement | Mines are placed correctly, respecting the first-click safety. | Happy Path |
| **Unit** | Adjacency Logic | Neighbor mine counts are calculated accurately. | Happy Path |
| **Integration** | Game Start | Clicking a cell starts the timer and places mines. | Happy Path |
| **Integration** | Reveal Logic | Clicking an empty cell reveals neighbors (flood fill). | Happy Path |
| **Integration** | Win Condition | Game ends in WON state when all safe cells are revealed. | Happy Path |
| **Integration** | Loss Condition | Game ends in LOST state when a mine is revealed. | Happy Path |
| **Unit** | Board Boundaries | Neighbor calculation handles edge and corner cells correctly. | Edge Case |
| **Integration** | Flagging | Right-clicking cycles through Flag -> Question -> None. | Edge Case |

---

## Strategy Details

### Unit Testing
- **Focus**: Pure logic in `Cell` and `Board` classes.
- **Isolation**: No DOM dependencies. If necessary, mock global constants.
- **Pattern**: AAA (Arrange, Act, Assert).
- **Goal**: 100% coverage of adjacency and win/loss state transitions.

### Integration Testing
- **Focus**: `Game` class and its interaction with the DOM.
- **Environment**: Use `jsdom` to provide a realistic browser environment.
- **Setup**: Re-initialize the DOM before each test to prevent pollution.
- **Goal**: Verify that user actions (clicks) correctly update the UI and game state.

---

## Code Samples

### 1. Unit Test: Board Logic (`src/js/__tests__/unit/board.test.js`)
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../../app.js';

describe('Board Logic', () => {
    let config;

    beforeEach(() => {
        config = { rows: 9, cols: 9, mines: 10 };
    });

    it('should initialize a grid of the correct size', () => {
        const board = new Board(config);
        expect(board.grid.length).toBe(81);
    });

    it('should place the correct number of mines', () => {
        const board = new Board(config);
        board.placeMines(0); // Exclude first cell
        const mineCount = board.grid.filter(c => c.isMine).length;
        expect(mineCount).toBe(10);
    });

    it('should calculate adjacency correctly', () => {
        const board = new Board({ rows: 3, cols: 3, mines: 1 });
        // Manually place a mine in the center
        board.grid[4].isMine = true;
        board.calculateAdjacency();
        
        // All neighbors should have neighborMines === 1
        [0, 1, 2, 3, 5, 6, 7, 8].forEach(idx => {
            expect(board.grid[idx].neighborMines).toBe(1);
        });
    });
});
```

### 2. Integration Test: Game UI (`src/js/__tests__/integration/game.test.js`)
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../../app.js';

// Mocking DOM elements required for Game initialization
document.body.innerHTML = `
    <div id="game-status"></div>
    <div id="mine-count-display">000</div>
    <div id="timer-display">000</div>
    <button id="restart-btn">😊</button>
    <button id="btn-beginner"></button>
    <button id="btn-intermediate"></button>
    <button id="btn-expert"></button>
    <div id="board-container"></div>
`;

describe('Game Integration', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    it('should start the game and timer on first click', () => {
        const firstCell = document.querySelector('[data-index="0"]');
        firstCell.click();
        
        expect(game.state).toBe('IN_PROGRESS');
        expect(game.timerInterval).not.toBeNull();
    });

    it('should handle loss when clicking a mine', () => {
        // Force a mine placement
        game.board.placeMines(1); // Click index 1, skip 0
        const mineIdx = game.board.grid.findIndex(c => c.isMine);
        
        const mineCell = document.querySelector(`[data-index="${mineIdx}"]`);
        mineCell.click();

        expect(game.state).toBe('LOST');
        expect(document.getElementById('restart-btn').textContent).toBe('😵');
    });
});
```

---

## Execution Guide

To install the testing dependencies:
```bash
npm install -D vitest jsdom
```

To run the tests:
```bash
npx vitest run
```

To run tests in watch mode:
```bash
npx vitest
```
