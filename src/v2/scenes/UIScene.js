import Phaser from 'phaser';
import { themeManager } from '../utils/ThemeManager';
import { V2_CONFIG } from '../config';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        this.engine = data.engine;
        this.secondsElapsed = 0;
        this.theme = themeManager.getTheme();
    }

    create() {
        const { width, height } = this.scale;
        const { UI, LAYOUT } = V2_CONFIG;

        // UI Container
        this.uiContainer = this.add.container(0, 0);

        // Mine Counter (Top Left)
        this.mineText = this.add.text(LAYOUT.UI_PADDING, LAYOUT.UI_PADDING, `Mines: ${this.engine.getRemainingMines()}`, {
            fontSize: '24px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace'
        });

        // Timer (Top Right)
        this.timerText = this.add.text(width - LAYOUT.UI_PADDING, LAYOUT.UI_PADDING, 'Time: 000', {
            fontSize: '24px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace'
        }).setOrigin(1, 0);

        // Menu Button (Top Center)
        this.restartBtn = this.add.text(width / 2, LAYOUT.UI_PADDING, '🏠 MENU', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.MENU_BG,
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });

        // Game Over Overlay (Hidden initially)
        this.overlay = this.add.container(0, 0).setVisible(false);
        const dimmer = this.add.rectangle(0, 0, width, height, UI.COLORS.DIMMER, UI.MODAL.DIMMER_ALPHA).setOrigin(0);
        const modal = this.add.rectangle(width / 2, height / 2, UI.MODAL.WIDTH, UI.MODAL.HEIGHT, UI.MODAL.BG).setOrigin(0.5);
        
        this.statusText = this.add.text(width / 2, height / 2 - UI.MODAL.STATUS_OFFSET_Y, '', {
            fontSize: '32px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.statsText = this.add.text(width / 2, height / 2 - UI.MODAL.STATS_OFFSET_Y, '', {
            fontSize: '18px',
            fill: UI.COLORS.WHITE,
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const playAgainBtn = this.add.text(width / 2, height / 2 + UI.MODAL.PLAY_AGAIN_OFFSET_Y, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.WIN,
            padding: { x: 15, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.start('GameScene', { difficulty: this.engine.difficultyKey });
        });

        const mainMenuBtn = this.add.text(width / 2, height / 2 + UI.MODAL.MAIN_MENU_OFFSET_Y, 'MAIN MENU', {
            fontSize: '18px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.BTN_BLUE,
            padding: { x: 15, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });

        this.overlay.add([dimmer, modal, this.statusText, this.statsText, playAgainBtn, mainMenuBtn]);

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        
        gameScene.events.on('update-mines', (count) => {
            this.mineText.setText(`Mines: ${count}`);
            this.updateA11y(`Mines remaining: ${count}`);
        });

        gameScene.events.on('game-won', () => {
            this.showGameOver(true);
            this.updateA11y('You win! Game over.');
        });

        gameScene.events.on('game-lost', () => {
            this.showGameOver(false);
            this.updateA11y('You hit a mine. Game over.');
        });

        gameScene.events.once('update-mines', () => {
            this.startTimer();
            this.updateA11y('Game started.');
        });

        // Handle Resize
        this.scale.on('resize', this.handleResize, this);
        this.updateA11y(`Minesweeper loaded. ${this.engine.getRemainingMines()} mines.`);
    }

    updateA11y(message) {
        const hud = document.getElementById(V2_CONFIG.A11Y.HUD_ID);
        if (hud) {
            hud.textContent = message;
        }
    }

    handleResize(gameSize) {
        const { width, height } = gameSize;
        const { LAYOUT, UI } = V2_CONFIG;
        this.cameras.main.setViewport(0, 0, width, height);

        this.mineText.setPosition(LAYOUT.UI_PADDING, LAYOUT.UI_PADDING);
        this.timerText.setPosition(width - LAYOUT.UI_PADDING, LAYOUT.UI_PADDING);
        this.restartBtn.setPosition(width / 2, LAYOUT.UI_PADDING);

        // Update Overlay
        const dimmer = this.overlay.list[0];
        const modal = this.overlay.list[1];
        const playAgainBtn = this.overlay.list[4];
        const mainMenuBtn = this.overlay.list[5];

        dimmer.setSize(width, height);
        modal.setPosition(width / 2, height / 2);
        this.statusText.setPosition(width / 2, height / 2 - UI.MODAL.STATUS_OFFSET_Y);
        this.statsText.setPosition(width / 2, height / 2 - UI.MODAL.STATS_OFFSET_Y);
        playAgainBtn.setPosition(width / 2, height / 2 + UI.MODAL.PLAY_AGAIN_OFFSET_Y);
        mainMenuBtn.setPosition(width / 2, height / 2 + UI.MODAL.MAIN_MENU_OFFSET_Y);
    }

    showGameOver(won) {
        const { UI, TIMERS } = V2_CONFIG;
        this.stopTimer();
        this.statusText.setText(won ? 'YOU WIN! 😎' : 'GAME OVER 😵');
        this.statusText.setColor(won ? UI.COLORS.WIN : UI.COLORS.LOSS);
        this.statsText.setText(`Time: ${this.secondsElapsed}s\nMines: ${this.engine.mineCount}`);
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
