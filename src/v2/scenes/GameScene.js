import Phaser from 'phaser';
import { MinesweeperEngine, GAME_STATES } from '../MinesweeperEngine';
import { soundManager } from '../utils/SoundManager';
import { themeManager } from '../utils/ThemeManager';
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
        this.theme = themeManager.getTheme();
    }

    create() {
        this.calculateScaling();
        this.createBoard();

        // Launch UI Scene
        this.scene.launch('UIScene', { engine: this.engine });
    }

    calculateScaling() {
        const { width, height } = this.cameras.main;
        const { LAYOUT } = V2_CONFIG;
        const availableWidth = width * LAYOUT.MARGIN_PERCENT;
        const availableHeight = (height - LAYOUT.HUD_HEIGHT) * LAYOUT.MARGIN_PERCENT;

        // Calculate required tile size to fit board in available space
        const tileW = (availableWidth / this.engine.cols) - LAYOUT.BASE_PADDING;
        const tileH = (availableHeight / this.engine.rows) - LAYOUT.BASE_PADDING;
        
        // Use the smaller of the two to maintain square tiles
        this.tileSize = Math.floor(Math.min(tileW, tileH, LAYOUT.MAX_TILE_SIZE));
        this.padding = LAYOUT.BASE_PADDING;

        // Calculate board dimensions
        const boardWidth = this.engine.cols * (this.tileSize + this.padding);
        const boardHeight = this.engine.rows * (this.tileSize + this.padding);

        // Center board
        this.startX = (width - boardWidth) / 2 + (this.tileSize + this.padding) / 2;
        this.startY = (height - boardHeight) / 2 + (this.tileSize + this.padding) / 2 + (LAYOUT.HUD_HEIGHT / 4);
    }

    createBoard() {
        for (let i = 0; i < this.engine.grid.length; i++) {
            const row = Math.floor(i / this.engine.cols);
            const col = i % this.engine.cols;

            const x = this.startX + col * (this.tileSize + this.padding);
            const y = this.startY + row * (this.tileSize + this.padding);

            const tileContainer = this.add.container(x, y);
            
            // Background / Hidden State
            const bg = this.add.rectangle(0, 0, this.tileSize, this.tileSize, this.theme.tileHidden)
                .setInteractive({ useHandCursor: true });
            
            const text = this.add.text(0, 0, '', {
                fontSize: `${Math.floor(this.tileSize * 0.6)}px`,
                fontFamily: 'monospace',
                color: V2_CONFIG.UI.COLORS.WHITE
            }).setOrigin(0.5);

            tileContainer.add([bg, text]);
            this.tiles[i] = { container: tileContainer, bg, text };

            // Input handlers
            bg.on('pointerdown', (pointer) => {
                if (this.engine.state === GAME_STATES.WON || this.engine.state === GAME_STATES.LOST) return;

                if (pointer.rightButtonDown()) {
                    this.handleRightClick(i);
                } else {
                    // Start long-press detection
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
                        // Short tap detected
                        this.longPressTimer.remove();
                        this.longPressTimer = null;
                        if (!tileContainer.getData('longPressed')) {
                            this.handleLeftClick(i);
                        }
                    }
                    // Reset flag for next interaction
                    tileContainer.setData('longPressed', false);
                }
            });

            bg.on('pointerout', () => {
                if (this.longPressTimer) {
                    this.longPressTimer.remove();
                    this.longPressTimer = null;
                }
            });

            // Prevent context menu
            this.input.mouse.disableContextMenu();
        }
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
        for (let i = 0; i < this.engine.grid.length; i++) {
            const cell = this.engine.grid[i];
            const tile = this.tiles[i];

            if (cell.isRevealed) {
                // Animate newly revealed tiles
                if (revealedIndices.includes(i) && tile.bg.fillColor !== this.theme.tileRevealed) {
                    this.tweens.add({
                        targets: tile.container,
                        scale: { from: 0.8, to: 1.0 },
                        duration: V2_CONFIG.TIMERS.REVEAL_TWEEN_MS,
                        ease: 'Back.easeOut'
                    });
                }

                tile.bg.setFillStyle(this.theme.tileRevealed);
                if (cell.isMine) {
                    tile.text.setText('💣');
                    tile.bg.setFillStyle(this.theme.tileMine);
                } else if (cell.neighborMines > 0) {
                    tile.text.setText(cell.neighborMines);
                    tile.text.setColor(this.theme.numberColors[cell.neighborMines]);
                } else {
                    tile.text.setText('');
                }
            } else if (cell.isFlagged) {
                tile.text.setText('🚩');
                tile.text.setColor(this.theme.tileMine === 0xe74c3c ? V2_CONFIG.UI.COLORS.LOSS : '#ff4444');
            } else if (cell.isQuestionMarked) {
                tile.text.setText('?');
                tile.text.setColor(V2_CONFIG.UI.COLORS.WHITE);
            } else {
                tile.text.setText('');
            }
        }
        
        // Notify UI scene about mine count change
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
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            lifespan: PARTICLES.WIN_LIFESPAN,
            quantity: PARTICLES.WIN_QUANTITY,
            tint: [ 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff ]
        });
        emitter.explode(PARTICLES.WIN_QUANTITY);
    }

    triggerLossParticles(container) {
        const { PARTICLES } = V2_CONFIG.UI;
        const emitter = this.add.particles(container.x, container.y, 'particle_rect', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 3, end: 0 },
            tint: [ 0xff0000, 0xff8800, 0x444444 ],
            lifespan: PARTICLES.LOSS_LIFESPAN,
            gravityY: -100,
            blendMode: 'NORMAL'
        });
        emitter.explode(PARTICLES.LOSS_QUANTITY);
    }
}
