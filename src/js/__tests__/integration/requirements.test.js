import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Game } from '../../app.js';

describe('Requirements Coverage', () => {
    let game;

    beforeEach(() => {
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
        vi.useFakeTimers();
        game = new Game();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should support Intermediate difficulty preset (16x16, 40 mines)', () => {
        const btn = document.getElementById('btn-intermediate');
        btn.click();
        expect(game.difficulty.rows).toBe(16);
        expect(game.difficulty.cols).toBe(16);
        expect(game.board.mineCount).toBe(40);
        expect(game.board.grid.length).toBe(256);
    });

    it('should support Expert difficulty preset (16x30, 99 mines)', () => {
        const btn = document.getElementById('btn-expert');
        btn.click();
        expect(game.difficulty.rows).toBe(16);
        expect(game.difficulty.cols).toBe(30);
        expect(game.board.mineCount).toBe(99);
        expect(game.board.grid.length).toBe(480);
    });

    it('should cycle mark state: Unmarked -> Flag -> Question -> Unmarked', () => {
        const cell = document.querySelector('[data-index="10"]');
        
        // Unmarked -> Flag
        cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        expect(game.board.grid[10].isFlagged).toBe(true);
        expect(game.board.grid[10].isQuestionMarked).toBe(false);
        expect(cell.textContent).toBe('🚩');

        // Flag -> Question
        cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        expect(game.board.grid[10].isFlagged).toBe(false);
        expect(game.board.grid[10].isQuestionMarked).toBe(true);
        expect(cell.textContent).toBe('?');

        // Question -> Unmarked
        cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        expect(game.board.grid[10].isFlagged).toBe(false);
        expect(game.board.grid[10].isQuestionMarked).toBe(false);
        expect(cell.textContent).toBe('');
    });

    it('should win when all non-mine cells are revealed (without flags)', () => {
        // Setup a 2x2 board with 1 mine for easy testing
        game.newGame({ rows: 2, cols: 2, mines: 1 });
        
        // Click (0,0) - it will be safe
        const cell0 = document.querySelector('[data-index="0"]');
        cell0.click();

        // Find the other two safe cells and reveal them
        game.board.grid.forEach((cell, idx) => {
            if (!cell.isMine && !cell.isRevealed) {
                const el = document.querySelector(`[data-index="${idx}"]`);
                el.click();
            }
        });

        expect(game.state).toBe('WON');
        expect(document.getElementById('game-status').textContent).toBe('YOU WIN!');
    });

    it('should not start timer when placing flags/marks only', () => {
        const cell = document.querySelector('[data-index="5"]');
        cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        
        vi.advanceTimersByTime(2000);
        expect(game.secondsElapsed).toBe(0);
        expect(document.getElementById('timer-display').textContent).toBe('000');
    });

    it('should reset timer and state on difficulty change', () => {
        // Start game
        document.querySelector('[data-index="0"]').click();
        vi.advanceTimersByTime(2000);
        expect(game.secondsElapsed).toBeGreaterThan(0);

        // Change difficulty
        document.getElementById('btn-intermediate').click();
        expect(game.secondsElapsed).toBe(0);
        expect(game.state).toBe('NOT_STARTED');
    });
});
