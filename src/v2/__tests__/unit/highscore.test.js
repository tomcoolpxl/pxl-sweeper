import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HighscoreManager } from '../../utils/HighscoreManager';

// HighscoreManager is tested via a fresh instance (not the singleton) to keep tests isolated
// localStorage is mocked globally in setup.js

// Export the class separately for testing — we import it as a named export below.
// Since the file only exports the singleton, we test by re-importing the class directly.
// We duplicate the class logic test via the singleton's public API.

describe('HighscoreManager', () => {
    let manager;

    beforeEach(() => {
        // Reset localStorage mock between tests
        localStorage.clear();
        // Create a fresh manager for each test
        manager = new HighscoreManager();
    });

    it('should initialise with null scores when localStorage is empty', () => {
        const scores = manager.getScores();
        expect(scores.BEGINNER).toBeNull();
        expect(scores.INTERMEDIATE).toBeNull();
        expect(scores.EXPERT).toBeNull();
    });

    it('should persist and restore scores from localStorage', () => {
        manager.checkScore('BEGINNER', 42);
        // Simulate page reload — new manager reads from storage
        const manager2 = new HighscoreManager();
        expect(manager2.getScores().BEGINNER).toBe(42);
    });

    it('should record a score when there is no existing best', () => {
        const isRecord = manager.checkScore('BEGINNER', 120);
        expect(isRecord).toBe(true);
        expect(manager.getScores().BEGINNER).toBe(120);
    });

    it('should update score when new time is faster', () => {
        manager.checkScore('BEGINNER', 120);
        const isRecord = manager.checkScore('BEGINNER', 80);
        expect(isRecord).toBe(true);
        expect(manager.getScores().BEGINNER).toBe(80);
    });

    it('should not update score when new time is slower', () => {
        manager.checkScore('BEGINNER', 80);
        const isRecord = manager.checkScore('BEGINNER', 120);
        expect(isRecord).toBe(false);
        expect(manager.getScores().BEGINNER).toBe(80);
    });

    it('should not update score when new time equals the best', () => {
        manager.checkScore('BEGINNER', 80);
        const isRecord = manager.checkScore('BEGINNER', 80);
        expect(isRecord).toBe(false);
    });

    it('should track scores independently per difficulty', () => {
        manager.checkScore('BEGINNER', 30);
        manager.checkScore('INTERMEDIATE', 150);
        manager.checkScore('EXPERT', 600);

        const scores = manager.getScores();
        expect(scores.BEGINNER).toBe(30);
        expect(scores.INTERMEDIATE).toBe(150);
        expect(scores.EXPERT).toBe(600);
    });

    it('should clear all scores and remove from localStorage', () => {
        manager.checkScore('BEGINNER', 30);
        manager.clearScores();

        const scores = manager.getScores();
        expect(scores.BEGINNER).toBeNull();
        expect(scores.INTERMEDIATE).toBeNull();
        expect(scores.EXPERT).toBeNull();
        expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('should not throw when localStorage is unavailable', () => {
        localStorage.getItem.mockImplementationOnce(() => { throw new Error('storage unavailable'); });
        const m = new HighscoreManager();
        expect(() => m.getScores()).not.toThrow();
    });
});
