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

        // #13: accept a name for stable e2e test access via scene property
        const createBtn = (y, label, callback, color, name) => {
            const btn = this.add.text(0, y, label, { ...btnStyle, fill: color })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', callback);

            btn.on('pointerover', () => btn.setStyle({ backgroundColor: UI.COLORS.BTN_HOVER }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: UI.COLORS.BTN_BG }));

            menuContainer.add(btn);
            // #13: expose as scene property for e2e tests
            if (name) this[name] = btn;
            return btn;
        };

        // #12: use BTN_SPACING from config instead of a local magic-number variable
        const { BTN_SPACING } = UI.MENU;
        const startY = -70;

        createBtn(startY, 'BEGINNER', () => this.scene.start('GameScene', { difficulty: 'BEGINNER' }), UI.COLORS.BTN_BLUE, 'beginnerBtn');
        createBtn(startY + BTN_SPACING, 'INTERMEDIATE', () => this.scene.start('GameScene', { difficulty: 'INTERMEDIATE' }), UI.COLORS.BTN_BLUE, 'intermediateBtn');
        createBtn(startY + BTN_SPACING * 2, 'EXPERT', () => this.scene.start('GameScene', { difficulty: 'EXPERT' }), UI.COLORS.BTN_BLUE, 'expertBtn');
        createBtn(startY + BTN_SPACING * 3.3, '🏆 HIGHSCORES', () => this.showHighscores(), UI.COLORS.BTN_ORANGE);
        createBtn(startY + BTN_SPACING * 4.3, '❓ HOW TO PLAY', () => this.showTutorial(), UI.COLORS.WIN);

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
            '1. LEFT CLICK or ENTER to reveal a tile.',
            '2. NUMBERS show how many mines are adjacent.',
            '3. RIGHT CLICK, LONG PRESS, or SPACE to FLAG.',
            '4. Arrow keys navigate the board.',
            '5. REVEAL all non-mine tiles to WIN! 💣'
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
        const fmt = (v) => v !== null ? String(v).padStart(3, '0') + 's' : '---';
        const scoreText = [
            `BEGINNER:     ${fmt(scores.BEGINNER)}`,
            `INTERMEDIATE: ${fmt(scores.INTERMEDIATE)}`,
            `EXPERT:       ${fmt(scores.EXPERT)}`
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
                // #8: replace blocking confirm() with in-game confirmation modal
                this.showConfirm('Clear all scores?', () => {
                    highscoreManager.clearScores();
                    overlay.destroy();
                    this.showHighscores();
                });
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

    // #8: in-game confirmation modal — replaces blocking window.confirm()
    showConfirm(message, onConfirm) {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.add.container(0, 0);

        const dimmer = this.add.rectangle(0, 0, width, height, UI.COLORS.BLACK, 0.7)
            .setOrigin(0)
            .setInteractive();

        const modal = this.add.rectangle(width / 2, height / 2, 360, 180, UI.MODAL.BG).setOrigin(0.5);

        const text = this.add.text(width / 2, height / 2 - 40, message, {
            fontSize: '20px',
            fontFamily: 'monospace',
            fill: UI.COLORS.WHITE,
            align: 'center'
        }).setOrigin(0.5);

        const yesBtn = this.add.text(width / 2 - 70, height / 2 + 30, 'YES', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.LOSS,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                overlay.destroy();
                onConfirm();
            });

        const noBtn = this.add.text(width / 2 + 70, height / 2 + 30, 'NO', {
            fontSize: '20px',
            fill: UI.COLORS.WHITE,
            backgroundColor: UI.COLORS.BTN_BLUE,
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => overlay.destroy());

        overlay.add([dimmer, modal, text, yesBtn, noBtn]);
    }
}
