import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Game } from '../../app.js';

describe('Game Integration', () => {
    let game;

    beforeEach(() => {
        // Setup a fresh DOM for each test
        document.body.innerHTML = `
            <div id="game-status"></div>
            <div id="mine-count-display">000</div>
            <div id="timer-display">000</div>
            <button id="restart-btn">😊</button>
            <button id="btn-beginner"></button>
            <button id="btn-intermediate"></button>
            <button id="btn-expert"></button>
            <button id="btn-instructions"></button>
            <button id="btn-highscores"></button>
            <div id="board-container"></div>
            <dialog id="instructions-modal"><button class="close-modal"></button></dialog>
            <dialog id="highscores-modal">
                <span id="score-beginner">---</span>
                <span id="score-intermediate">---</span>
                <span id="score-expert">---</span>
                <button id="btn-clear-scores"></button>
                <button class="close-modal"></button>
            </dialog>
        `;

        // Mock setInterval/clearInterval
        vi.useFakeTimers();
        
        game = new Game();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should initialize with a beginner board', () => {
        expect(game.difficulty.rows).toBe(9);
        expect(game.board.grid.length).toBe(81);
        expect(document.querySelectorAll('.cell').length).toBe(81);
    });

    it('should start the game and timer on first click', () => {
        const firstCell = document.querySelector('[data-index="0"]');
        firstCell.click();
        
        expect(game.state).toBe('IN_PROGRESS');
        expect(game.timerInterval).not.toBeNull();
        
        // Fast-forward time
        vi.advanceTimersByTime(1000);
        expect(document.getElementById('timer-display').textContent).toBe('001');
    });

    it('should toggle flags on right click', () => {
        const cell = document.querySelector('[data-index="5"]');
        
        // Right-click event
        cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        
        expect(game.board.grid[5].isFlagged).toBe(true);
        expect(cell.classList.contains('flagged')).toBe(true);
        expect(cell.textContent).toBe('🚩');
    });

    it('should handle loss when clicking a mine', () => {
        // Start game at index 1 to place mines
        const safeCell = document.querySelector('[data-index="1"]');
        safeCell.click();

        // Find a mine and click it
        const mineIdx = game.board.grid.findIndex(c => c.isMine);
        const mineCell = document.querySelector(`[data-index="${mineIdx}"]`);
        
        mineCell.click();

        expect(game.state).toBe('LOST');
        expect(document.getElementById('restart-btn').textContent).toBe('😵');
        expect(document.getElementById('game-status').textContent).toBe('GAME OVER');
        expect(mineCell.classList.contains('mine')).toBe(true);
    });

    it('should restart game when clicking restart button', () => {
        game.state = 'LOST';
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.click();
        
        expect(game.state).toBe('NOT_STARTED');
        expect(game.secondsElapsed).toBe(0);
        expect(restartBtn.textContent).toBe('😊');
    });
});
