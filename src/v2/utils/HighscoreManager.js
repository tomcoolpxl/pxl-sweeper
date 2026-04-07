const STORAGE_KEY = 'pxl_sweeper_scores';

export class HighscoreManager {
    constructor() {
        this._scores = null;  // #2: lazy init — do not access localStorage at import time
    }

    get scores() {
        if (this._scores === null) {
            this._scores = this.loadScores();
        }
        return this._scores;
    }

    set scores(value) {
        this._scores = value;
    }

    loadScores() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : { BEGINNER: null, INTERMEDIATE: null, EXPERT: null };
        } catch (_e) {
            return { BEGINNER: null, INTERMEDIATE: null, EXPERT: null };
        }
    }

    saveScores() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        } catch (_e) {
            // localStorage unavailable (private browsing, storage quota, etc.)
        }
    }

    checkScore(difficulty, seconds) {
        const currentBest = this.scores[difficulty];
        if (currentBest === null || seconds < currentBest) {
            this.scores[difficulty] = seconds;
            this.saveScores();
            return true;
        }
        return false;
    }

    getScores() {
        return this.scores;
    }

    clearScores() {
        this.scores = { BEGINNER: null, INTERMEDIATE: null, EXPERT: null };
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_e) {
            // ignore
        }
    }
}

export const highscoreManager = new HighscoreManager();
