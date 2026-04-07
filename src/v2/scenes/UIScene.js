import Phaser from 'phaser';
import { highscoreManager } from '../utils/HighscoreManager';
import { soundManager } from '../utils/SoundManager';
import { V2_CONFIG } from '../config';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        this.engine = data.engine;
        this.secondsElapsed = 0;
    }

    create() {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const hudLayout = this.getHudLayout(width);

        this.uiContainer = this.add.container(0, 0);
        this.createHudChrome(width);

        this.mineText = this.add.text(hudLayout.mine.centerX, hudLayout.mine.centerY, `MINES ${String(this.engine.getRemainingMines()).padStart(3, '0')}`, {
            fontSize: '22px',
            color: UI.COLORS.WHITE,
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif'
        }).setOrigin(0.5);

        this.timerText = this.add.text(hudLayout.timer.centerX, hudLayout.timer.centerY, 'TIME 000', {
            fontSize: '22px',
            color: UI.COLORS.WHITE,
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif'
        }).setOrigin(0.5);

        this.restartBtn = this.createHudButton(hudLayout.menu.centerX, hudLayout.menu.centerY, hudLayout.menu.width, 'MENU', UI.COLORS.ACCENT_CYAN, () => {
            this.returnToMenu();
        });

        this.muteBtn = this.createHudButton(hudLayout.sound.centerX, hudLayout.sound.centerY, hudLayout.sound.width, soundManager.enabled ? 'SOUND ON' : 'SOUND OFF', UI.COLORS.ACCENT_GOLD, () => {
            const enabled = soundManager.toggleEnabled();
            this.muteBtnLabel.setText(enabled ? 'SOUND ON' : 'SOUND OFF');
        });

        // Game Over Overlay
        this.overlay = this.add.container(0, 0).setVisible(false);
        this.createOverlayChrome(width, height);

        this.statusText = this.add.text(width / 2, height / 2 - 94, '', {
            fontSize: '38px',
            color: UI.COLORS.WHITE,
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif'
        }).setOrigin(0.5);

        this.statsText = this.add.text(width / 2, height / 2 - 18, '', {
            fontSize: '21px',
            color: UI.COLORS.MENU_TEXT_SOFT,
            fontFamily: '"Trebuchet MS", sans-serif',
            align: 'center',
            lineSpacing: 2
        }).setOrigin(0.5);

        this.playAgainBtn = this.createModalButton(width / 2, height / 2 + 66, 190, 'PLAY AGAIN', UI.COLORS.ACCENT_GREEN, () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (camera, progress) => {
                if (progress === 1) {
                    this.scene.stop('GameScene');
                    this.scene.stop('UIScene');
                    this.scene.start('GameScene', { difficulty: this.engine.difficultyKey });
                }
            });
        });

        this.mainMenuBtn = this.createModalButton(width / 2, height / 2 + 118, 170, 'MAIN MENU', UI.COLORS.ACCENT_CYAN, () => {
            this.returnToMenu();
        });

        this.reviewBtn = this.createModalButton(width / 2, height / 2 + 174, 150, 'VIEW BOARD', UI.COLORS.ACCENT_GOLD, () => {
            this.overlay.setVisible(false);
            this.restartBtn.setVisible(true);
        });

        this.overlay.add([this.statusText, this.statsText, this.playAgainBtn, this.mainMenuBtn, this.reviewBtn]);
        this.animateHudEntrance();

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('update-mines', (count) => {
            this.mineText.setText(`MINES ${String(count).padStart(3, '0')}`);
            this.updateA11y(`Mines remaining: ${count}`);
        });

        gameScene.events.on('game-won', () => {
            const isNewRecord = highscoreManager.checkScore(this.engine.difficultyKey, this.secondsElapsed);
            this.showGameOver(true, isNewRecord);
            this.updateA11y(isNewRecord ? `New record! ${this.secondsElapsed} seconds.` : 'You win! Game over.');
        });

        gameScene.events.on('game-lost', () => {
            this.showGameOver(false);
            this.updateA11y('You hit a mine. Game over.');
        });

        // #17: relay keyboard focus announcements to screen reader
        gameScene.events.on('update-focus', (message) => {
            this.updateA11y(message);
        });

        gameScene.events.once('update-mines', () => {
            this.startTimer();
            this.updateA11y('Game started.');
        });

        this.scale.on('resize', this.handleResize, this);
        this.updateA11y(`Minesweeper loaded. ${this.engine.getRemainingMines()} mines.`);
    }

    updateA11y(message) {
        const hud = document.getElementById(V2_CONFIG.A11Y.HUD_ID);
        if (hud) {
            hud.textContent = message;
        }
    }

    // #4: use named references — no magic list indices
    handleResize(gameSize) {
        const { width, height } = gameSize;
        const hudLayout = this.getHudLayout(width);
        this.cameras.main.setViewport(0, 0, width, height);

        this.drawHudChrome(width);
        this.mineText.setPosition(hudLayout.mine.centerX, hudLayout.mine.centerY);
        this.timerText.setPosition(hudLayout.timer.centerX, hudLayout.timer.centerY);
        this.restartBtn.setPosition(hudLayout.menu.centerX, hudLayout.menu.centerY);
        this.muteBtn.setPosition(hudLayout.sound.centerX, hudLayout.sound.centerY);

        this.drawOverlayChrome(width, height);
        this.statusText.setPosition(width / 2, height / 2 - 94);
        this.statsText.setPosition(width / 2, height / 2 - 18);
        this.playAgainBtn.setPosition(width / 2, height / 2 + 66);
        this.mainMenuBtn.setPosition(width / 2, height / 2 + 118);
        this.reviewBtn.setPosition(width / 2, height / 2 + 174);
    }

    showGameOver(won, isNewRecord = false) {
        const { UI, TIMERS } = V2_CONFIG;
        this.stopTimer();

        const scores = highscoreManager.getScores();
        const best = scores[this.engine.difficultyKey];

        let status = won ? 'YOU WIN! 😎' : 'GAME OVER 😵';
        if (isNewRecord) status = 'NEW RECORD! 🏆';

        this.statusText.setText(status);
        this.statusText.setColor(won ? UI.COLORS.WIN : UI.COLORS.LOSS);

        // #19: unified timer format — padded 3 digits with 's' suffix
        const stats = [
            `TIME        ${String(this.secondsElapsed).padStart(3, '0')}s`,
            `BEST        ${best !== null ? String(best).padStart(3, '0') + 's' : '---'}`
        ].join('\n');

        this.statsText.setText(stats);

        this.overlay.setVisible(true);
        this.overlay.setAlpha(0);
        this.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: TIMERS.GAMEOVER_FADE_MS
        });
    }

    startTimer() {
        if (this.timerEvent) return;
        this.timerEvent = this.time.addEvent({
            delay: V2_CONFIG.TIMERS.TIMER_INTERVAL_MS,
            callback: () => {
                this.secondsElapsed++;
                this.timerText.setText(`TIME ${String(this.secondsElapsed).padStart(3, '0')}`);
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

    returnToMenu() {
        this.stopTimer();
        this.overlay.setVisible(false);
        this.scene.stop('GameScene');
        this.scene.start('MenuScene');
        this.scene.stop('UIScene');
    }

    createHudChrome(width) {
        this.hudChrome = this.add.graphics();
        this.minePanel = this.add.graphics();
        this.soundPanel = this.add.graphics();
        this.timerPanel = this.add.graphics();
        this.drawHudChrome(width);
    }

    drawHudChrome(width) {
        const { UI, LAYOUT } = V2_CONFIG;
        const hudLayout = this.getHudLayout(width);
        const barX = LAYOUT.UI_PADDING;
        const barY = 14;
        const barWidth = width - (LAYOUT.UI_PADDING * 2);
        const barHeight = LAYOUT.HUD_BAR_HEIGHT;

        this.hudChrome.clear();
        this.hudChrome.fillStyle(UI.COLORS.MENU_PANEL_SHADOW, 0.42);
        this.hudChrome.fillRoundedRect(barX + 8, barY + 10, barWidth, barHeight, 24);
        this.hudChrome.fillStyle(UI.COLORS.MENU_PANEL, 0.95);
        this.hudChrome.fillRoundedRect(barX, barY, barWidth, barHeight, 24);
        this.hudChrome.lineStyle(3, UI.COLORS.MENU_PANEL_BORDER, 0.65);
        this.hudChrome.strokeRoundedRect(barX, barY, barWidth, barHeight, 24);
        this.hudChrome.fillStyle(UI.COLORS.MENU_PANEL_INNER, 0.72);
        this.hudChrome.fillRoundedRect(barX + 14, barY + 14, barWidth - 28, barHeight - 28, 18);

        this.minePanel.clear();
        this.minePanel.fillStyle(UI.COLORS.MENU_UTILITY, 0.98);
        this.minePanel.fillRoundedRect(hudLayout.mine.x, hudLayout.mine.y, hudLayout.mine.width, hudLayout.mine.height, 16);
        this.minePanel.lineStyle(2, UI.COLORS.ACCENT_CYAN, 0.8);
        this.minePanel.strokeRoundedRect(hudLayout.mine.x, hudLayout.mine.y, hudLayout.mine.width, hudLayout.mine.height, 16);

        this.soundPanel.clear();
        this.soundPanel.fillStyle(UI.COLORS.MENU_UTILITY, 0.98);
        this.soundPanel.fillRoundedRect(hudLayout.sound.x, hudLayout.sound.y, hudLayout.sound.width, hudLayout.sound.height, 16);
        this.soundPanel.lineStyle(2, UI.COLORS.ACCENT_GOLD, 0.8);
        this.soundPanel.strokeRoundedRect(hudLayout.sound.x, hudLayout.sound.y, hudLayout.sound.width, hudLayout.sound.height, 16);

        this.timerPanel.clear();
        this.timerPanel.fillStyle(UI.COLORS.MENU_UTILITY, 0.98);
        this.timerPanel.fillRoundedRect(hudLayout.timer.x, hudLayout.timer.y, hudLayout.timer.width, hudLayout.timer.height, 16);
        this.timerPanel.lineStyle(2, UI.COLORS.ACCENT_GOLD, 0.8);
        this.timerPanel.strokeRoundedRect(hudLayout.timer.x, hudLayout.timer.y, hudLayout.timer.width, hudLayout.timer.height, 16);
    }

    getHudLayout(width) {
        const { LAYOUT } = V2_CONFIG;
        const barY = 14;
        const topY = barY + 14;
        const bottomY = barY + 56;
        const mineWidth = 166;
        const timerWidth = 166;
        const menuWidth = 160;
        const soundWidth = 132;
        const topHeight = 40;
        const bottomHeight = 30;
        const rightInset = LAYOUT.UI_PADDING + 12;

        return {
            mine: {
                x: LAYOUT.UI_PADDING + 12,
                y: topY,
                width: mineWidth,
                height: topHeight,
                centerX: LAYOUT.UI_PADDING + 12 + (mineWidth / 2),
                centerY: topY + (topHeight / 2)
            },
            menu: {
                width: menuWidth,
                centerX: width / 2,
                centerY: topY + (topHeight / 2)
            },
            timer: {
                x: width - rightInset - timerWidth,
                y: topY,
                width: timerWidth,
                height: topHeight,
                centerX: width - rightInset - (timerWidth / 2),
                centerY: topY + (topHeight / 2)
            },
            sound: {
                x: width - rightInset - soundWidth,
                y: bottomY,
                width: soundWidth,
                height: bottomHeight,
                centerX: width - rightInset - (soundWidth / 2),
                centerY: bottomY + (bottomHeight / 2)
            }
        };
    }

    createHudButton(x, y, width, label, accentColor, callback) {
        const { UI } = V2_CONFIG;
        const button = this.add.container(x, y);
        const shell = this.add.graphics();
        shell.fillStyle(UI.COLORS.MENU_UTILITY, 0.98);
        shell.fillRoundedRect(-width / 2, -24, width, 48, 16);
        shell.lineStyle(2, accentColor, 1);
        shell.strokeRoundedRect(-width / 2, -24, width, 48, 16);

        const text = this.add.text(0, 0, label, {
            fontSize: '16px',
            color: UI.COLORS.WHITE,
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif'
        }).setOrigin(0.5);

        const hitZone = this.add.zone(0, 0, width, 48)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);

        hitZone.on('pointerover', () => {
            this.tweens.add({ targets: button, scaleX: 1.03, scaleY: 1.03, duration: 100 });
        });
        hitZone.on('pointerout', () => {
            this.tweens.add({ targets: button, scaleX: 1, scaleY: 1, duration: 100 });
        });

        button.add([shell, text, hitZone]);
        if (label.startsWith('SOUND')) this.muteBtnLabel = text;
        return button;
    }

    createOverlayChrome(width, height) {
        this.dimmerRect = this.add.rectangle(0, 0, width, height, V2_CONFIG.UI.COLORS.BLACK, 0.68)
            .setOrigin(0)
            .setInteractive();

        this.overlayShadow = this.add.graphics();
        this.overlayPanel = this.add.graphics();
        this.overlayRule = this.add.graphics();
        this.drawOverlayChrome(width, height);

        this.overlay.add([this.dimmerRect, this.overlayShadow, this.overlayPanel, this.overlayRule]);
    }

    drawOverlayChrome(width, height) {
        const { UI } = V2_CONFIG;
        const panelWidth = Math.min(460, width - 30);
        const panelHeight = 360;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        this.dimmerRect.setSize(width, height);

        this.overlayShadow.clear();
        this.overlayShadow.fillStyle(UI.COLORS.MENU_PANEL_SHADOW, 0.5);
        this.overlayShadow.fillRoundedRect(panelX + 10, panelY + 14, panelWidth, panelHeight, 26);

        this.overlayPanel.clear();
        this.overlayPanel.fillStyle(UI.COLORS.MENU_PANEL, 0.98);
        this.overlayPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 26);
        this.overlayPanel.lineStyle(3, UI.COLORS.MENU_PANEL_BORDER, 0.78);
        this.overlayPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 26);
        this.overlayPanel.fillStyle(UI.COLORS.MENU_PANEL_INNER, 0.74);
        this.overlayPanel.fillRoundedRect(panelX + 18, panelY + 18, panelWidth - 36, panelHeight - 36, 18);

        this.overlayRule.clear();
        this.overlayRule.fillStyle(UI.COLORS.ACCENT_GOLD, 0.9);
        this.overlayRule.fillRoundedRect(panelX + 24, panelY + 24, Math.min(210, panelWidth * 0.4), 6, 3);
    }

    createModalButton(x, y, width, label, accentColor, callback) {
        const { UI } = V2_CONFIG;
        const button = this.add.container(x, y);
        const shell = this.add.graphics();
        shell.fillStyle(UI.COLORS.MENU_UTILITY, 1);
        shell.fillRoundedRect(-width / 2, -24, width, 48, 16);
        shell.lineStyle(2, accentColor, 1);
        shell.strokeRoundedRect(-width / 2, -24, width, 48, 16);

        const text = this.add.text(0, 0, label, {
            fontSize: '18px',
            color: UI.COLORS.WHITE,
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif'
        }).setOrigin(0.5);

        const hitZone = this.add.zone(0, 0, width, 48)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);

        hitZone.on('pointerover', () => {
            this.tweens.add({ targets: button, scaleX: 1.03, scaleY: 1.03, duration: 100 });
        });
        hitZone.on('pointerout', () => {
            this.tweens.add({ targets: button, scaleX: 1, scaleY: 1, duration: 100 });
        });

        button.add([shell, text, hitZone]);
        return button;
    }

    animateHudEntrance() {
        const elements = [
            this.hudChrome,
            this.minePanel,
            this.soundPanel,
            this.timerPanel,
            this.mineText,
            this.timerText,
            this.restartBtn,
            this.muteBtn
        ];

        elements.forEach((element, index) => {
            element.setAlpha(0);
            element.y += 8;
            this.tweens.add({
                targets: element,
                alpha: 1,
                y: element.y - 8,
                duration: 180,
                delay: index * 30,
                ease: 'Cubic.easeOut'
            });
        });
    }
}
