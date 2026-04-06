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
        [0, 1, 2, 3, 5, 6, 7, 8].filter(idx => idx !== 4).forEach(idx => {
            expect(board.grid[idx].neighborMines).toBe(1);
        });
    });

    it('should respect the first-click safety when placing mines', () => {
        const board = new Board(config);
        const excludeIndex = 5;
        board.placeMines(excludeIndex);
        expect(board.grid[excludeIndex].isMine).toBe(false);
    });
});
