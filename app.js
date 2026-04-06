// app.js - PXL Sweeper Engine

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
        this.mineCount = config.mineCount || config.mines;
        this.grid = [];
        this.init();
    }

    /**
     * Initialize a grid of empty cells
     */
    init() {
        this.grid = Array.from({ length: this.rows * this.cols }, () => new Cell());
    }

    /**
     * Randomly place mines on the grid
     * @param {number} excludeIndex - Index to exclude from mine placement (for first-click safety)
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
    }

    /**
     * Calculate neighbor mine counts for each cell
     */
    calculateAdjacency() {
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i].isMine) continue;
            
            const neighbors = this.getNeighborsByIndex(i);
            this.grid[i].neighborMines = neighbors.filter(idx => this.grid[idx].isMine).length;
        }
    }

    /**
     * Helper to get neighbor indices for a given index
     * @param {number} index - Index of the cell
     * @returns {number[]} Array of neighbor indices
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
     * Print a visual representation of the board to the console
     */
    debug() {
        let output = "";
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

class Game {
    constructor() {
        this.board = null;
        this.state = GAME_STATES.NOT_STARTED;
        this.difficulty = DIFFICULTIES.BEGINNER;
        
        this.init();
    }

    /**
     * Initialize event listeners and start the first game
     */
    init() {
        document.getElementById('btn-beginner').addEventListener('click', () => this.newGame(DIFFICULTIES.BEGINNER));
        document.getElementById('btn-intermediate').addEventListener('click', () => this.newGame(DIFFICULTIES.INTERMEDIATE));
        document.getElementById('btn-expert').addEventListener('click', () => this.newGame(DIFFICULTIES.EXPERT));
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame(this.difficulty));

        const container = document.getElementById('board-container');
        container.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                this.handleCellClick(index);
            }
        });

        // Initial game
        this.newGame(DIFFICULTIES.BEGINNER);
    }

    /**
     * Reset the board and UI for a new game
     */
    newGame(difficulty) {
        this.difficulty = difficulty;
        this.board = new Board(difficulty);
        this.state = GAME_STATES.NOT_STARTED;
        
        // Update HUD (basic mine count for now)
        document.getElementById('mine-count-display').textContent = String(this.difficulty.mines).padStart(3, '0');
        document.getElementById('timer-display').textContent = '000';
        document.getElementById('restart-btn').textContent = '😊';
        this.updateStatusUI('');

        this.render();
    }

    /**
     * Update game status display message
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
     * Generate the grid in the DOM
     */
    render() {
        const container = document.getElementById('board-container');
        container.innerHTML = '';
        
        // Update CSS variables for grid dimensions
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
     * Handle left-click reveal
     */
    handleCellClick(index) {
        // Prevent clicks if game ended
        if (this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST) return;

        const cell = this.board.grid[index];

        // Redundant click check
        if (cell.isRevealed || cell.isFlagged) return;

        // First click safety: place mines after first click
        if (this.state === GAME_STATES.NOT_STARTED) {
            this.board.placeMines(index);
            this.state = GAME_STATES.IN_PROGRESS;
            this.board.debug(); // For verification
        }

        this.revealCell(index);
    }

    /**
     * Mark cell as revealed and update UI
     */
    revealCell(index) {
        const cell = this.board.grid[index];
        cell.isRevealed = true;
        this.updateCellUI(index);

        if (cell.isMine) {
            this.handleLoss(index);
        } else {
            this.checkWinCondition();
        }
    }

    /**
     * Handle loss: reveal all mines and update UI
     */
    handleLoss(triggeredIdx) {
        this.state = GAME_STATES.LOST;
        document.getElementById('restart-btn').textContent = '😵';
        this.updateStatusUI('GAME OVER');

        // Reveal all other mines
        this.board.grid.forEach((cell, idx) => {
            if (cell.isMine && !cell.isRevealed) {
                cell.isRevealed = true;
                this.updateCellUI(idx);
            }
        });
    }

    /**
     * Check if all non-mine cells are revealed
     */
    checkWinCondition() {
        const totalNonMines = this.board.grid.length - this.board.mineCount;
        const revealedNonMines = this.board.grid.filter(c => c.isRevealed && !c.isMine).length;

        if (revealedNonMines === totalNonMines) {
            this.handleWin();
        }
    }

    /**
     * Handle win: update UI
     */
    handleWin() {
        this.state = GAME_STATES.WON;
        document.getElementById('restart-btn').textContent = '😎';
        this.updateStatusUI('YOU WIN!');
    }

    /**
     * Update a single cell's visual state
     */
    updateCellUI(index) {
        const cell = this.board.grid[index];
        const container = document.getElementById('board-container');
        const cellDiv = container.querySelector(`[data-index="${index}"]`);

        if (!cellDiv) return;

        if (cell.isRevealed) {
            cellDiv.classList.add('revealed');
            
            if (cell.isMine) {
                cellDiv.classList.add('mine');
                cellDiv.textContent = '💣';
            } else if (cell.neighborMines > 0) {
                cellDiv.textContent = cell.neighborMines;
                cellDiv.classList.add(`n${cell.neighborMines}`);
            }
        }
    }
}

// Start the game engine
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
