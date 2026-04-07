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
        const layout = this.getMenuLayout(width, height);

        this.cameras.main.setBackgroundColor(UI.COLORS.MENU_BG_DEEP);
        this.createBackdrop(width, height, layout);

        const menuContainer = this.add.container(width / 2, height * UI.MENU.CONTAINER_Y_PCT);

        menuContainer.add(this.createHeroPanel(layout));
        menuContainer.add(this.createTitleLockup(layout));
        this.createDifficultyCards(menuContainer, layout);
        this.createUtilityButtons(menuContainer, layout);
        this.createFooterCopy(menuContainer, layout);
    }

    getMenuLayout(width, height) {
        const { MENU } = V2_CONFIG.UI;
        const isCompact = width < MENU.MOBILE_BREAKPOINT;
        const isTablet = width < MENU.TABLET_BREAKPOINT && !isCompact;
        const cardColumns = isCompact ? 1 : isTablet ? 2 : 3;
        const panelWidth = Math.min(MENU.PANEL_WIDTH, width - (isCompact ? 28 : 56));
        const panelHeight = Math.min(MENU.PANEL_HEIGHT, height - (isCompact ? 28 : 48));
        const cardWidth = isCompact
            ? Math.min(panelWidth - 44, 320)
            : isTablet
                ? Math.min((panelWidth - 96) / 2, 280)
                : Math.min(MENU.CARD_WIDTH, (panelWidth - 120) / 3);
        const cardHeight = isCompact ? 118 : isTablet ? 132 : MENU.CARD_HEIGHT;
        const utilityWidth = isCompact ? Math.min(panelWidth - 44, 320) : Math.min(MENU.UTILITY_WIDTH, (panelWidth - 96) / 2);

        const cardsTopY = isCompact ? -18 : isTablet ? -12 : 12;
        const utilityHeight = V2_CONFIG.UI.MENU.UTILITY_HEIGHT;
        const utilityRows = isCompact ? 2 : 1;
        const rowGap = cardHeight + (isCompact ? 14 : isTablet ? 18 : MENU.CARD_GAP);
        const lastCardCenterY = cardsTopY + ((Math.ceil(3 / cardColumns) - 1) * rowGap);
        const cardsBottomY = lastCardCenterY + (cardHeight / 2);
        const utilityTopY = cardsBottomY + 18;
        const utilityBlockHeight = (utilityRows * utilityHeight) + ((utilityRows - 1) * (isCompact ? 12 : MENU.UTILITY_GAP));
        const utilityCenterY = utilityTopY + (utilityHeight / 2);
        const footerY = utilityTopY + utilityBlockHeight + (isCompact ? 24 : 28);

        return {
            width,
            height,
            isCompact,
            isTablet,
            cardColumns,
            panelWidth,
            panelHeight,
            cardWidth,
            cardHeight,
            utilityWidth,
            cardGap: isCompact ? 14 : isTablet ? 18 : MENU.CARD_GAP,
            utilityGap: isCompact ? 12 : MENU.UTILITY_GAP,
            cardsTopY,
            utilityTopY,
            utilityCenterY,
            footerY
        };
    }

    createBackdrop(width, height, layout) {
        const { UI } = V2_CONFIG;
        const bg = this.add.graphics();

        bg.fillStyle(UI.COLORS.MENU_BG_DEEP, 1);
        bg.fillRect(0, 0, width, height);

        bg.fillStyle(UI.COLORS.MENU_BG_MID, 0.9);
        bg.fillCircle(width * 0.18, height * 0.22, Math.max(width, height) * 0.22);
        bg.fillCircle(width * 0.86, height * 0.76, Math.max(width, height) * 0.18);

        bg.lineStyle(1, UI.COLORS.MENU_GRID, 0.22);
        const gridSize = layout.isCompact ? 32 : 40;
        for (let x = 0; x <= width; x += gridSize) {
            bg.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y <= height; y += gridSize) {
            bg.lineBetween(0, y, width, y);
        }

        const ambient = this.add.graphics();
        for (let i = 0; i < UI.MENU.BACKDROP_DOT_COUNT; i++) {
            const x = Phaser.Math.Between(24, width - 24);
            const y = Phaser.Math.Between(24, height - 24);
            const radius = Phaser.Math.Between(2, 5);
            const color = i % 3 === 0 ? UI.COLORS.ACCENT_CYAN : i % 3 === 1 ? UI.COLORS.ACCENT_GOLD : UI.COLORS.ACCENT_RED;

            ambient.fillStyle(color, 0.18);
            ambient.fillCircle(x, y, radius);
        }
    }

    createHeroPanel(layout) {
        const { UI } = V2_CONFIG;
        const panel = this.add.container(0, 0);
        const radius = UI.MENU.PANEL_RADIUS;

        const shadow = this.add.graphics();
        shadow.fillStyle(UI.COLORS.MENU_PANEL_SHADOW, 0.45);
        shadow.fillRoundedRect((-layout.panelWidth / 2) + 10, (-layout.panelHeight / 2) + 14, layout.panelWidth, layout.panelHeight, radius);

        const outer = this.add.graphics();
        outer.fillStyle(UI.COLORS.MENU_PANEL, 0.94);
        outer.fillRoundedRect(-layout.panelWidth / 2, -layout.panelHeight / 2, layout.panelWidth, layout.panelHeight, radius);
        outer.lineStyle(3, UI.COLORS.MENU_PANEL_BORDER, 0.65);
        outer.strokeRoundedRect(-layout.panelWidth / 2, -layout.panelHeight / 2, layout.panelWidth, layout.panelHeight, radius);

        const inner = this.add.graphics();
        inner.fillStyle(UI.COLORS.MENU_PANEL_INNER, 0.68);
        inner.fillRoundedRect((-layout.panelWidth / 2) + 18, (-layout.panelHeight / 2) + 18, layout.panelWidth - 36, layout.panelHeight - 36, radius - 10);

        const rule = this.add.graphics();
        rule.fillStyle(UI.COLORS.ACCENT_CYAN, 0.95);
        rule.fillRoundedRect((-layout.panelWidth / 2) + 28, (-layout.panelHeight / 2) + 94, layout.panelWidth * 0.32, 6, 3);
        rule.fillStyle(UI.COLORS.ACCENT_GOLD, 0.8);
        rule.fillRoundedRect((-layout.panelWidth / 2) + 28, (-layout.panelHeight / 2) + 108, layout.panelWidth * 0.18, 4, 2);

        panel.add([shadow, outer, inner, rule]);
        return panel;
    }

    createTitleLockup(layout) {
        const { UI } = V2_CONFIG;
        const group = this.add.container(0, 0);
        const titleY = layout.isCompact ? -layout.panelHeight / 2 + 72 : layout.isTablet ? -layout.panelHeight / 2 + 76 : -layout.panelHeight / 2 + 82;
        const subtitleY = titleY + (layout.isCompact ? 42 : 48);

        const overline = this.add.text(0, titleY - 28, 'TACTICAL MINESWEEPER // PHASER EDITION', {
            fontSize: layout.isCompact ? '11px' : '13px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_MUTED,
            letterSpacing: 6
        }).setOrigin(0.5);

        const titleShadow = this.add.text(3, titleY + 3, 'PXL SWEEPER', {
            fontSize: layout.isCompact ? '34px' : layout.isTablet ? '48px' : '58px',
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
            color: '#03111d',
            stroke: '#03111d',
            strokeThickness: 8
        }).setOrigin(0.5);

        const title = this.add.text(0, titleY, 'PXL SWEEPER', {
            fontSize: layout.isCompact ? '34px' : layout.isTablet ? '48px' : '58px',
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
            color: UI.COLORS.WHITE,
            stroke: '#16314f',
            strokeThickness: 6
        }).setOrigin(0.5);
        title.setShadow(0, 6, '#0b1829', 10, true, true);

        const subtitle = this.add.text(0, subtitleY, 'Sweep clean tiles. Read the board. Keep your nerve.', {
            fontSize: layout.isCompact ? '14px' : '17px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_SOFT,
            align: 'center'
        }).setOrigin(0.5);

        group.add([overline, titleShadow, title, subtitle]);
        return group;
    }

    createDifficultyCards(menuContainer, layout) {
        const cards = [
            { label: 'BEGINNER', difficulty: 'BEGINNER', accent: V2_CONFIG.UI.COLORS.ACCENT_CYAN, accentText: '#7ae6ff', meta: ['9 x 9 GRID', '10 MINES'], subtitle: 'Warm up the pattern scanner.', name: 'beginnerBtn' },
            { label: 'INTERMEDIATE', difficulty: 'INTERMEDIATE', accent: V2_CONFIG.UI.COLORS.ACCENT_GOLD, accentText: '#ffd979', meta: ['16 x 16 GRID', '40 MINES'], subtitle: 'Balanced pressure, tighter reads.', name: 'intermediateBtn' },
            { label: 'EXPERT', difficulty: 'EXPERT', accent: V2_CONFIG.UI.COLORS.ACCENT_RED, accentText: '#ff9a9a', meta: ['16 x 30 GRID', '99 MINES'], subtitle: 'High density. No wasted moves.', name: 'expertBtn' }
        ];

        cards.forEach((card, index) => {
            const topY = layout.cardsTopY;
            const rowHeight = layout.cardHeight + layout.cardGap;
            const row = Math.floor(index / layout.cardColumns);
            const col = index % layout.cardColumns;
            const itemsInRow = row === 0 ? Math.min(layout.cardColumns, cards.length) : cards.length - (row * layout.cardColumns);
            const totalWidth = (layout.cardWidth * itemsInRow) + (layout.cardGap * Math.max(0, itemsInRow - 1));
            const startX = -totalWidth / 2 + layout.cardWidth / 2;
            const x = startX + col * (layout.cardWidth + layout.cardGap);
            const y = topY + row * rowHeight;

            menuContainer.add(this.createDifficultyCard(x, y, layout.cardWidth, layout.cardHeight, card, layout));
        });
    }

    createDifficultyCard(x, y, width, height, options, layout) {
        const { UI } = V2_CONFIG;
        const card = this.add.container(x, y);
        const radius = UI.MENU.CARD_RADIUS;

        const shadow = this.add.graphics();
        shadow.fillStyle(UI.COLORS.MENU_CARD_SHADOW, 0.55);
        shadow.fillRoundedRect((-width / 2) + 8, (-height / 2) + 10, width, height, radius);

        const shell = this.add.graphics();
        shell.fillStyle(UI.COLORS.MENU_CARD, 0.98);
        shell.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        shell.lineStyle(2, UI.COLORS.MENU_CARD_BORDER, 0.8);
        shell.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
        shell.fillStyle(options.accent, 0.95);
        shell.fillRoundedRect(-width / 2, -height / 2, width, 12, 6);

        const accentChip = this.add.graphics();
        accentChip.fillStyle(options.accent, 0.18);
        accentChip.fillRoundedRect((-width / 2) + 14, (-height / 2) + 16, width - 28, layout.isCompact ? 28 : 32, 14);

        const title = this.add.text(0, -34, options.label, {
            fontSize: layout.isCompact ? '18px' : layout.isTablet ? '20px' : '22px',
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
            color: options.accentText
        }).setOrigin(0.5);

        const subtitle = this.add.text(0, layout.isCompact ? -3 : -2, options.subtitle, {
            fontSize: layout.isCompact ? '12px' : '13px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_SOFT,
            align: 'center',
            wordWrap: { width: width - 40 }
        }).setOrigin(0.5);

        const meta = this.add.text(0, layout.isCompact ? 28 : 34, options.meta.join('   •   '), {
            fontSize: layout.isCompact ? '11px' : '12px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_MUTED,
            align: 'center',
            wordWrap: { width: width - 28 }
        }).setOrigin(0.5);

        const ctaRuleY = height / 2 - (layout.isCompact ? 48 : 50);
        const ctaY = height / 2 - (layout.isCompact ? 14 : 16);
        const ctaRule = this.add.graphics();
        ctaRule.fillStyle(options.accent, 0.3);
        ctaRule.fillRoundedRect((-width / 2) + 16, ctaRuleY, width - 32, 1.5, 1);

        const cta = this.add.text(0, ctaY, 'START SWEEP', {
            fontSize: layout.isCompact ? '11px' : '12px',
            fontFamily: '"Arial Black", sans-serif',
            color: UI.COLORS.WHITE,
            letterSpacing: 2
        }).setOrigin(0.5);

        const hitZone = this.add.zone(0, 0, width, height)
            .setRectangleDropZone(width, height)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('GameScene', { difficulty: options.difficulty }));

        hitZone.on('pointerover', () => {
            this.tweens.add({
                targets: card,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 140,
                ease: 'Sine.easeOut'
            });
            shell.clear();
            shell.fillStyle(UI.COLORS.MENU_PANEL_INNER, 1);
            shell.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
            shell.lineStyle(3, options.accent, 1);
            shell.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
            shell.fillStyle(options.accent, 0.95);
            shell.fillRoundedRect(-width / 2, -height / 2, width, 12, 6);
        });

        hitZone.on('pointerout', () => {
            this.tweens.add({
                targets: card,
                scaleX: 1,
                scaleY: 1,
                duration: 140,
                ease: 'Sine.easeOut'
            });
            shell.clear();
            shell.fillStyle(UI.COLORS.MENU_CARD, 0.98);
            shell.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
            shell.lineStyle(2, UI.COLORS.MENU_CARD_BORDER, 0.8);
            shell.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
            shell.fillStyle(options.accent, 0.95);
            shell.fillRoundedRect(-width / 2, -height / 2, width, 12, 6);
        });

        if (options.name) {
            this[options.name] = hitZone;
        }

        card.add([shadow, shell, accentChip, title, subtitle, meta, ctaRule, cta, hitZone]);
        return card;
    }

    createUtilityButtons(menuContainer, layout) {
        const utilityButtons = [
            {
                label: '🏆 HIGHSCORES',
                caption: 'Track your fastest clears',
                accent: V2_CONFIG.UI.COLORS.ACCENT_GOLD,
                callback: () => this.showHighscores(),
                name: 'highscoresBtn'
            },
            {
                label: '❓ HOW TO PLAY',
                caption: 'Controls, rules, and rhythm',
                accent: V2_CONFIG.UI.COLORS.ACCENT_GREEN,
                callback: () => this.showTutorial(),
                name: 'howToBtn'
            }
        ];

        if (layout.isCompact) {
            const firstCenterY = layout.utilityCenterY;
            utilityButtons.forEach((button, index) => {
                menuContainer.add(this.createUtilityButton(0, firstCenterY + index * (V2_CONFIG.UI.MENU.UTILITY_HEIGHT + layout.utilityGap), layout.utilityWidth, button));
            });
            return;
        }

        const baseY = layout.utilityCenterY;

        const totalWidth = (layout.utilityWidth * utilityButtons.length) + layout.utilityGap;
        const startX = -totalWidth / 2 + layout.utilityWidth / 2;

        utilityButtons.forEach((button, index) => {
            menuContainer.add(this.createUtilityButton(startX + index * (layout.utilityWidth + layout.utilityGap), baseY, layout.utilityWidth, button));
        });
    }

    createUtilityButton(x, y, width, options) {
        const { UI } = V2_CONFIG;
        const height = UI.MENU.UTILITY_HEIGHT;
        const radius = UI.MENU.UTILITY_RADIUS;
        const button = this.add.container(x, y);

        const shell = this.add.graphics();
        shell.fillStyle(UI.COLORS.MENU_UTILITY, 0.98);
        shell.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        shell.lineStyle(2, UI.COLORS.MENU_UTILITY_BORDER, 0.85);
        shell.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        const accent = this.add.graphics();
        accent.fillStyle(options.accent, 0.95);
        accent.fillRoundedRect((-width / 2) + 12, (-height / 2) + 12, 10, height - 24, 5);

        const label = this.add.text((-width / 2) + 34, -10, options.label, {
            fontSize: '18px',
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
            color: UI.COLORS.WHITE
        }).setOrigin(0, 0.5);

        const caption = this.add.text((-width / 2) + 34, 13, options.caption, {
            fontSize: '12px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_MUTED
        }).setOrigin(0, 0.5);

        const hitZone = this.add.zone(0, 0, width, height)
            .setRectangleDropZone(width, height)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', options.callback);

        hitZone.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 120
            });
        });

        hitZone.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 120
            });
        });

        button.add([shell, accent, label, caption, hitZone]);
        if (options.name) {
            this[options.name] = hitZone;
        }
        return button;
    }

    createFooterCopy(menuContainer, layout) {
        const { UI } = V2_CONFIG;
        const footerY = layout.footerY;

        const footer = this.add.text(0, footerY, 'FIRST CLICK IS ALWAYS SAFE // TAP, CLICK, OR KEYBOARD READY', {
            fontSize: layout.isCompact ? '11px' : '12px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_MUTED,
            letterSpacing: 2,
            align: 'center'
        }).setOrigin(0.5);

        menuContainer.add(footer);
    }

    showTutorial() {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.createModalShell(width, height, Math.min(UI.MODAL.TUTORIAL_WIDTH + 40, width - 30), Math.min(UI.MODAL.TUTORIAL_HEIGHT + 40, height - 40), 'FIELD MANUAL');

        const steps = [
            '1. LEFT CLICK or ENTER to reveal a tile.',
            '2. NUMBERS show how many mines are adjacent.',
            '3. RIGHT CLICK, LONG PRESS, or SPACE to FLAG.',
            '4. Arrow keys navigate the board.',
            '5. REVEAL all non-mine tiles to WIN! 💣'
        ];

        const content = this.add.text(width / 2, height / 2 - 8, steps.join('\n\n'), {
            fontSize: '18px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_SOFT,
            align: 'center'
        }).setOrigin(0.5);

        const closeBtn = this.createModalButton(width / 2, height / 2 + 148, 160, 'GOT IT', UI.COLORS.ACCENT_GREEN, () => overlay.destroy());

        overlay.add([content, closeBtn]);
    }

    showHighscores() {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.createModalShell(width, height, Math.min(460, width - 30), Math.min(420, height - 40), 'FASTEST TIMES');

        const scores = highscoreManager.getScores();
        const fmt = (v) => v !== null ? String(v).padStart(3, '0') + 's' : '---';
        const rows = [
            { label: 'BEGINNER', value: fmt(scores.BEGINNER), accent: UI.COLORS.ACCENT_CYAN },
            { label: 'INTERMEDIATE', value: fmt(scores.INTERMEDIATE), accent: UI.COLORS.ACCENT_GOLD },
            { label: 'EXPERT', value: fmt(scores.EXPERT), accent: UI.COLORS.ACCENT_RED }
        ];

        const tableX = width / 2;
        const tableY = height / 2 - 52;
        const labelX = tableX - 108;
        const valueX = tableX + 118;
        const rowGap = 46;
        const content = this.add.container(0, 0);

        rows.forEach((row, index) => {
            const y = tableY + (index * rowGap);
            const rule = this.add.graphics();
            rule.fillStyle(row.accent, 0.7);
            rule.fillRoundedRect(tableX - 158, y - 16, 8, 30, 4);

            const label = this.add.text(labelX, y, row.label, {
                fontSize: '22px',
                fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
                color: UI.COLORS.MENU_TEXT_SOFT
            }).setOrigin(0, 0.5);

            const value = this.add.text(valueX, y, row.value, {
                fontSize: '22px',
                fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
                color: UI.COLORS.WHITE
            }).setOrigin(1, 0.5);

            content.add([rule, label, value]);
        });

        const clearBtn = this.createModalButton(width / 2, height / 2 + 120, 170, 'CLEAR ALL', UI.COLORS.ACCENT_RED, () => {
            this.showConfirm('Clear all scores?', () => {
                highscoreManager.clearScores();
                overlay.destroy();
                this.showHighscores();
            });
        });

        const closeBtn = this.createModalButton(width / 2, height / 2 + 174, 150, 'CLOSE', UI.COLORS.ACCENT_CYAN, () => overlay.destroy());

        overlay.add([content, clearBtn, closeBtn]);
    }

    // #8: in-game confirmation modal — replaces blocking window.confirm()
    showConfirm(message, onConfirm) {
        const { width, height } = this.scale;
        const { UI } = V2_CONFIG;
        const overlay = this.createModalShell(width, height, 400, 220, 'CONFIRM ACTION');
        const text = this.add.text(width / 2, height / 2 - 4, message, {
            fontSize: '20px',
            fontFamily: '"Trebuchet MS", sans-serif',
            color: UI.COLORS.MENU_TEXT_SOFT,
            align: 'center'
        }).setOrigin(0.5);

        const yesBtn = this.createModalButton(width / 2 - 78, height / 2 + 58, 120, 'YES', UI.COLORS.ACCENT_RED, () => {
            overlay.destroy();
            onConfirm();
        });

        const noBtn = this.createModalButton(width / 2 + 78, height / 2 + 58, 120, 'NO', UI.COLORS.ACCENT_CYAN, () => overlay.destroy());

        overlay.add([text, yesBtn, noBtn]);
    }

    createModalShell(width, height, panelWidth, panelHeight, titleText) {
        const { UI } = V2_CONFIG;
        const overlay = this.add.container(0, 0);

        const dimmer = this.add.rectangle(0, 0, width, height, UI.COLORS.BLACK, 0.68)
            .setOrigin(0)
            .setInteractive();

        const shadow = this.add.graphics();
        shadow.fillStyle(UI.COLORS.MENU_PANEL_SHADOW, 0.5);
        shadow.fillRoundedRect((width - panelWidth) / 2 + 10, (height - panelHeight) / 2 + 14, panelWidth, panelHeight, 26);

        const panel = this.add.graphics();
        panel.fillStyle(UI.COLORS.MENU_PANEL, 0.98);
        panel.fillRoundedRect((width - panelWidth) / 2, (height - panelHeight) / 2, panelWidth, panelHeight, 26);
        panel.lineStyle(3, UI.COLORS.MENU_PANEL_BORDER, 0.75);
        panel.strokeRoundedRect((width - panelWidth) / 2, (height - panelHeight) / 2, panelWidth, panelHeight, 26);
        panel.fillStyle(UI.COLORS.MENU_PANEL_INNER, 0.72);
        panel.fillRoundedRect((width - panelWidth) / 2 + 18, (height - panelHeight) / 2 + 18, panelWidth - 36, panelHeight - 36, 18);
        panel.fillStyle(UI.COLORS.ACCENT_GOLD, 0.95);
        panel.fillRoundedRect((width - panelWidth) / 2 + 24, (height - panelHeight) / 2 + 26, Math.min(210, panelWidth * 0.42), 6, 3);

        const title = this.add.text(width / 2, (height - panelHeight) / 2 + 64, titleText, {
            fontSize: '30px',
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
            color: UI.COLORS.WHITE
        }).setOrigin(0.5);
        title.setShadow(0, 4, '#06101b', 6, true, true);

        overlay.add([dimmer, shadow, panel, title]);
        return overlay;
    }

    createModalButton(x, y, width, label, accentColor, callback) {
        const { UI } = V2_CONFIG;
        const height = 48;
        const button = this.add.container(x, y);

        const shell = this.add.graphics();
        shell.fillStyle(UI.COLORS.MENU_UTILITY, 1);
        shell.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
        shell.lineStyle(2, accentColor, 1);
        shell.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);

        const labelText = this.add.text(0, 0, label, {
            fontSize: '18px',
            fontFamily: '"Arial Black", "Trebuchet MS", sans-serif',
            color: UI.COLORS.WHITE
        }).setOrigin(0.5);

        const hitZone = this.add.zone(0, 0, width, height)
            .setRectangleDropZone(width, height)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);

        hitZone.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 100
            });
        });

        hitZone.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        button.add([shell, labelText, hitZone]);
        return button;
    }
}
