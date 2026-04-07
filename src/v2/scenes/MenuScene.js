import Phaser from 'phaser';
import { themeManager } from '../utils/ThemeManager';
import { V2_CONFIG } from '../config';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.cameras.main;
        const { UI } = V2_CONFIG;
        const theme = themeManager.getTheme();

        this.add.text(width / 2, height / UI.MENU.TITLE_Y_DIV, 'PXL SWEEPER V2', {
            fontSize: '48px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE
        }).setOrigin(0.5);

        const createButton = (y, label, callback, color = UI.COLORS.BTN_BLUE) => {
            const btn = this.add.text(width / 2, y, label, {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: color,
                backgroundColor: UI.COLORS.BTN_BG,
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);

            btn.on('pointerover', () => btn.setStyle({ backgroundColor: UI.COLORS.BTN_HOVER }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: UI.COLORS.BTN_BG }));
            
            return btn;
        };

        const baseHeight = height * UI.MENU.BTN_START_Y_PCT;
        const spacing = UI.MENU.BTN_SPACING;
        
        createButton(baseHeight, 'BEGINNER', () => this.scene.start('GameScene', { difficulty: 'BEGINNER' }));
        createButton(baseHeight + spacing, 'INTERMEDIATE', () => this.scene.start('GameScene', { difficulty: 'INTERMEDIATE' }));
        createButton(baseHeight + spacing * 2, 'EXPERT', () => this.scene.start('GameScene', { difficulty: 'EXPERT' }));

        // Tutorial Button
        createButton(baseHeight + spacing * 3.3, 'TUTORIAL', () => this.showTutorial(), UI.COLORS.WIN);

        // Theme Toggle Button
        const themeBtn = createButton(height - UI.MENU.THEME_BTN_OFFSET_Y, `THEME: ${theme.name}`, () => {
            const newTheme = theme.name === 'Classic' ? 'DARK' : 'CLASSIC';
            themeManager.setTheme(newTheme);
            this.scene.restart();
        }, UI.COLORS.BTN_GREY);
        themeBtn.setFontSize('16px');
    }

    showTutorial() {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.add.container(0, 0);
        const dimmer = this.add.rectangle(0, 0, width, height, 0x000000, UI.MODAL.DIMMER_ALPHA).setOrigin(0).setInteractive();
        
        const modal = this.add.rectangle(width / 2, height / 2, UI.MODAL.TUTORIAL_WIDTH, UI.MODAL.TUTORIAL_HEIGHT, UI.MODAL.BG).setOrigin(0.5);
        const title = this.add.text(width / 2, height / 2 - UI.MODAL.TITLE_OFFSET_Y, 'HOW TO PLAY', {
            fontSize: '32px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE
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

        const closeBtn = this.add.text(width / 2, height / 2 + UI.MODAL.CLOSE_BTN_OFFSET_Y, 'GOT IT!', {
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
}
