import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // HUD logic
        this.add.text(this.cameras.main.width - 10, 10, 'Timer: 000', { 
            fontSize: '24px', 
            fill: '#e74c3c',
            fontFamily: 'monospace' 
        }).setOrigin(1, 0);
    }
}
