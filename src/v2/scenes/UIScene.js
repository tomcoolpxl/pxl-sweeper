import Phaser from 'phaser';
import { highscoreManager } from '../utils/HighscoreManager';
import { soundManager } from '../utils/SoundManager';
import { V2_CONFIG } from '../config';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        this.engine = data.engine;
        this.secondsElapsed = 0;
    }

    create() {
        const { width, height } = this.scale;
        const { UI, LAYOUT } = V2_CONFIG;

        this.uiContainer = this.add.container(0, 0);

        // Mine Counter (Top Left)
        this.mineText = this.add.text(LAYOUT.UI_PADDING, LAYOUT.UI_PADDING, `Mines: ${this.engine.getRemainingMines()}`, {
            fontSize: '24px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace',
            fontWeight: 'bold'
        });

        // Timer (Top Right)
        this.timerText = this.add.text(width - LAYOUT.UI_PADDING, LAYOUT.UI_PADDING, 'Time: 000', {
            fontSize: '24px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(1, 0);

        // Menu Button (Top Center)
        this.restartBtn = this.add.text(width / 2, LAYOUT.UI_PADDING, '🏠 MENU', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.MENU_BG,
            padding: { x: 15, y: 8 }
        })
            .setOrigin(0.5, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
            });

        // #18: Mute button (Top Right, before timer)
        this.muteBtn = this.add.text(width - LAYOUT.UI_PADDING, LAYOUT.UI_PADDING + 34, soundManager.enabled ? '🔊' : '🔇', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.MENU_BG,
            padding: { x: 10, y: 6 }
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                soundManager.enabled = !soundManager.enabled;
                this.muteBtn.setText(soundManager.enabled ? '🔊' : '🔇');
            });

        // Game Over Overlay
        this.overlay = this.add.container(0, 0).setVisible(false);

        // #4: store named references — never access by magic list index
        this.dimmerRect = this.add.rectangle(0, 0, width, height, UI.COLORS.BLACK, UI.MODAL.DIMMER_ALPHA)
            .setOrigin(0)
            .setInteractive();

        this.modalRect = this.add.rectangle(width / 2, height / 2, UI.MODAL.WIDTH, 350, UI.MODAL.BG).setOrigin(0.5);

        this.statusText = this.add.text(width / 2, height / 2 - 100, '', {
            fontSize: '42px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.statsText = this.add.text(width / 2, height / 2 - 30, '', {
            fontSize: '22px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5);

        this.playAgainBtn = this.add.text(width / 2, height / 2 + 40, 'PLAY AGAIN', {
            fontSize: '24px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.WIN,
            padding: { x: 25, y: 12 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.cameras.main.fadeOut(250, 0, 0, 0, (camera, progress) => {
                    if (progress === 1) {
                        this.scene.stop('GameScene');
                        // #1: engine.difficultyKey now exists — correct difficulty used
                        this.scene.start('GameScene', { difficulty: this.engine.difficultyKey });
                    }
                });
            });

        this.mainMenuBtn = this.add.text(width / 2, height / 2 + 100, 'MAIN MENU', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.BTN_BLUE,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
            });

        this.reviewBtn = this.add.text(width / 2, height / 2 + 150, 'VIEW BOARD', {
            fontSize: '16px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.BTN_GREY,
            padding: { x: 15, y: 8 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.overlay.setVisible(false);
                this.restartBtn.setVisible(true);
            });

        this.overlay.add([this.dimmerRect, this.modalRect, this.statusText, this.statsText, this.playAgainBtn, this.mainMenuBtn, this.reviewBtn]);

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('update-mines', (count) => {
            this.mineText.setText(`Mines: ${count}`);
            this.updateA11y(`Mines remaining: ${count}`);
        });

        gameScene.events.on('game-won', () => {
            const isNewRecord = highscoreManager.checkScore(this.engine.difficultyKey, this.secondsElapsed);
            this.showGameOver(true, isNewRecord);
            this.updateA11y(isNewRecord ? `New record! ${this.secondsElapsed} seconds.` : 'You win! Game over.');
        });

        gameScene.events.on('game-lost', () => {
            this.showGameOver(false);
            this.updateA11y('You hit a mine. Game over.');
        });

        // #17: relay keyboard focus announcements to screen reader
        gameScene.events.on('update-focus', (message) => {
            this.updateA11y(message);
        });

        gameScene.events.once('update-mines', () => {
            this.startTimer();
            this.updateA11y('Game started.');
        });

        this.scale.on('resize', this.handleResize, this);
        this.updateA11y(`Minesweeper loaded. ${this.engine.getRemainingMines()} mines.`);
    }

    updateA11y(message) {
        const hud = document.getElementById(V2_CONFIG.A11Y.HUD_ID);
        if (hud) {
            hud.textContent = message;
        }
    }

    // #4: use named references — no magic list indices
    handleResize(gameSize) {
        const { width, height } = gameSize;
        const { LAYOUT } = V2_CONFIG;
        this.cameras.main.setViewport(0, 0, width, height);

        this.mineText.setPosition(LAYOUT.UI_PADDING, LAYOUT.UI_PADDING);
        this.timerText.setPosition(width - LAYOUT.UI_PADDING, LAYOUT.UI_PADDING);
        this.restartBtn.setPosition(width / 2, LAYOUT.UI_PADDING);
        this.muteBtn.setPosition(width - LAYOUT.UI_PADDING, LAYOUT.UI_PADDING + 34);

        this.dimmerRect.setSize(width, height);
        this.modalRect.setPosition(width / 2, height / 2);
        this.statusText.setPosition(width / 2, height / 2 - 100);
        this.statsText.setPosition(width / 2, height / 2 - 30);
        this.playAgainBtn.setPosition(width / 2, height / 2 + 40);
        this.mainMenuBtn.setPosition(width / 2, height / 2 + 100);
        this.reviewBtn.setPosition(width / 2, height / 2 + 150);
    }

    showGameOver(won, isNewRecord = false) {
        const { UI, TIMERS } = V2_CONFIG;
        this.stopTimer();

        const scores = highscoreManager.getScores();
        const best = scores[this.engine.difficultyKey];

        let status = won ? 'YOU WIN! 😎' : 'GAME OVER 😵';
        if (isNewRecord) status = 'NEW RECORD! 🏆';

        this.statusText.setText(status);
        this.statusText.setColor(won ? UI.COLORS.WIN : UI.COLORS.LOSS);

        // #19: unified timer format — padded 3 digits with 's' suffix
        const stats = [
            `TIME: ${String(this.secondsElapsed).padStart(3, '0')}s`,
            `BEST: ${best !== null ? String(best).padStart(3, '0') + 's' : '---'}`
        ].join('\n');

        this.statsText.setText(stats);

        this.overlay.setVisible(true);
        this.overlay.setAlpha(0);
        this.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: TIMERS.GAMEOVER_FADE_MS
        });
    }

    startTimer() {
        if (this.timerEvent) return;
        this.timerEvent = this.time.addEvent({
            delay: V2_CONFIG.TIMERS.TIMER_INTERVAL_MS,
            callback: () => {
                this.secondsElapsed++;
                // #19: consistent padded format
                this.timerText.setText(`Time: ${String(this.secondsElapsed).padStart(3, '0')}`);
            },
            loop: true
        });
    }

    stopTimer() {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
    }
}
