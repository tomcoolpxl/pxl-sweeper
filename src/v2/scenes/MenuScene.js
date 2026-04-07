import Phaser from 'phaser';
import { themeManager } from '../utils/ThemeManager';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.cameras.main;
        const theme = themeManager.getTheme();

        this.add.text(width / 2, height / 4, 'PXL SWEEPER V2', {
            fontSize: '48px',
            fontFamily: 'monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const createButton = (y, label, callback, color = '#3498db') => {
            const btn = this.add.text(width / 2, y, label, {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: color,
                backgroundColor: '#ecf0f1',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);

            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#bdc3c7' }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#ecf0f1' }));
            
            return btn;
        };

        createButton(height * 0.45, 'BEGINNER', () => this.scene.start('GameScene', { difficulty: 'BEGINNER' }));
        createButton(height * 0.45 + 60, 'INTERMEDIATE', () => this.scene.start('GameScene', { difficulty: 'INTERMEDIATE' }));
        createButton(height * 0.45 + 120, 'EXPERT', () => this.scene.start('GameScene', { difficulty: 'EXPERT' }));

        // Tutorial Button
        createButton(height * 0.45 + 200, 'TUTORIAL', () => this.showTutorial(), '#27ae60');

        // Theme Toggle Button
        const themeBtn = createButton(height - 50, `THEME: ${theme.name}`, () => {
            const newTheme = theme.name === 'Classic' ? 'DARK' : 'CLASSIC';
            themeManager.setTheme(newTheme);
            this.scene.restart();
        }, '#7f8c8d');
        themeBtn.setFontSize('16px');
    }

    showTutorial() {
        const { width, height } = this.scale;
        const overlay = this.add.container(0, 0);
        const dimmer = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setInteractive();
        
        const modal = this.add.rectangle(width / 2, height / 2, 500, 350, 0x34495e).setOrigin(0.5);
        const title = this.add.text(width / 2, height / 2 - 140, 'HOW TO PLAY', {
            fontSize: '32px',
            fontFamily: 'monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const steps = [
            '1. LEFT CLICK to reveal a tile.',
            '2. NUMBERS show how many mines are adjacent.',
            '3. RIGHT CLICK or LONG PRESS to FLAG a mine.',
            '4. REVEAL all non-mine tiles to WIN!',
            '5. Don\'t click the bombs! 💣'
        ];

        const content = this.add.text(width / 2, height / 2, steps.join('\n\n'), {
            fontSize: '18px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(width / 2, height / 2 + 130, 'GOT IT!', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#e67e22',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => overlay.destroy());

        overlay.add([dimmer, modal, title, content, closeBtn]);
    }
}
