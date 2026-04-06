// app.js - PXL Sweeper Engine

/** @type {boolean} Enables console debugging if '?debug' is in the URL */
const DEBUG_MODE = window.location.search.includes('debug');

const DIFFICULTIES = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 30, cols: 16, mines: 99 }
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
class Cell {
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
class Board {
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
    placeMines(excludeIndex = -1) {
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
    debug() {
        if (!DEBUG_MODE) return;
        
        let output = "PXL SWEEPER DEBUG BOARD:\n";
        for (let r = 0; r < this.rows; r++) {
            let rowText = "";
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r * this.cols + c];
                if (cell.isMine) {
                    rowText += " * ";
                } else {
                    rowText += ` ${cell.neighborMines} `;
                }
            }
            output += rowText + "\n";
        }
        console.log(output);
    }
}

/**
 * Main game controller that synchronizes the engine state with the DOM.
 */
class Game {
    constructor() {
        this.board = null;
        this.state = GAME_STATES.NOT_STARTED;
        this.difficulty = DIFFICULTIES.BEGINNER;
        this.secondsElapsed = 0;
        this.timerInterval = null;
        this.triggeredMineIndex = -1;
        
        this.init();
    }

    /**
     * Sets up global event listeners and starts the initial game.
     */
    init() {
        document.getElementById('btn-beginner').addEventListener('click', () => this.newGame(DIFFICULTIES.BEGINNER));
        document.getElementById('btn-intermediate').addEventListener('click', () => this.newGame(DIFFICULTIES.INTERMEDIATE));
        document.getElementById('btn-expert').addEventListener('click', () => this.newGame(DIFFICULTIES.EXPERT));
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame(this.difficulty));

        const container = document.getElementById('board-container');
        
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
     * Resets the game state and UI for a new match.
     * @param {Object} difficulty - The difficulty settings to apply.
     */
    newGame(difficulty) {
        this.stopTimer();
        this.difficulty = difficulty;
        this.board = new Board(difficulty);
        this.state = GAME_STATES.NOT_STARTED;
        this.secondsElapsed = 0;
        this.triggeredMineIndex = -1;
        
        this.updateMineCounterUI();
        this.updateTimerUI();
        document.getElementById('restart-btn').textContent = '😊';
        this.updateStatusUI('');

        this.render();
    }

    /**
     * Updates the status message displayed above the board.
     * @param {string} message - The message to display.
     */
    updateStatusUI(message = '') {
        const statusEl = document.getElementById('game-status');
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
        const container = document.getElementById('board-container');
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
        
        const sign = remaining < 0 ? '-' : '';
        const absVal = Math.abs(remaining);
        const displayVal = sign + String(absVal).padStart(sign ? 2 : 3, '0');
        
        document.getElementById('mine-count-display').textContent = displayVal;
    }

    /**
     * Starts the game timer.
     */
    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            if (this.secondsElapsed < 999) {
                this.secondsElapsed++;
                this.updateTimerUI();
            }
        }, 1000);
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
        document.getElementById('timer-display').textContent = String(this.secondsElapsed).padStart(3, '0');
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
        document.getElementById('restart-btn').textContent = '😵';
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
        document.getElementById('restart-btn').textContent = '😎';
        this.updateStatusUI('YOU WIN!');

        this.board.grid.forEach((cell, idx) => {
            if (cell.isMine && !cell.isFlagged) {
                cell.isFlagged = true;
                this.updateCellUI(idx);
            }
        });
        this.updateMineCounterUI();
    }

    /**
     * Updates the visual representation of a single cell in the DOM.
     * @param {number} index - Index of the cell to update.
     */
    updateCellUI(index) {
        const cell = this.board.grid[index];
        const container = document.getElementById('board-container');
        const cellDiv = container.querySelector(`[data-index="${index}"]`);

        if (!cellDiv) return;

        cellDiv.className = 'cell';
        cellDiv.textContent = '';

        if (this.state === GAME_STATES.LOST) {
            if (cell.isMine) {
                cellDiv.classList.add('revealed', 'mine');
                cellDiv.textContent = '💣';
                if (index === this.triggeredMineIndex) {
                    cellDiv.classList.add('triggered');
                }
            } else if (cell.isFlagged && !cell.isMine) {
                cellDiv.classList.add('revealed', 'flagged', 'wrong');
                cellDiv.textContent = '❌'; 
            } else if (cell.isRevealed) {
                this.applyRevealedState(cell, cellDiv);
            } else if (cell.isFlagged) {
                cellDiv.classList.add('flagged');
                cellDiv.textContent = '🚩';
            } else if (cell.isQuestionMarked) {
                cellDiv.classList.add('question');
                cellDiv.textContent = '?';
            }
        } else {
            if (cell.isRevealed) {
                this.applyRevealedState(cell, cellDiv);
            } else if (cell.isFlagged) {
                cellDiv.classList.add('flagged');
                cellDiv.textContent = '🚩';
            } else if (cell.isQuestionMarked) {
                cellDiv.classList.add('question');
                cellDiv.textContent = '?';
            }
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
