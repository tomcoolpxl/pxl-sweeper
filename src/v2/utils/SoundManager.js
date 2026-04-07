import { V2_CONFIG } from '../config';

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.lastRevealTime = 0;
    }

    playReveal() {
        if (!this.enabled || !this.ctx) return;
        
        const { SOUNDS, TIMERS } = V2_CONFIG;
        const now = Date.now();
        if (now - this.lastRevealTime < TIMERS.THROTTLE_REVEAL_SFX_MS) return;
        this.lastRevealTime = now;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(SOUNDS.REVEAL.FREQ_START, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(SOUNDS.REVEAL.FREQ_END, this.ctx.currentTime + SOUNDS.REVEAL.DURATION);

        gain.gain.setValueAtTime(SOUNDS.REVEAL.GAIN, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + SOUNDS.REVEAL.DURATION);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + SOUNDS.REVEAL.DURATION);
    }

    playFlag() {
        if (!this.enabled || !this.ctx) return;

        const { SOUNDS } = V2_CONFIG;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(SOUNDS.FLAG.FREQ_START, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(SOUNDS.FLAG.FREQ_END, this.ctx.currentTime + SOUNDS.FLAG.DURATION);

        gain.gain.setValueAtTime(SOUNDS.FLAG.GAIN, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + SOUNDS.FLAG.DURATION);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + SOUNDS.FLAG.DURATION);
    }

    playWin() {
        if (!this.enabled || !this.ctx) return;

        const { SOUNDS } = V2_CONFIG;
        SOUNDS.WIN.NOTES.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const time = this.ctx.currentTime + i * SOUNDS.WIN.SPACING;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(SOUNDS.WIN.GAIN, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, time + SOUNDS.WIN.DURATION);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + SOUNDS.WIN.DURATION);
        });
    }

    playLoss() {
        if (!this.enabled || !this.ctx) return;

        const { SOUNDS } = V2_CONFIG;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(SOUNDS.LOSS.FREQ_START, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(SOUNDS.LOSS.FREQ_END, this.ctx.currentTime + SOUNDS.LOSS.DURATION);

        gain.gain.setValueAtTime(SOUNDS.LOSS.GAIN, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + SOUNDS.LOSS.DURATION);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + SOUNDS.LOSS.DURATION);
    }
}

export const soundManager = new SoundManager();
