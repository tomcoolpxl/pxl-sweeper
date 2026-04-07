import Phaser from 'phaser';
import { MinesweeperEngine, GAME_STATES } from '../MinesweeperEngine';
import { soundManager } from '../utils/SoundManager';
import { V2_CONFIG } from '../config';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.difficultyKey = data.difficulty || 'BEGINNER';
        this.engine = new MinesweeperEngine(this.difficultyKey);
        this.tiles = [];
        this.longPressTimer = null;
        this.focusedIndex = 0;
        this.keyboardActive = false;  // #17: keyboard nav is opt-in — must press an arrow key first
    }

    create() {
        this.calculateScaling();
        this.createBoard();
        this.setupKeyboard();  // #17: keyboard controls

        // Launch UI Scene
        this.scene.launch('UIScene', { engine: this.engine });
    }

    calculateScaling() {
        const { width, height } = this.cameras.main;
        const { LAYOUT } = V2_CONFIG;

        const safeWidth = Math.floor(width * LAYOUT.MARGIN_PERCENT);
        const safeHeight = Math.floor((height - LAYOUT.HUD_HEIGHT) * LAYOUT.MARGIN_PERCENT);

        const tileW = (safeWidth / this.engine.cols) - LAYOUT.BASE_PADDING;
        const tileH = (safeHeight / this.engine.rows) - LAYOUT.BASE_PADDING;

        this.tileSize = Math.floor(Math.min(tileW, tileH, LAYOUT.MAX_TILE_SIZE));
        this.padding = LAYOUT.BASE_PADDING;

        const boardWidth = this.engine.cols * (this.tileSize + this.padding);
        const boardHeight = this.engine.rows * (this.tileSize + this.padding);

        this.startX = Math.floor((width - boardWidth) / 2 + (this.tileSize + this.padding) / 2);
        this.startY = Math.floor((height - boardHeight) / 2 + (this.tileSize + this.padding) / 2 + (LAYOUT.HUD_HEIGHT / LAYOUT.BOARD_OFFSET_Y_DIV));
    }

    createBoard() {
        const { UI } = V2_CONFIG;

        for (let i = 0; i < this.engine.grid.length; i++) {
            const row = Math.floor(i / this.engine.cols);
            const col = i % this.engine.cols;

            const x = this.startX + col * (this.tileSize + this.padding);
            const y = this.startY + row * (this.tileSize + this.padding);

            const tileContainer = this.add.container(x, y);

            const bg = this.add.rectangle(0, 0, this.tileSize, this.tileSize, UI.COLORS.TILE_HIDDEN)
                .setInteractive({ useHandCursor: true });

            const text = this.add.text(0, 0, '', {
                fontSize: `${Math.floor(this.tileSize * 0.6)}px`,
                fontFamily: 'monospace',
                color: UI.COLORS.WHITE,
                fontWeight: 'bold'
            }).setOrigin(0.5);

            tileContainer.add([bg, text]);
            this.tiles[i] = { container: tileContainer, bg, text };

            bg.on('pointerdown', (pointer) => {
                if (this.engine.state === GAME_STATES.WON || this.engine.state === GAME_STATES.LOST) return;

                if (pointer.rightButtonDown()) {
                    this.handleRightClick(i);
                } else {
                    this.longPressTimer = this.time.delayedCall(V2_CONFIG.TIMERS.LONG_PRESS_MS, () => {
                        this.handleRightClick(i);
                        this.longPressTimer = null;
                        tileContainer.setData('longPressed', true);
                    });
                }
            });

            bg.on('pointerup', (pointer) => {
                if (this.engine.state === GAME_STATES.WON || this.engine.state === GAME_STATES.LOST) return;

                if (!pointer.rightButtonDown()) {
                    if (this.longPressTimer) {
                        this.longPressTimer.remove();
                        this.longPressTimer = null;
                        if (!tileContainer.getData('longPressed')) {
                            // Mouse click: deactivate keyboard mode and move focus silently
                            this.keyboardActive = false;
                            if (this.tiles[this.focusedIndex]) {
                                this.tiles[this.focusedIndex].bg.setStrokeStyle(0);
                            }
                            this.focusedIndex = i;
                            this.handleLeftClick(i);
                        }
                    }
                    tileContainer.setData('longPressed', false);
                }
            });

            bg.on('pointerout', () => {
                if (this.longPressTimer) {
                    this.longPressTimer.remove();
                    this.longPressTimer = null;
                }
                tileContainer.setData('longPressed', false);  // #7: reset stale flag on pointer-out
            });
        }

        // #6: call once, outside the tile creation loop
        this.input.mouse.disableContextMenu();
    }

    // #17: keyboard controls — arrow keys activate keyboard mode; Enter/Space only work after first arrow key press
    // This prevents accidental Enter/Space presses (e.g. held key on scene load) from bypassing first-click safety
    setupKeyboard() {
        const activateAndMove = (delta) => {
            if (!this.keyboardActive) {
                this.keyboardActive = true;
                this.setFocus(this.focusedIndex);  // show indicator on first intentional key press
            }
            this.moveFocus(delta);
        };

        this.input.keyboard.on('keydown-UP', () => activateAndMove(-this.engine.cols));
        this.input.keyboard.on('keydown-DOWN', () => activateAndMove(this.engine.cols));
        this.input.keyboard.on('keydown-LEFT', () => activateAndMove(-1));
        this.input.keyboard.on('keydown-RIGHT', () => activateAndMove(1));

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.keyboardActive) this.handleLeftClick(this.focusedIndex);
        });
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.keyboardActive) this.handleRightClick(this.focusedIndex);
        });
    }

    setFocus(index) {
        if (index < 0 || index >= this.tiles.length) return;

        // Remove old focus indicator
        if (this.tiles[this.focusedIndex]) {
            this.tiles[this.focusedIndex].bg.setStrokeStyle(0);
        }

        this.focusedIndex = index;
        this.tiles[index].bg.setStrokeStyle(2, 0xffff00);

        // Announce to screen reader via UIScene
        const cell = this.engine.grid[index];
        const row = Math.floor(index / this.engine.cols) + 1;
        const col = (index % this.engine.cols) + 1;
        this.events.emit('update-focus', `Row ${row}, column ${col}.${cell.isFlagged ? ' Flagged.' : ''}${cell.isRevealed && cell.neighborMines > 0 ? ` ${cell.neighborMines} adjacent mines.` : ''}`);
    }

    moveFocus(delta) {
        if (this.engine.state === GAME_STATES.WON || this.engine.state === GAME_STATES.LOST) return;

        const newIndex = this.focusedIndex + delta;
        if (newIndex < 0 || newIndex >= this.engine.grid.length) return;

        // Prevent wrapping at row boundaries for left/right movement
        if (delta === 1 && newIndex % this.engine.cols === 0) return;
        if (delta === -1 && this.focusedIndex % this.engine.cols === 0) return;

        this.setFocus(newIndex);
    }

    handleLeftClick(index) {
        if (this.engine.grid[index].isFlagged || this.engine.grid[index].isRevealed) return;

        soundManager.playReveal();
        const revealedIndices = this.engine.revealCell(index);
        this.updateBoardUI(revealedIndices);

        if (this.engine.state === GAME_STATES.WON) {
            soundManager.playWin();
            this.triggerWinParticles();
            this.triggerHaptic(V2_CONFIG.HAPTICS.WIN);
            this.events.emit('game-won');
        } else if (this.engine.state === GAME_STATES.LOST) {
            soundManager.playLoss();
            this.triggerLossParticles(this.tiles[this.engine.triggeredMineIndex].container);
            this.triggerHaptic(V2_CONFIG.HAPTICS.LOSS);
            this.events.emit('game-lost', this.engine.triggeredMineIndex);
        }
    }

    handleRightClick(index) {
        if (this.engine.grid[index].isRevealed) return;

        soundManager.playFlag();
        this.triggerHaptic(V2_CONFIG.HAPTICS.FLAG);
        this.engine.toggleMark(index);
        this.updateBoardUI();
    }

    updateBoardUI(revealedIndices = []) {
        const { UI } = V2_CONFIG;

        // #5: O(1) lookup instead of O(n) Array.includes inside the loop
        const revealedSet = new Set(revealedIndices);
        const showAllMines = this.engine.state === GAME_STATES.LOST;

        for (let i = 0; i < this.engine.grid.length; i++) {
            const cell = this.engine.grid[i];
            const tile = this.tiles[i];

            if (cell.isRevealed) {
                if (revealedSet.has(i) && tile.bg.fillColor !== UI.COLORS.TILE_REVEALED) {
                    this.tweens.add({
                        targets: tile.container,
                        scale: { from: 0.8, to: 1.0 },
                        duration: V2_CONFIG.TIMERS.REVEAL_TWEEN_MS,
                        ease: 'Back.easeOut'
                    });
                }

                tile.bg.setFillStyle(UI.COLORS.TILE_REVEALED);
                if (cell.isMine) {
                    tile.text.setText('💣');
                    tile.bg.setFillStyle(UI.COLORS.TILE_MINE);
                } else if (cell.neighborMines > 0) {
                    tile.text.setText(cell.neighborMines);
                    tile.text.setColor(UI.COLORS.NUMBERS[cell.neighborMines]);
                } else {
                    tile.text.setText('');
                }
            } else if (showAllMines && cell.isMine) {
                tile.text.setText('💣');
                tile.text.setColor(UI.COLORS.WHITE);
                tile.bg.setFillStyle(UI.COLORS.TILE_MINE);
            } else if (cell.isFlagged) {
                tile.text.setText('🚩');
                tile.text.setColor(UI.COLORS.FLAG);
            } else if (cell.isQuestionMarked) {
                tile.text.setText('?');
                tile.text.setColor(UI.COLORS.WHITE);
            } else {
                tile.text.setText('');
            }
        }
        this.events.emit('update-mines', this.engine.getRemainingMines());
    }

    triggerHaptic(pattern) {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    }

    triggerWinParticles() {
        const { width, height } = this.cameras.main;
        const { PARTICLES } = V2_CONFIG.UI;
        const emitter = this.add.particles(width / 2, height / 2, 'particle_rect', {
            speed: { min: PARTICLES.WIN_SPEED_MIN, max: PARTICLES.WIN_SPEED_MAX },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            lifespan: PARTICLES.WIN_LIFESPAN,
            quantity: PARTICLES.WIN_QUANTITY,
            tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
        });
        emitter.explode(PARTICLES.WIN_QUANTITY);
    }

    triggerLossParticles(container) {
        const { PARTICLES } = V2_CONFIG.UI;
        const emitter = this.add.particles(container.x, container.y, 'particle_rect', {
            speed: { min: PARTICLES.LOSS_SPEED_MIN, max: PARTICLES.LOSS_SPEED_MAX },
            angle: { min: 0, max: 360 },
            scale: { start: 3, end: 0 },
            tint: [0xff0000, 0xff8800, 0x444444],
            lifespan: PARTICLES.LOSS_LIFESPAN,
            gravityY: PARTICLES.LOSS_GRAVITY_Y,
            blendMode: 'NORMAL'
        });
        emitter.explode(PARTICLES.LOSS_QUANTITY);
    }
}
