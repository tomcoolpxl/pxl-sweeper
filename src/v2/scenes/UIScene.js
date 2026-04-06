import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        this.engine = data.engine;
        this.secondsElapsed = 0;
    }

    create() {
        const { width } = this.cameras.main;

        // Mine Counter
        this.mineText = this.add.text(20, 20, `Mines: ${this.engine.getRemainingMines()}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        });

        // Timer
        this.timerText = this.add.text(width - 20, 20, 'Time: 000', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(1, 0);

        // Status Text
        this.statusText = this.add.text(width / 2, 80, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Restart Button (Home icon placeholder)
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

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        
        gameScene.events.on('update-mines', (count) => {
            this.mineText.setText(`Mines: ${count}`);
        });

        gameScene.events.on('game-won', () => {
            this.statusText.setText('YOU WIN! 😎');
            this.statusText.setColor('#27ae60');
            this.stopTimer();
        });

        gameScene.events.on('game-lost', () => {
            this.statusText.setText('GAME OVER 😵');
            this.statusText.setColor('#e74c3c');
            this.stopTimer();
        });

        // Start Timer on first reveal
        gameScene.events.once('update-mines', () => {
            this.startTimer();
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
