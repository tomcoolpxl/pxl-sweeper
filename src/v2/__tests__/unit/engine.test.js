import { describe, it, expect, beforeEach } from 'vitest';
import { MinesweeperEngine, GAME_STATES, Cell } from '../../MinesweeperEngine';

describe('V2 MinesweeperEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new MinesweeperEngine('BEGINNER');
    });

    it('should initialize with the correct grid size', () => {
        expect(engine.grid.length).toBe(81);
        expect(engine.rows).toBe(9);
        expect(engine.cols).toBe(9);
    });

    it('should place exactly the configured number of mines', () => {
        engine.placeMines(0);
        const mineCount = engine.grid.filter(c => c.isMine).length;
        expect(mineCount).toBe(10);
    });

    it('should never place a mine on the first click index', () => {
        const firstClickIndex = 5;
        engine.placeMines(firstClickIndex);
        expect(engine.grid[firstClickIndex].isMine).toBe(false);
    });

    it('should reveal a cell and transition to IN_PROGRESS on first click', () => {
        engine.revealCell(10);
        expect(engine.state).toBe(GAME_STATES.IN_PROGRESS);
        expect(engine.grid[10].isRevealed).toBe(true);
    });

    it('should handle zero-expansion logic correctly', () => {
        // Setup a 3x3 board manually
        engine = new MinesweeperEngine('BEGINNER');
        engine.rows = 3;
        engine.cols = 3;
        engine.mineCount = 1;
        engine.grid = Array.from({ length: 9 }, () => new Cell());
        
        // Place mine at (2,2) -> index 8
        engine.grid[8].isMine = true;
        engine.calculateAdjacency();
        engine.state = GAME_STATES.IN_PROGRESS; // Force state to skip random placement
        
        // Click (0,0) -> index 0. Neighbor mines is 0.
        engine.revealCell(0);
        
        expect(engine.grid[0].isRevealed).toBe(true);
        expect(engine.grid[1].isRevealed).toBe(true);
        expect(engine.grid[3].isRevealed).toBe(true);
        expect(engine.grid[4].isRevealed).toBe(true);
        // Corners/Edges next to mine should NOT be revealed if they are not neighbors of a 0
        expect(engine.grid[8].isRevealed).toBe(false);
    });

    it('should detect a loss when clicking a mine', () => {
        engine.placeMines(0);
        const mineIndex = engine.grid.findIndex(c => c.isMine);
        engine.revealCell(mineIndex);
        
        expect(engine.state).toBe(GAME_STATES.LOST);
        expect(engine.triggeredMineIndex).toBe(mineIndex);
    });

    it('should detect a win when all non-mine cells are revealed', () => {
        // 2x2 board
        engine = new MinesweeperEngine('BEGINNER');
        engine.rows = 2;
        engine.cols = 2;
        engine.mineCount = 1;
        engine.grid = Array.from({ length: 4 }, () => new Cell());
        
        engine.grid[3].isMine = true; // Mine at index 3
        engine.calculateAdjacency();
        engine.state = GAME_STATES.IN_PROGRESS;
        
        engine.revealCell(0);
        engine.revealCell(1);
        engine.revealCell(2);
        
        expect(engine.state).toBe(GAME_STATES.WON);
    });

    it('should toggle flags correctly', () => {
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(true);
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(false);
        expect(engine.grid[15].isQuestionMarked).toBe(true);
        engine.toggleMark(15);
        expect(engine.grid[15].isQuestionMarked).toBe(false);
    });
});
