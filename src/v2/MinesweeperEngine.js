import { V2_CONFIG } from './config';

/**
 * UI-agnostic Minesweeper Engine
 */

export const GAME_STATES = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    WON: 'WON',
    LOST: 'LOST'
};

export const DIFFICULTIES = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 16, cols: 30, mines: 99 }
};

export class Cell {
    constructor() {
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.isQuestionMarked = false;
        this.neighborMines = 0;
    }
}

export class MinesweeperEngine {
    constructor(difficultyKey = 'BEGINNER') {
        this.difficultyKey = difficultyKey;  // #1: expose key for UIScene "Play Again"
        this.difficulty = DIFFICULTIES[difficultyKey];
        this.rows = this.difficulty.rows;
        this.cols = this.difficulty.cols;
        this.mineCount = this.difficulty.mines;

        this.grid = [];
        this.state = GAME_STATES.NOT_STARTED;
        this.triggeredMineIndex = V2_CONFIG.ENGINE.EXCLUDE_DEFAULT;

        this.init();
    }

    init() {
        this.grid = Array.from({ length: this.rows * this.cols }, () => new Cell());
    }

    placeMines(excludeIndex = V2_CONFIG.ENGINE.EXCLUDE_DEFAULT) {
        // #20: guard against impossible mine counts
        if (this.mineCount >= this.grid.length) {
            throw new Error(`Cannot place ${this.mineCount} mines in a grid of ${this.grid.length} cells.`);
        }

        let placedMines = 0;
        while (placedMines < this.mineCount) {
            const randomIndex = Math.floor(Math.random() * this.grid.length);

            if (randomIndex !== excludeIndex && !this.grid[randomIndex].isMine) {
                this.grid[randomIndex].isMine = true;
                placedMines++;
            }
        }
        this.calculateAdjacency();
        this.state = GAME_STATES.IN_PROGRESS;
    }

    calculateAdjacency() {
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i].isMine) continue;

            const neighbors = this.getNeighborsByIndex(i);
            this.grid[i].neighborMines = neighbors.filter(idx => this.grid[idx].isMine).length;
        }
    }

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

    revealCell(startIndex) {
        // #20: guard against out-of-bounds index
        if (startIndex < 0 || startIndex >= this.grid.length) return [];

        if (this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST) return [];

        if (this.state === GAME_STATES.NOT_STARTED) {
            this.placeMines(startIndex);
        }

        const cell = this.grid[startIndex];
        if (cell.isRevealed || cell.isFlagged) return [];

        const revealedIndices = [];
        const stack = [startIndex];
        const processed = new Set();

        while (stack.length > 0) {
            const index = stack.pop();
            const currentCell = this.grid[index];

            if (currentCell.isRevealed || currentCell.isFlagged || processed.has(index)) continue;

            currentCell.isRevealed = true;
            revealedIndices.push(index);
            processed.add(index);

            if (currentCell.isMine) {
                this.state = GAME_STATES.LOST;
                this.triggeredMineIndex = index;
                return revealedIndices;
            }

            if (currentCell.neighborMines === 0) {
                const neighbors = this.getNeighborsByIndex(index);
                for (const neighborIdx of neighbors) {
                    if (!this.grid[neighborIdx].isRevealed) {
                        stack.push(neighborIdx);
                    }
                }
            }
        }

        this.checkWinCondition();
        return revealedIndices;
    }

    toggleMark(index) {
        if (this.state === GAME_STATES.WON || this.state === GAME_STATES.LOST) return;

        const cell = this.grid[index];
        if (cell.isRevealed) return;

        if (!cell.isFlagged && !cell.isQuestionMarked) {
            cell.isFlagged = true;
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.isQuestionMarked = true;
        } else {
            cell.isQuestionMarked = false;
        }
    }

    checkWinCondition() {
        const totalNonMines = this.grid.length - this.mineCount;
        const revealedNonMines = this.grid.filter(c => c.isRevealed && !c.isMine).length;

        if (revealedNonMines === totalNonMines) {
            this.state = GAME_STATES.WON;
            // Auto-flag remaining mines
            this.grid.forEach(c => {
                if (c.isMine) c.isFlagged = true;
            });
        }
    }

    getRemainingMines() {
        const flaggedCount = this.grid.filter(c => c.isFlagged).length;
        return this.mineCount - flaggedCount;
    }
}
