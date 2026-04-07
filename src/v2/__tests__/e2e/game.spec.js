import { test, expect } from '@playwright/test';

test.describe('V2 Minesweeper Game', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game !== undefined);
    });

    test('should boot and show the MenuScene', async ({ page }) => {
        const isMenuSceneActive = await page.evaluate(() => {
            return window.game.scene.isActive('MenuScene');
        });
        expect(isMenuSceneActive).toBe(true);
    });

    // #13: stable button access via scene property (no fragile recursive tree-walk)
    test('should transition to GameScene and UIScene when BEGINNER is selected', async ({ page }) => {
        await page.waitForFunction(() => {
            const s = window.game.scene.getScene('MenuScene');
            return s && s.beginnerBtn;
        });

        await page.evaluate(() => {
            window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown');
        });

        await page.waitForFunction(() => {
            return window.game.scene.isActive('GameScene') && window.game.scene.isActive('UIScene');
        }, { timeout: 10000 });

        expect(await page.evaluate(() => window.game.scene.isActive('GameScene'))).toBe(true);
        expect(await page.evaluate(() => window.game.scene.isActive('UIScene'))).toBe(true);
    });

    test('should render padded HUD counters in the game scene', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('UIScene'), { timeout: 5000 });

        const hud = await page.evaluate(() => {
            const ui = window.game.scene.getScene('UIScene');
            return {
                mines: ui.mineText.text,
                timer: ui.timerText.text
            };
        });

        expect(hud.mines).toBe('MINES 010');
        expect(hud.timer).toBe('TIME 000');
    });

    test('should open highscores from the menu', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.highscoresBtn);

        const title = await page.evaluate(() => {
            const menu = window.game.scene.getScene('MenuScene');
            menu.highscoresBtn.emit('pointerdown');
            return menu.children.list.find((child) => child.text === 'FASTEST TIMES')?.text || null;
        });

        expect(title).toBe('FASTEST TIMES');
    });

    // #10: gameplay e2e tests

    test('should reveal a safe cell on first click', async ({ page }) => {
        // Start a Beginner game
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('GameScene'), { timeout: 5000 });

        // Click cell 0 — first-click safety guarantees it will not be a mine
        const revealed = await page.evaluate(() => {
            const gs = window.game.scene.getScene('GameScene');
            gs.handleLeftClick(0);
            return gs.engine.grid[0].isRevealed;
        });
        expect(revealed).toBe(true);
    });

    test('should flag a cell on right-click', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('GameScene'), { timeout: 5000 });

        // Wait for game scene to fully initialise, then flag cell 5
        await page.waitForFunction(() => window.game.scene.getScene('GameScene')?.tiles?.length > 0);

        const flagged = await page.evaluate(() => {
            const gs = window.game.scene.getScene('GameScene');
            gs.handleRightClick(5);
            return gs.engine.grid[5].isFlagged;
        });
        expect(flagged).toBe(true);
    });

    test('should trigger LOST state when clicking a mine', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('GameScene'), { timeout: 5000 });
        await page.waitForFunction(() => window.game.scene.getScene('GameScene')?.tiles?.length > 0);

        const result = await page.evaluate(() => {
            const gs = window.game.scene.getScene('GameScene');
            // First click to place mines (cell 0 is always safe)
            gs.handleLeftClick(0);
            // Find a mine and click it
            const mineIndex = gs.engine.grid.findIndex(c => c.isMine);
            if (mineIndex !== -1) gs.handleLeftClick(mineIndex);
            return gs.engine.state;
        });
        expect(result).toBe('LOST');
    });

    test('view board should show all bombs after a loss, including unrevealed mines', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('GameScene'), { timeout: 5000 });
        await page.waitForFunction(() => window.game.scene.getScene('GameScene')?.tiles?.length > 0);

        const result = await page.evaluate(() => {
            const gameScene = window.game.scene.getScene('GameScene');
            const uiScene = window.game.scene.getScene('UIScene');

            gameScene.handleLeftClick(0);
            const mineIndices = gameScene.engine.grid
                .map((cell, index) => ({ cell, index }))
                .filter(({ cell }) => cell.isMine)
                .map(({ index }) => index);

            gameScene.handleLeftClick(mineIndices[0]);
            uiScene.reviewBtn.emit('pointerdown');

            const visibleMineCount = mineIndices.filter((index) => gameScene.tiles[index].text.text === '💣').length;

            return {
                mineCount: mineIndices.length,
                visibleMineCount
            };
        });

        expect(result.visibleMineCount).toBe(result.mineCount);
    });

    test('should return to the menu cleanly from view board and still open highscores', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('GameScene') && window.game.scene.isActive('UIScene'), { timeout: 5000 });
        await page.waitForFunction(() => window.game.scene.getScene('GameScene')?.tiles?.length > 0);

        const result = await page.evaluate(() => {
            const gameScene = window.game.scene.getScene('GameScene');
            const uiScene = window.game.scene.getScene('UIScene');

            gameScene.handleLeftClick(0);
            const mineIndex = gameScene.engine.grid.findIndex((cell) => cell.isMine);
            gameScene.handleLeftClick(mineIndex);
            uiScene.reviewBtn.emit('pointerdown');
            uiScene.returnToMenu();

            const menuScene = window.game.scene.getScene('MenuScene');
            menuScene.highscoresBtn.emit('pointerdown');

            return {
                menuActive: window.game.scene.isActive('MenuScene'),
                uiActive: window.game.scene.isActive('UIScene'),
                highscoreTitle: menuScene.children.list.find((child) => child.text === 'FASTEST TIMES')?.text || null
            };
        });

        expect(result.menuActive).toBe(true);
        expect(result.uiActive).toBe(false);
        expect(result.highscoreTitle).toBe('FASTEST TIMES');
    });

    test('should trigger WON state when all non-mine cells are revealed', async ({ page }) => {
        await page.waitForFunction(() => window.game.scene.getScene('MenuScene')?.beginnerBtn);
        await page.evaluate(() => window.game.scene.getScene('MenuScene').beginnerBtn.emit('pointerdown'));
        await page.waitForFunction(() => window.game.scene.isActive('GameScene'), { timeout: 5000 });
        await page.waitForFunction(() => window.game.scene.getScene('GameScene')?.tiles?.length > 0);

        const result = await page.evaluate(() => {
            const gs = window.game.scene.getScene('GameScene');
            // First click places mines
            gs.handleLeftClick(0);
            // Reveal all non-mine cells
            for (let i = 0; i < gs.engine.grid.length; i++) {
                if (!gs.engine.grid[i].isMine && !gs.engine.grid[i].isRevealed) {
                    gs.engine.revealCell(i);
                }
            }
            gs.engine.checkWinCondition();
            return gs.engine.state;
        });
        expect(result).toBe('WON');
    });
});
