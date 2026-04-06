import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load tiny assets for the preloader (logo, loading bar frame) here
    }

    create() {
        this.scene.start('PreloadScene');
    }
}
