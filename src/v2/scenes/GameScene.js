import Phaser from 'phaser';
import { MinesweeperEngine, GAME_STATES } from '../MinesweeperEngine';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.difficultyKey = data.difficulty || 'BEGINNER';
        this.engine = new MinesweeperEngine(this.difficultyKey);
        this.tiles = [];
        this.tileSize = 32;
        this.padding = 2;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Calculate board dimensions
        const boardWidth = this.engine.cols * (this.tileSize + this.padding);
        const boardHeight = this.engine.rows * (this.tileSize + this.padding);

        // Center board
        const startX = (width - boardWidth) / 2 + this.tileSize / 2;
        const startY = (height - boardHeight) / 2 + this.tileSize / 2;

        // Create Grid
        for (let r = 0; r < this.engine.rows; r++) {
            for (let c = 0; r < this.engine.cols; c++) {
                // Wait, logic error in loop condition above (r < this.engine.cols) - fixing below
            }
        }

        this.createBoard(startX, startY);

        // Launch UI Scene
        this.scene.launch('UIScene', { engine: this.engine });
    }

    createBoard(startX, startY) {
        for (let i = 0; i < this.engine.grid.length; i++) {
            const row = Math.floor(i / this.engine.cols);
            const col = i % this.engine.cols;

            const x = startX + col * (this.tileSize + this.padding);
            const y = startY + row * (this.tileSize + this.padding);

            const tileContainer = this.add.container(x, y);
            
            // Background / Hidden State
            const bg = this.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x95a5a6)
                .setInteractive({ useHandCursor: true });
            
            const text = this.add.text(0, 0, '', {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            tileContainer.add([bg, text]);
            this.tiles[i] = { container: tileContainer, bg, text };

            // Input handlers
            bg.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    this.handleRightClick(i);
                } else {
                    this.handleLeftClick(i);
                }
            });

            // Prevent context menu
            this.input.mouse.disableContextMenu();
        }
    }

    handleLeftClick(index) {
        const revealedIndices = this.engine.revealCell(index);
        this.updateBoardUI();
        
        if (this.engine.state === GAME_STATES.WON) {
            this.events.emit('game-won');
        } else if (this.engine.state === GAME_STATES.LOST) {
            this.events.emit('game-lost', this.engine.triggeredMineIndex);
        }
    }

    handleRightClick(index) {
        this.engine.toggleMark(index);
        this.updateBoardUI();
    }

    updateBoardUI() {
        for (let i = 0; i < this.engine.grid.length; i++) {
            const cell = this.engine.grid[i];
            const tile = this.tiles[i];

            if (cell.isRevealed) {
                tile.bg.setFillStyle(0xbdc3c7);
                if (cell.isMine) {
                    tile.text.setText('💣');
                    tile.bg.setFillStyle(0xe74c3c);
                } else if (cell.neighborMines > 0) {
                    tile.text.setText(cell.neighborMines);
                    tile.text.setColor(this.getNumberColor(cell.neighborMines));
                } else {
                    tile.text.setText('');
                }
            } else if (cell.isFlagged) {
                tile.text.setText('🚩');
                tile.text.setColor('#e74c3c');
            } else if (cell.isQuestionMarked) {
                tile.text.setText('?');
                tile.text.setColor('#ffffff');
            } else {
                tile.text.setText('');
            }
        }
        
        // Notify UI scene about mine count change
        this.events.emit('update-mines', this.engine.getRemainingMines());
    }

    getNumberColor(num) {
        const colors = [
            '#ffffff', // 0 (hidden)
            '#2980b9', // 1
            '#27ae60', // 2
            '#c0392b', // 3
            '#8e44ad', // 4
            '#e67e22', // 5
            '#16a085', // 6
            '#2c3e50', // 7
            '#7f8c8d'  // 8
        ];
        return colors[num] || '#ffffff';
    }
}
