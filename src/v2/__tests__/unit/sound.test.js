import { describe, it, expect, beforeEach, vi } from 'vitest';

// Control the ctx.state returned by each new MockAudioContext
let nextCtxState = 'running';
const instances = [];

class MockAudioContext {
    constructor() {
        this.state = nextCtxState;
        this.currentTime = 0;
        this.destination = {};
        this.resume = vi.fn();
        this.createOscillator = vi.fn(() => ({
            type: '',
            frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 },
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn()
        }));
        this.createGain = vi.fn(() => ({
            gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
            connect: vi.fn()
        }));
        instances.push(this);
    }
}

vi.stubGlobal('AudioContext', MockAudioContext);

const { SoundManager } = await import('../../utils/SoundManager.js');

describe('SoundManager', () => {
    let manager;

    beforeEach(() => {
        instances.length = 0;
        nextCtxState = 'running';
        manager = new SoundManager();
    });

    it('should not create AudioContext at construction time', () => {
        expect(instances.length).toBe(0);
    });

    it('should create AudioContext on first play call', () => {
        manager.playReveal();
        expect(instances.length).toBe(1);
    });

    it('should reuse the same AudioContext across multiple play calls', () => {
        manager.playReveal();
        manager.playFlag();
        expect(instances.length).toBe(1);
    });

    it('should call resume() when AudioContext is suspended', () => {
        nextCtxState = 'suspended';
        manager.playReveal();
        expect(instances[0].resume).toHaveBeenCalled();
    });

    it('should not create oscillator when disabled', () => {
        // Context is still created lazily, but no oscillator should be produced
        manager.enabled = false;
        manager.playReveal();
        // _ensureContext() runs but playReveal() bails before createOscillator
        expect(instances.length).toBe(1);
        expect(instances[0].createOscillator).not.toHaveBeenCalled();
    });

    it('should throttle rapid reveal sounds', () => {
        manager.playReveal();
        manager.playReveal(); // within throttle window — no new oscillator
        expect(instances[0].createOscillator).toHaveBeenCalledTimes(1);
    });

    it('should play flag sound without throttling', () => {
        manager.playFlag();
        manager.playFlag();
        expect(instances[0].createOscillator).toHaveBeenCalledTimes(2);
    });

    it('should play win sound for each note in the sequence', () => {
        manager.playWin();
        // V2_CONFIG.SOUNDS.WIN.NOTES has 4 notes — one oscillator per note
        expect(instances[0].createOscillator).toHaveBeenCalledTimes(4);
    });

    it('should play loss sound with one oscillator', () => {
        manager.playLoss();
        expect(instances[0].createOscillator).toHaveBeenCalledTimes(1);
    });

    it('should disable itself gracefully if AudioContext construction throws', () => {
        vi.stubGlobal('AudioContext', () => { throw new Error('not supported'); });
        const m = new SoundManager();
        expect(() => m.playReveal()).not.toThrow();
        expect(m.enabled).toBe(false);
        // Restore mock for subsequent tests
        vi.stubGlobal('AudioContext', MockAudioContext);
    });
});
