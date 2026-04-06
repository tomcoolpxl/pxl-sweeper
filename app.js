// app.js - PXL Sweeper Engine

const DIFFICULTIES = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 30, cols: 16, mines: 99 }
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

// Initial initialization for Phase 2 Verification
console.log("PXL Sweeper: Phase 2 Loaded.");
