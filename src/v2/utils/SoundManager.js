import { V2_CONFIG } from '../config';

export class SoundManager {
    constructor() {
        this.ctx = null;  // #2: lazy init — do not touch AudioContext at import time
        this.enabled = true;
        this.lastRevealTime = 0;
    }

    // #2/#3: initialise context on first use; resume if suspended (Chrome autoplay policy)
    _ensureContext() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (_e) {
                this.enabled = false;
                return null;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    playReveal() {
        const ctx = this._ensureContext();
        if (!this.enabled || !ctx) return;

        const { SOUNDS, TIMERS } = V2_CONFIG;
        const now = Date.now();
        if (now - this.lastRevealTime < TIMERS.THROTTLE_REVEAL_SFX_MS) return;
        this.lastRevealTime = now;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(SOUNDS.REVEAL.FREQ_START, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(SOUNDS.REVEAL.FREQ_END, ctx.currentTime + SOUNDS.REVEAL.DURATION);

        gain.gain.setValueAtTime(SOUNDS.REVEAL.GAIN, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + SOUNDS.REVEAL.DURATION);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + SOUNDS.REVEAL.DURATION);
    }

    playFlag() {
        const ctx = this._ensureContext();
        if (!this.enabled || !ctx) return;

        const { SOUNDS } = V2_CONFIG;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(SOUNDS.FLAG.FREQ_START, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(SOUNDS.FLAG.FREQ_END, ctx.currentTime + SOUNDS.FLAG.DURATION);

        gain.gain.setValueAtTime(SOUNDS.FLAG.GAIN, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + SOUNDS.FLAG.DURATION);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + SOUNDS.FLAG.DURATION);
    }

    playWin() {
        const ctx = this._ensureContext();
        if (!this.enabled || !ctx) return;

        const { SOUNDS } = V2_CONFIG;
        SOUNDS.WIN.NOTES.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const time = ctx.currentTime + i * SOUNDS.WIN.SPACING;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(SOUNDS.WIN.GAIN, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, time + SOUNDS.WIN.DURATION);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + SOUNDS.WIN.DURATION);
        });
    }

    playLoss() {
        const ctx = this._ensureContext();
        if (!this.enabled || !ctx) return;

        const { SOUNDS } = V2_CONFIG;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(SOUNDS.LOSS.FREQ_START, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(SOUNDS.LOSS.FREQ_END, ctx.currentTime + SOUNDS.LOSS.DURATION);

        gain.gain.setValueAtTime(SOUNDS.LOSS.GAIN, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + SOUNDS.LOSS.DURATION);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + SOUNDS.LOSS.DURATION);
    }
}

export const soundManager = new SoundManager();
