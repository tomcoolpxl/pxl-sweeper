import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Game } from '../../app.js';

describe('Dialogs and Highscores', () => {
    let game;

    beforeEach(() => {
        // Mock window.confirm
        window.confirm = vi.fn(() => true);
        localStorage.clear();
        vi.useFakeTimers();

        document.body.innerHTML = `
            <div id="app">
                <header>
                    <button id="btn-beginner"></button>
                    <button id="btn-intermediate"></button>
                    <button id="btn-expert"></button>
                    <button id="btn-instructions"></button>
                    <button id="btn-highscores"></button>
                </header>
                <main>
                    <div id="hud">
                        <div id="mine-count-display">000</div>
                        <button id="restart-btn">😊</button>
                        <div id="timer-display">000</div>
                    </div>
                    <div id="game-status"></div>
                    <div id="board-container"></div>
                </main>
                <dialog id="instructions-modal"><button class="close-modal"></button></dialog>
                <dialog id="highscores-modal">
                    <span id="score-beginner">---</span>
                    <span id="score-intermediate">---</span>
                    <span id="score-expert">---</span>
                    <button id="btn-clear-scores"></button>
                    <button class="close-modal"></button>
                </dialog>
                <dialog id="confirm-modal">
                    <p id="confirm-message"></p>
                    <button id="confirm-yes"></button>
                    <button id="confirm-no" class="close-modal"></button>
                </dialog>
            </div>
        `;

        game = new Game();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should open instructions modal', () => {
        const btn = document.getElementById('btn-instructions');
        const modal = document.getElementById('instructions-modal');
        btn.click();
        expect(modal.showModal).toHaveBeenCalled();
    });

    it('should open and update highscores modal', () => {
        const btn = document.getElementById('btn-highscores');
        const modal = document.getElementById('highscores-modal');
        
        // Set a highscore manually
        localStorage.setItem('pxl_sweeper_scores', JSON.stringify({ BEGINNER: 10, INTERMEDIATE: null, EXPERT: null }));
        
        btn.click();
        
        expect(modal.showModal).toHaveBeenCalled();
        expect(document.getElementById('score-beginner').textContent).toBe('10');
    });

    it('should save a new highscore on win', () => {
        game.newGame(game.difficulty); // BEGINNER by default
        game.secondsElapsed = 5;
        
        // Trigger win
        game.handleWin();
        
        const scores = JSON.parse(localStorage.getItem('pxl_sweeper_scores'));
        expect(scores.BEGINNER).toBe(5);
    });

    it('should clear highscores after confirmation', async () => {
        localStorage.setItem('pxl_sweeper_scores', JSON.stringify({ BEGINNER: 10 }));
        
        // Trigger clear button
        document.getElementById('btn-clear-scores').click();
        
        const confirmModal = document.getElementById('confirm-modal');
        expect(confirmModal.showModal).toHaveBeenCalled();
        expect(document.getElementById('confirm-message').textContent).toContain('clear all highscores');

        // Click Yes
        document.getElementById('confirm-yes').click();
        
        // Wait for microtasks (Promise resolution)
        await vi.runAllTimersAsync();

        expect(localStorage.getItem('pxl_sweeper_scores')).toBeNull();
        expect(document.getElementById('score-beginner').textContent).toBe('---');
    });

    it('should not clear highscores if cancelled', async () => {
        localStorage.setItem('pxl_sweeper_scores', JSON.stringify({ BEGINNER: 10 }));
        
        document.getElementById('btn-clear-scores').click();
        document.getElementById('confirm-no').click();
        
        await vi.runAllTimersAsync();

        expect(localStorage.getItem('pxl_sweeper_scores')).not.toBeNull();
    });
});
