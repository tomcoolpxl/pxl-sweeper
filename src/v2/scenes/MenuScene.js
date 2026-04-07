import Phaser from 'phaser';
import { highscoreManager } from '../utils/HighscoreManager';
import { V2_CONFIG } from '../config';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.cameras.main;
        const { UI } = V2_CONFIG;

        // Group all menu elements in a central container for perfect alignment
        const menuContainer = this.add.container(width / 2, height * UI.MENU.CONTAINER_Y_PCT);

        const title = this.add.text(0, -200, 'PXL SWEEPER V2', {
            fontSize: '56px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const btnStyle = {
            fontSize: '24px',
            fontFamily: 'monospace',
            backgroundColor: UI.COLORS.BTN_BG,
            padding: { x: 30, y: 12 }
        };

        const createBtn = (y, label, callback, color) => {
            const btn = this.add.text(0, y, label, { ...btnStyle, fill: color })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', callback);
            
            btn.on('pointerover', () => btn.setStyle({ backgroundColor: UI.COLORS.BTN_HOVER }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: UI.COLORS.BTN_BG }));
            
            menuContainer.add(btn);
            return btn;
        };

        const spacing = 65;
        const startY = -70;

        createBtn(startY, 'BEGINNER', () => this.scene.start('GameScene', { difficulty: 'BEGINNER' }), UI.COLORS.BTN_BLUE);
        createBtn(startY + spacing, 'INTERMEDIATE', () => this.scene.start('GameScene', { difficulty: 'INTERMEDIATE' }), UI.COLORS.BTN_BLUE);
        createBtn(startY + spacing * 2, 'EXPERT', () => this.scene.start('GameScene', { difficulty: 'EXPERT' }), UI.COLORS.BTN_BLUE);
        createBtn(startY + spacing * 3.3, '🏆 HIGHSCORES', () => this.showHighscores(), UI.COLORS.BTN_ORANGE);
        createBtn(startY + spacing * 4.3, '❓ HOW TO PLAY', () => this.showTutorial(), UI.COLORS.WIN);

        menuContainer.add(title);
    }

    showTutorial() {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.add.container(0, 0);
        const dimmer = this.add.rectangle(0, 0, width, height, UI.COLORS.BLACK, UI.MODAL.DIMMER_ALPHA).setOrigin(0).setInteractive();
        
        const modal = this.add.rectangle(width / 2, height / 2, UI.MODAL.TUTORIAL_WIDTH, UI.MODAL.TUTORIAL_HEIGHT, UI.MODAL.BG).setOrigin(0.5);
        const title = this.add.text(width / 2, height / 2 - 140, 'HOW TO PLAY', {
            fontSize: '32px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE,
            fontWeight: 'bold'
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
            fill: UI.COLORS.WHITE,
            align: 'center'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(width / 2, height / 2 + 130, 'GOT IT!', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.BTN_ORANGE,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => overlay.destroy());

        overlay.add([dimmer, modal, title, content, closeBtn]);
    }

    showHighscores() {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.add.container(0, 0);
        const dimmer = this.add.rectangle(0, 0, width, height, UI.COLORS.BLACK, UI.MODAL.DIMMER_ALPHA).setOrigin(0).setInteractive();
        
        const modal = this.add.rectangle(width / 2, height / 2, 400, 350, UI.MODAL.BG).setOrigin(0.5);
        const title = this.add.text(width / 2, height / 2 - 120, 'FASTEST TIMES', {
            fontSize: '32px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const scores = highscoreManager.getScores();
        const scoreText = [
            `BEGINNER: ${scores.BEGINNER ? scores.BEGINNER + 's' : '---'}`,
            `INTERMEDIATE: ${scores.INTERMEDIATE ? scores.INTERMEDIATE + 's' : '---'}`,
            `EXPERT: ${scores.EXPERT ? scores.EXPERT + 's' : '---'}`
        ].join('\n\n');

        const content = this.add.text(width / 2, height / 2 - 10, scoreText, {
            fontSize: '22px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE,
            align: 'center'
        }).setOrigin(0.5);

        const clearBtn = this.add.text(width / 2, height / 2 + 80, 'CLEAR ALL', {
            fontSize: '16px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.LOSS,
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (confirm('Clear all scores?')) {
                    highscoreManager.clearScores();
                    overlay.destroy();
                    this.showHighscores();
                }
            });

        const closeBtn = this.add.text(width / 2, height / 2 + 130, 'CLOSE', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.BTN_BLUE,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => overlay.destroy());

        overlay.add([dimmer, modal, title, content, clearBtn, closeBtn]);
    }
}
