import { describe, it, expect, beforeEach } from 'vitest';
import { MinesweeperEngine, GAME_STATES, Cell } from '../../MinesweeperEngine';

describe('V2 MinesweeperEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new MinesweeperEngine('BEGINNER');
    });

    // --- Initialisation ---

    it('should initialise with the correct grid size', () => {
        expect(engine.grid.length).toBe(81);
        expect(engine.rows).toBe(9);
        expect(engine.cols).toBe(9);
    });

    it('should expose difficultyKey on the engine instance', () => {
        expect(engine.difficultyKey).toBe('BEGINNER');
        const expert = new MinesweeperEngine('EXPERT');
        expect(expert.difficultyKey).toBe('EXPERT');
    });

    // --- Mine placement ---

    it('should place exactly the configured number of mines', () => {
        engine.placeMines(0);
        const mineCount = engine.grid.filter(c => c.isMine).length;
        expect(mineCount).toBe(10);
    });

    it('should never place a mine on the first click index or any of its neighbors', () => {
        const firstClickIndex = 40; // centre of 9x9 board — has 8 neighbors
        engine.placeMines(firstClickIndex);
        expect(engine.grid[firstClickIndex].isMine).toBe(false);
        const neighbors = engine.getNeighborsByIndex(firstClickIndex);
        for (const n of neighbors) {
            expect(engine.grid[n].isMine).toBe(false);
        }
        // Clicked cell must have zero neighbor mines — flood-fill guaranteed
        expect(engine.grid[firstClickIndex].neighborMines).toBe(0);
    });

    it('should throw when mineCount >= available non-safe cells', () => {
        engine.mineCount = engine.grid.length;
        expect(() => engine.placeMines(0)).toThrow();
    });

    // --- revealCell ---

    it('should reveal a cell and transition to IN_PROGRESS on first click', () => {
        engine.revealCell(10);
        expect(engine.state).toBe(GAME_STATES.IN_PROGRESS);
        expect(engine.grid[10].isRevealed).toBe(true);
    });

    it('should return empty array when revealing an already-revealed cell', () => {
        engine.placeMines(0);
        engine.grid[0].isMine = false;
        engine.grid[0].isRevealed = true;
        const result = engine.revealCell(0);
        expect(result).toEqual([]);
    });

    it('should return empty array for out-of-bounds index', () => {
        expect(engine.revealCell(-1)).toEqual([]);
        expect(engine.revealCell(9999)).toEqual([]);
    });

    it('should return empty array when game is already WON', () => {
        engine.state = GAME_STATES.WON;
        expect(engine.revealCell(0)).toEqual([]);
    });

    it('should return empty array when game is already LOST', () => {
        engine.state = GAME_STATES.LOST;
        expect(engine.revealCell(0)).toEqual([]);
    });

    it('should handle zero-expansion logic correctly', () => {
        // 3x3 board: mine at index 8 (bottom-right)
        engine = new MinesweeperEngine('BEGINNER');
        engine.rows = 3;
        engine.cols = 3;
        engine.mineCount = 1;
        engine.grid = Array.from({ length: 9 }, () => new Cell());

        engine.grid[8].isMine = true;
        engine.calculateAdjacency();
        engine.state = GAME_STATES.IN_PROGRESS;

        engine.revealCell(0); // top-left: neighborMines=0, cascade starts

        // All non-mine cells reachable from index 0 should be revealed
        expect(engine.grid[0].isRevealed).toBe(true);
        expect(engine.grid[1].isRevealed).toBe(true);
        expect(engine.grid[2].isRevealed).toBe(true);
        expect(engine.grid[3].isRevealed).toBe(true);
        expect(engine.grid[4].isRevealed).toBe(true);
        expect(engine.grid[5].isRevealed).toBe(true);
        expect(engine.grid[6].isRevealed).toBe(true);
        expect(engine.grid[7].isRevealed).toBe(true);
        // Mine is not revealed
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
        // 2x2 board, mine at index 3
        engine = new MinesweeperEngine('BEGINNER');
        engine.rows = 2;
        engine.cols = 2;
        engine.mineCount = 1;
        engine.grid = Array.from({ length: 4 }, () => new Cell());

        engine.grid[3].isMine = true;
        engine.calculateAdjacency();
        engine.state = GAME_STATES.IN_PROGRESS;

        engine.revealCell(0);
        engine.revealCell(1);
        engine.revealCell(2);

        expect(engine.state).toBe(GAME_STATES.WON);
    });

    it('should auto-flag all mines on win', () => {
        engine = new MinesweeperEngine('BEGINNER');
        engine.rows = 2;
        engine.cols = 2;
        engine.mineCount = 1;
        engine.grid = Array.from({ length: 4 }, () => new Cell());

        engine.grid[3].isMine = true;
        engine.calculateAdjacency();
        engine.state = GAME_STATES.IN_PROGRESS;

        engine.revealCell(0);
        engine.revealCell(1);
        engine.revealCell(2);

        expect(engine.grid[3].isFlagged).toBe(true);
    });

    // --- getRemainingMines ---

    it('should correctly report remaining mines after flagging', () => {
        engine.placeMines(0);
        expect(engine.getRemainingMines()).toBe(10);
        engine.toggleMark(1);  // flag one cell (may or may not be a mine)
        expect(engine.getRemainingMines()).toBe(9);
    });

    // --- toggleMark ---

    it('should toggle flags correctly through full cycle', () => {
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(true);
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(false);
        expect(engine.grid[15].isQuestionMarked).toBe(true);
        engine.toggleMark(15);
        expect(engine.grid[15].isQuestionMarked).toBe(false);
    });

    it('should not toggle a revealed cell', () => {
        engine.grid[15].isRevealed = true;
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(false);
        expect(engine.grid[15].isQuestionMarked).toBe(false);
    });

    it('should not toggle when game is WON', () => {
        engine.state = GAME_STATES.WON;
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(false);
    });

    it('should not toggle when game is LOST', () => {
        engine.state = GAME_STATES.LOST;
        engine.toggleMark(15);
        expect(engine.grid[15].isFlagged).toBe(false);
    });
});
