import { describe, it, expect, beforeEach, vi } from 'vitest';

// Control the ctx.state returned by each new MockAudioContext
let nextCtxState = 'running';
const instances = [];
const audioInstances = [];

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

class MockAudio {
    constructor(src) {
        this.src = src;
        this.loop = false;
        this.preload = '';
        this.volume = 1;
        this.paused = true;
        this.ended = false;
        this.play = vi.fn(() => {
            this.paused = false;
            return Promise.resolve();
        });
        this.pause = vi.fn(() => {
            this.paused = true;
        });
        audioInstances.push(this);
    }
}

vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('Audio', MockAudio);

const { SoundManager } = await import('../../utils/SoundManager.js');

describe('SoundManager', () => {
    let manager;

    beforeEach(() => {
        instances.length = 0;
        audioInstances.length = 0;
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

    it('should create and play looping background music when activated', () => {
        manager.setBackgroundTrack('/assets/ambient.ogg');

        manager.activateMusic();

        expect(audioInstances).toHaveLength(1);
        expect(audioInstances[0].src).toBe('/assets/ambient.ogg');
        expect(audioInstances[0].loop).toBe(true);
        expect(audioInstances[0].preload).toBe('auto');
        expect(audioInstances[0].volume).toBe(0.32);
        expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    });

    it('should not restart background music while it is already playing', () => {
        manager.setBackgroundTrack('/assets/ambient.ogg');

        manager.activateMusic();
        manager.activateMusic();

        expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    });

    it('should pause and resume background music when toggled', () => {
        manager.setBackgroundTrack('/assets/ambient.ogg');
        manager.activateMusic();

        expect(manager.toggleEnabled()).toBe(false);
        expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);

        expect(manager.toggleEnabled()).toBe(true);
        expect(audioInstances[0].play).toHaveBeenCalledTimes(2);
    });
});
