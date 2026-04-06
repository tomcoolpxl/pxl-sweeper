import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, height / 3, 'PXL SWEEPER V2', {
            fontSize: '48px',
            fontFamily: 'monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const createButton = (y, label, difficulty) => {
            const btn = this.add.text(width / 2, y, label, {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: '#3498db',
                backgroundColor: '#ecf0f1',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('GameScene', { difficulty }));

            btn.on('pointerover', () => btn.setStyle({ fill: '#2980b9' }));
            btn.on('pointerout', () => btn.setStyle({ fill: '#3498db' }));
        };

        createButton(height / 2, 'BEGINNER', 'BEGINNER');
        createButton(height / 2 + 60, 'INTERMEDIATE', 'INTERMEDIATE');
        createButton(height / 2 + 120, 'EXPERT', 'EXPERT');
    }
}
