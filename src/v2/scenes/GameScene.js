import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.difficultyKey = data.difficulty || 'BEGINNER';
    }

    create() {
        // Core game logic will go here
        this.add.text(10, 10, `Game Scene - ${this.difficultyKey}`, { fill: '#00ff00' });
        
        // Launch UI Scene in parallel
        this.scene.launch('UIScene');
    }
}
