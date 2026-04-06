// app.js - PXL Sweeper Engine

/** @type {boolean} Enables console debugging if '?debug' is in the URL */
const DEBUG_MODE = window.location.search.includes('debug');

const CONFIG = {
    SELECTORS: {
        BOARD_CONTAINER: 'board-container',
        MINE_COUNT_DISPLAY: 'mine-count-display',
        TIMER_DISPLAY: 'timer-display',
        RESTART_BTN: 'restart-btn',
        GAME_STATUS: 'game-status',
        BTN_BEGINNER: 'btn-beginner',
        BTN_INTERMEDIATE: 'btn-intermediate',
        BTN_EXPERT: 'btn-expert',
        BTN_INSTRUCTIONS: 'btn-instructions',
        BTN_HIGHSCORES: 'btn-highscores',
        INSTRUCTIONS_MODAL: 'instructions-modal',
        HIGHSCORES_MODAL: 'highscores-modal',
        CONFIRM_MODAL: 'confirm-modal',
        CONFIRM_YES: 'confirm-yes',
        CONFIRM_NO: 'confirm-no',
        BTN_CLEAR_SCORES: 'btn-clear-scores',
        SCORE_BEGINNER: 'score-beginner',
        SCORE_INTERMEDIATE: 'score-intermediate',
        SCORE_EXPERT: 'score-expert'
    },
    EMOJIS: {
        MINE: '💣',
        FLAG: '🚩',
        QUESTION: '?',
        WRONG_FLAG: '❌',
        HAPPY: '😊',
        LOST: '😵',
        WON: '😎'
    },
    CONSTANTS: {
        TIMER_INTERVAL_MS: 1000,
        TIMER_MAX_SECONDS: 999,
        PAD_LENGTH_DEFAULT: 3,
        PAD_LENGTH_MINES_NEGATIVE: 2,
        FIRST_CLICK_EXCLUDE_DEFAULT: -1,
        MINE_COUNT_SIGN_THRESHOLD: 0,
        LOCAL_STORAGE_KEY: 'pxl_sweeper_scores'
    }
};

const DIFFICULTIES = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 16, cols: 30, mines: 99 }
};

const GAME_STATES = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    WON: 'WON',
    LOST: 'LOST'
};

/**
 * Represents a single cell on the Minesweeper board.
 */
export class Cell {
    constructor() {
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.isQuestionMarked = false;
        this.neighborMines = 0;
    }
}

/**
 * Handles the logic for the game board, including mine placement and adjacency calculations.
 */
export class Board {
    /**
     * @param {Object} config - Difficulty configuration (rows, cols, mines).
     */
    constructor(config) {
        this.rows = config.rows;
        this.cols = config.cols;
        this.mineCount = config.mineCount || config.mines;
        this.grid = [];
        this.init();
    }

    /**
     * Initializes a grid of empty cells.
     */
    init() {
        this.grid = Array.from({ length: this.rows * this.cols }, () => new Cell());
    }

    /**
     * Randomly places mines on the grid, ensuring the first click is safe.
     * @param {number} excludeIndex - Index to exclude from mine placement.
     */
    placeMines(excludeIndex = CONFIG.CONSTANTS.FIRST_CLICK_EXCLUDE_DEFAULT) {
        let placedMines = 0;
        while (placedMines < this.mineCount) {
            const randomIndex = Math.floor(Math.random() * this.grid.length);
            
            if (randomIndex !== excludeIndex && !this.grid[randomIndex].isMine) {
                this.grid[randomIndex].isMine = true;
                placedMines++;
            }
        }
        this.calculateAdjacency();
        
        if (DEBUG_MODE) {
            this.debug();
        }
    }

    /**
     * Calculates the number of neighboring mines for each non-mine cell.
     */
    calculateAdjacency() {
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i].isMine) continue;
            
            const neighbors = this.getNeighborsByIndex(i);
            this.grid[i].neighborMines = neighbors.filter(idx => this.grid[idx].isMine).length;
        }
    }

    /**
     * Helper to get neighbor indices for a given cell index.
     * @param {number} index - Index of the cell.
     * @returns {number[]} Array of neighbor indices.
     */
    getNeighborsByIndex(index) {
        const row = Math.floor(index / this.cols);
        const col = index % this.cols;
        const neighbors = [];

        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;

                const newRow = row + r;
                const newCol = col + c;

                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    neighbors.push(newRow * this.cols + newCol);
                }
            }
        }
        return neighbors;
    }

    /**
     * Prints a visual representation of the board to the console for debugging.
     */
    /* v8 ignore next 21 */
    debug() {
        if (!DEBUG_MODE) return;
        
        let output = 'PXL SWEEPER DEBUG BOARD:\n';
        for (let r = 0; r < this.rows; r++) {
            let rowText = '';
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r * this.cols + c];
                if (cell.isMine) {
                    rowText += ' * ';
                } else {
                    rowText += ` ${cell.neighborMines} `;
                }
            }
            output += rowText + '\n';
        }
        console.log(output);
    }
}

/**
 * Main game controller that synchronizes the engine state with the DOM.
 */
export class Game {
    constructor() {
        this.board = null;
        this.state = GAME_STATES.NOT_STARTED;
        this.difficulty = DIFFICULTIES.BEGINNER;
        this.secondsElapsed = 0;
        this.timerInterval = null;
        this.triggeredMineIndex = CONFIG.CONSTANTS.FIRST_CLICK_EXCLUDE_DEFAULT;
        
        this.init();
    }

    /**
     * Sets up global event listeners and starts the initial game.
     */
    init() {
        const { SELECTORS } = CONFIG;
        document.getElementById(SELECTORS.BTN_BEGINNER).addEventListener('click', () => this.newGame(DIFFICULTIES.BEGINNER));
        document.getElementById(SELECTORS.BTN_INTERMEDIATE).addEventListener('click', () => this.newGame(DIFFICULTIES.INTERMEDIATE));
        document.getElementById(SELECTORS.BTN_EXPERT).addEventListener('click', () => this.newGame(DIFFICULTIES.EXPERT));
        document.getElementById(SELECTORS.RESTART_BTN).addEventListener('click', () => this.newGame(this.difficulty));

        // Dialog Listeners
        document.getElementById(SELECTORS.BTN_INSTRUCTIONS).addEventListener('click', () => {
            document.getElementById(SELECTORS.INSTRUCTIONS_MODAL).showModal();
        });

        document.getElementById(SELECTORS.BTN_HIGHSCORES).addEventListener('click', () => {
            this.updateHighscoresUI();
            document.getElementById(SELECTORS.HIGHSCORES_MODAL).showModal();
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('dialog').close();
            });
        });

        document.getElementById(SELECTORS.BTN_CLEAR_SCORES).addEventListener('click', async () => {
            const confirmed = await this.showConfirm('Are you sure you want to clear all highscores?');
            if (confirmed) {
                this.clearHighscores();
            }
        });

        const container = document.getElementById(SELECTORS.BOARD_CONTAINER);
        
        // Left-click reveal handler
        container.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                this.handleCellClick(index);
            }
        });

        // Right-click marking handler
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.cell');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                this.handleCellRightClick(index);
            }
        });

        // Initial Beginner game
        this.newGame(DIFFICULTIES.BEGINNER);
    }

    /**
     * Shows a custom confirmation dialog.
     * @param {string} message - The message to display.
     * @returns {Promise<boolean>} Resolves with true if confirmed, false otherwise.
     */
    showConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById(CONFIG.SELECTORS.CONFIRM_MODAL);
            const yesBtn = document.getElementById(CONFIG.SELECTORS.CONFIRM_YES);
            const noBtn = document.getElementById(CONFIG.SELECTORS.CONFIRM_NO);
            const messageEl = document.getElementById('confirm-message');

            messageEl.textContent = message;

            const handleYes = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
                modal.close();
            };

            yesBtn.addEventListener('click', handleYes);
            noBtn.addEventListener('click', handleNo);

            modal.showModal();
        });
    }

    /**
     * Resets the game state and UI for a new match.
     * @param {Object} difficulty - The difficulty settings to apply.
     */
    newGame(difficulty) {
        this.stopTimer();
        this.difficulty = difficulty;
        this.board = new Board(difficulty);
        this.state = GAME_STATES.NOT_STARTED;
        this.secondsElapsed = 0;
        this.triggeredMineIndex = CONFIG.CONSTANTS.FIRST_CLICK_EXCLUDE_DEFAULT;
        
        this.updateMineCounterUI();
        this.updateTimerUI();
        document.getElementById(CONFIG.SELECTORS.RESTART_BTN).textContent = CONFIG.EMOJIS.HAPPY;
        this.updateStatusUI('');

        this.render();
    }

    /**
     * Updates the status message displayed above the board.
     * @param {string} message - The message to display.
     */
    updateStatusUI(message = '') {
        const statusEl = document.getElementById(CONFIG.SELECTORS.GAME_STATUS);
        if (!statusEl) return;
        
        statusEl.textContent = message;
        statusEl.className = ''; // Reset classes
        
        if (this.state === GAME_STATES.WON) {
            statusEl.classList.add('won');
        } else if (this.state === GAME_STATES.LOST) {
            statusEl.classList.add('lost');
        }
    }

    /**
     * Renders the game board in the DOM using CSS Grid.
     */
    render() {
        const container = document.getElementById(CONFIG.SELECTORS.BOARD_CONTAINER);
        container.innerHTML = '';
        
        container.style.setProperty('--grid-cols', this.board.cols);
        container.style.setProperty('--grid-rows', this.board.rows);

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this.board.grid.length; i++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.index = i;
            fragment.appendChild(cellDiv);
        }
        container.appendChild(fragment);
    }

    /**
     * Handles left-click reveal logic.
     * @param {number} index - Index of the clicked cell.
     */
    handleCellClick(index) {
        if (this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST) return;

        const cell = this.board.grid[index];

        if (cell.isRevealed || cell.isFlagged) return;

        // Lazy mine placement for first-click safety
        if (this.state === GAME_STATES.NOT_STARTED) {
            this.board.placeMines(index);
            this.state = GAME_STATES.IN_PROGRESS;
            this.startTimer();
        }

        this.revealCell(index);
    }

    /**
     * Handles right-click marking logic.
     * @param {number} index - Index of the clicked cell.
     */
    handleCellRightClick(index) {
        if (this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST) return;
        this.toggleMark(index);
    }

    /**
     * Toggles between unmarked, flagged, and question-marked states.
     * @param {number} index - Index of the cell.
     */
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

    /**
     * Updates the mine counter HUD based on flag count.
     */
    updateMineCounterUI() {
        const flaggedCount = this.board.grid.filter(c => c.isFlagged).length;
        const remaining = this.board.mineCount - flaggedCount;
        
        const sign = remaining < CONFIG.CONSTANTS.MINE_COUNT_SIGN_THRESHOLD ? '-' : '';
        const absVal = Math.abs(remaining);
        const padLength = sign ? CONFIG.CONSTANTS.PAD_LENGTH_MINES_NEGATIVE : CONFIG.CONSTANTS.PAD_LENGTH_DEFAULT;
        const displayVal = sign + String(absVal).padStart(padLength, '0');
        
        document.getElementById(CONFIG.SELECTORS.MINE_COUNT_DISPLAY).textContent = displayVal;
    }

    /**
     * Starts the game timer.
     */
    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            if (this.secondsElapsed < CONFIG.CONSTANTS.TIMER_MAX_SECONDS) {
                this.secondsElapsed++;
                this.updateTimerUI();
            }
        }, CONFIG.CONSTANTS.TIMER_INTERVAL_MS);
    }

    /**
     * Stops the game timer.
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Updates the timer display in the HUD.
     */
    updateTimerUI() {
        document.getElementById(CONFIG.SELECTORS.TIMER_DISPLAY).textContent = String(this.secondsElapsed).padStart(CONFIG.CONSTANTS.PAD_LENGTH_DEFAULT, '0');
    }

    /**
     * Reveals a cell and its neighbors if it has zero adjacent mines.
     * @param {number} startIndex - Starting cell index.
     */
    revealCell(startIndex) {
        const stack = [startIndex];
        const processed = new Set();

        while (stack.length > 0) {
            const index = stack.pop();
            const cell = this.board.grid[index];

            if (cell.isRevealed || cell.isFlagged || processed.has(index)) continue;

            cell.isRevealed = true;
            this.updateCellUI(index);
            processed.add(index);

            if (cell.isMine) {
                this.handleLoss(index);
                return;
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

    /**
     * Handles game loss, revealing all mines and identifying mistakes.
     * @param {number} triggeredIdx - The index of the mine that was clicked.
     */
    handleLoss(triggeredIdx) {
        this.state = GAME_STATES.LOST;
        this.stopTimer();
        this.triggeredMineIndex = triggeredIdx;
        document.getElementById(CONFIG.SELECTORS.RESTART_BTN).textContent = CONFIG.EMOJIS.LOST;
        this.updateStatusUI('GAME OVER');

        this.board.grid.forEach((_, idx) => {
            this.updateCellUI(idx);
        });
    }

    /**
     * Checks if the win condition has been met (all non-mine cells revealed).
     */
    checkWinCondition() {
        const totalNonMines = this.board.grid.length - this.board.mineCount;
        const revealedNonMines = this.board.grid.filter(c => c.isRevealed && !c.isMine).length;

        if (revealedNonMines === totalNonMines) {
            this.handleWin();
        }
    }

    /**
     * Handles game win, updating UI and auto-flagging remaining mines.
     */
    handleWin() {
        this.state = GAME_STATES.WON;
        this.stopTimer();
        document.getElementById(CONFIG.SELECTORS.RESTART_BTN).textContent = CONFIG.EMOJIS.WON;
        this.updateStatusUI('YOU WIN!');

        this.checkHighscore();

        this.board.grid.forEach((cell, idx) => {
            if (cell.isMine && !cell.isFlagged) {
                cell.isFlagged = true;
                this.updateCellUI(idx);
            }
        });
        this.updateMineCounterUI();
    }

    /**
     * Checks if current score is a new highscore for current difficulty.
     */
    checkHighscore() {
        const scores = this.getHighscores();
        const diffName = this.getDifficultyName();
        const currentBest = scores[diffName];

        if (currentBest === null || this.secondsElapsed < currentBest) {
            scores[diffName] = this.secondsElapsed;
            this.saveHighscores(scores);
            this.updateStatusUI(`NEW RECORD: ${this.secondsElapsed}s!`);
        }
    }

    /**
     * @returns {Object} Current highscores from localStorage.
     */
    getHighscores() {
        const data = localStorage.getItem(CONFIG.CONSTANTS.LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : { BEGINNER: null, INTERMEDIATE: null, EXPERT: null };
    }

    /**
     * Saves scores to localStorage.
     * @param {Object} scores - The scores object to save.
     */
    saveHighscores(scores) {
        localStorage.setItem(CONFIG.CONSTANTS.LOCAL_STORAGE_KEY, JSON.stringify(scores));
    }

    /**
     * Clears all highscores.
     */
    clearHighscores() {
        localStorage.removeItem(CONFIG.CONSTANTS.LOCAL_STORAGE_KEY);
        this.updateHighscoresUI();
    }

    /**
     * Updates the Highscores UI with stored values.
     */
    updateHighscoresUI() {
        const scores = this.getHighscores();
        const { SELECTORS } = CONFIG;
        
        document.getElementById(SELECTORS.SCORE_BEGINNER).textContent = scores.BEGINNER || '---';
        document.getElementById(SELECTORS.SCORE_INTERMEDIATE).textContent = scores.INTERMEDIATE || '---';
        document.getElementById(SELECTORS.SCORE_EXPERT).textContent = scores.EXPERT || '---';
    }

    /**
     * @returns {string} Key name for current difficulty.
     */
    getDifficultyName() {
        if (this.difficulty === DIFFICULTIES.BEGINNER) return 'BEGINNER';
        if (this.difficulty === DIFFICULTIES.INTERMEDIATE) return 'INTERMEDIATE';
        if (this.difficulty === DIFFICULTIES.EXPERT) return 'EXPERT';
        return 'CUSTOM';
    }

    /**
     * Updates the visual representation of a single cell in the DOM.
     * @param {number} index - Index of the cell to update.
     */
    updateCellUI(index) {
        const container = document.getElementById(CONFIG.SELECTORS.BOARD_CONTAINER);
        const cellDiv = container.querySelector(`[data-index="${index}"]`);
        if (!cellDiv) return;

        const cell = this.board.grid[index];
        cellDiv.className = 'cell';
        cellDiv.textContent = '';

        if (this.state === GAME_STATES.LOST) {
            this.renderCellLossState(cell, cellDiv, index);
        } else {
            this.renderCellPlayState(cell, cellDiv);
        }
    }

    /**
     * Renders a cell during active gameplay or win state.
     * @param {Cell} cell - The cell object.
     * @param {HTMLElement} cellDiv - The DOM element.
     */
    renderCellPlayState(cell, cellDiv) {
        if (cell.isRevealed) {
            this.applyRevealedState(cell, cellDiv);
        } else if (cell.isFlagged) {
            cellDiv.classList.add('flagged');
            cellDiv.textContent = CONFIG.EMOJIS.FLAG;
        } else if (cell.isQuestionMarked) {
            cellDiv.classList.add('question');
            cellDiv.textContent = CONFIG.EMOJIS.QUESTION;
        }
    }

    /**
     * Renders a cell after the game has been lost.
     * @param {Cell} cell - The cell object.
     * @param {HTMLElement} cellDiv - The DOM element.
     * @param {number} index - The cell index.
     */
    renderCellLossState(cell, cellDiv, index) {
        if (cell.isMine) {
            cellDiv.classList.add('revealed', 'mine');
            cellDiv.textContent = CONFIG.EMOJIS.MINE;
            if (index === this.triggeredMineIndex) {
                cellDiv.classList.add('triggered');
            }
        } else if (cell.isFlagged && !cell.isMine) {
            cellDiv.classList.add('revealed', 'flagged', 'wrong');
            cellDiv.textContent = CONFIG.EMOJIS.WRONG_FLAG; 
        } else {
            this.renderCellPlayState(cell, cellDiv);
        }
    }

    /**
     * Applies styling for a revealed non-mine cell.
     * @param {Cell} cell - The cell object.
     * @param {HTMLElement} cellDiv - The DOM element.
     */
    applyRevealedState(cell, cellDiv) {
        cellDiv.classList.add('revealed');
        if (cell.neighborMines > 0) {
            cellDiv.textContent = cell.neighborMines;
            cellDiv.classList.add(`n${cell.neighborMines}`);
        }
    }
}

// Start the game engine
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
