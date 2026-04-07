const STORAGE_KEY = 'pxl_sweeper_scores';

class HighscoreManager {
    constructor() {
        this.scores = this.loadScores();
    }

    loadScores() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { BEGINNER: null, INTERMEDIATE: null, EXPERT: null };
    }

    saveScores() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
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
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const highscoreManager = new HighscoreManager();
