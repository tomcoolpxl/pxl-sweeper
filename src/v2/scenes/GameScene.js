import Phaser from 'phaser';
import { MinesweeperEngine, GAME_STATES } from '../MinesweeperEngine';
import { soundManager } from '../utils/SoundManager';
import { themeManager } from '../utils/ThemeManager';

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
        const { width, height } = this.cameras.main;
        
        // Ensure particle texture exists for win/loss effects
        if (!this.textures.exists('particle_rect')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 4, 4);
            g.generateTexture('particle_rect', 4, 4);
        }

        this.calculateScaling();
        this.createBoard();

        // Launch UI Scene
        this.scene.launch('UIScene', { engine: this.engine });
    }

    calculateScaling() {
        const { width, height } = this.cameras.main;
        const hudHeight = 100; // Expected HUD space
        const availableWidth = width * 0.95; // 5% margin
        const availableHeight = (height - hudHeight) * 0.95;

        // Base tile size and padding
        const basePadding = 2;
        
        // Calculate required tile size to fit board in available space
        const tileW = (availableWidth / this.engine.cols) - basePadding;
        const tileH = (availableHeight / this.engine.rows) - basePadding;
        
        // Use the smaller of the two to maintain square tiles
        this.tileSize = Math.floor(Math.min(tileW, tileH, 32)); // Max 32px
        this.padding = basePadding;

        // Calculate board dimensions
        const boardWidth = this.engine.cols * (this.tileSize + this.padding);
        const boardHeight = this.engine.rows * (this.tileSize + this.padding);

        // Center board
        this.startX = (width - boardWidth) / 2 + (this.tileSize + this.padding) / 2;
        this.startY = (height - boardHeight) / 2 + (this.tileSize + this.padding) / 2 + (hudHeight / 4);
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
                color: '#ffffff'
            }).setOrigin(0.5);

            tileContainer.add([bg, text]);
            this.tiles[i] = { container: tileContainer, bg, text };

            // Input handlers
            bg.on('pointerdown', (pointer) => {
                if (this.engine.state === GAME_STATES.WON || this.engine.state === GAME_STATES.LOST) return;

                if (pointer.rightButtonDown()) {
                    this.handleRightClick(i);
                } else {
                    this.longPressTimer = this.time.delayedCall(300, () => {
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
            });

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
            this.triggerHaptic([100, 50, 100]);
            this.events.emit('game-won');
        } else if (this.engine.state === GAME_STATES.LOST) {
            soundManager.playLoss();
            this.triggerLossParticles(this.tiles[this.engine.triggeredMineIndex].container);
            this.triggerHaptic(200);
            this.events.emit('game-lost', this.engine.triggeredMineIndex);
        }
    }

    handleRightClick(index) {
        if (this.engine.grid[index].isRevealed) return;
        
        soundManager.playFlag();
        this.triggerHaptic(50);
        this.engine.toggleMark(index);
        this.updateBoardUI();
    }

    updateBoardUI(revealedIndices = []) {
        for (let i = 0; i < this.engine.grid.length; i++) {
            const cell = this.engine.grid[i];
            const tile = this.tiles[i];

            if (cell.isRevealed) {
                if (revealedIndices.includes(i) && tile.bg.fillColor !== this.theme.tileRevealed) {
                    this.tweens.add({
                        targets: tile.container,
                        scale: { from: 0.8, to: 1.0 },
                        duration: 150,
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
                tile.text.setColor(this.theme.tileMine === 0xe74c3c ? '#e74c3c' : '#ff4444');
            } else if (cell.isQuestionMarked) {
                tile.text.setText('?');
                tile.text.setColor('#ffffff');
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
        const emitter = this.add.particles(width / 2, height / 2, 'particle_rect', {
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            lifespan: 3000,
            quantity: 150,
            tint: [ 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff ]
        });
        emitter.explode(150);
    }

    triggerLossParticles(container) {
        const emitter = this.add.particles(container.x, container.y, 'particle_rect', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 3, end: 0 },
            tint: [ 0xff0000, 0xff8800, 0x444444 ],
            lifespan: 800,
            gravityY: -100,
            blendMode: 'NORMAL'
        });
        emitter.explode(50);
    }
}
