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

        // UI Container
        this.uiContainer = this.add.container(0, 0);

        // Mine Counter (Top Left)
        this.mineText = this.add.text(20, 20, `Mines: ${this.engine.getRemainingMines()}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        });

        // Timer (Top Right)
        this.timerText = this.add.text(width - 20, 20, 'Time: 000', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(1, 0);

        // Menu Button (Top Center)
        this.restartBtn = this.add.text(width / 2, 20, '🏠 MENU', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#34495e',
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
        const dimmer = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);
        const modal = this.add.rectangle(width / 2, height / 2, 300, 200, 0x34495e).setOrigin(0.5);
        this.statusText = this.add.text(width / 2, height / 2 - 40, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.statsText = this.add.text(width / 2, height / 2, '', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const playAgainBtn = this.add.text(width / 2, height / 2 + 50, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 15, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.start('GameScene', { difficulty: this.engine.difficultyKey });
        });

        this.overlay.add([dimmer, modal, this.statusText, this.statsText, playAgainBtn]);

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
        this.cameras.main.setViewport(0, 0, width, height);

        this.mineText.setPosition(20, 20);
        this.timerText.setPosition(width - 20, 20);
        this.restartBtn.setPosition(width / 2, 20);

        // Update Overlay
        const dimmer = this.overlay.list[0];
        const modal = this.overlay.list[1];
        const playAgainBtn = this.overlay.list[4];

        dimmer.setSize(width, height);
        modal.setPosition(width / 2, height / 2);
        this.statusText.setPosition(width / 2, height / 2 - 40);
        this.statsText.setPosition(width / 2, height / 2);
        playAgainBtn.setPosition(width / 2, height / 2 + 50);
    }

    showGameOver(won) {
        this.stopTimer();
        this.statusText.setText(won ? 'YOU WIN! 😎' : 'GAME OVER 😵');
        this.statusText.setColor(won ? '#27ae60' : '#e74c3c');
        this.statsText.setText(`Time: ${this.secondsElapsed}s\nMines: ${this.engine.mines}`);
        this.overlay.setVisible(true);
        this.overlay.setAlpha(0);
        this.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: V2_CONFIG.TIMERS.GAMEOVER_FADE_MS
        });
    }

    startTimer() {
        if (this.timerEvent) return;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
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
