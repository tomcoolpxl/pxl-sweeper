import { test, expect } from '@playwright/test';

test.describe('V2 Minesweeper Game', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        // Wait for Phaser to boot and expose window.game
        await page.waitForFunction(() => window.game !== undefined);
    });

    test('should boot and show the MenuScene', async ({ page }) => {
        const isMenuSceneActive = await page.evaluate(() => {
            return window.game.scene.isActive('MenuScene');
        });
        
        expect(isMenuSceneActive).toBe(true);
    });

    test('should transition to GameScene and UIScene when BEGINNER is selected', async ({ page }) => {
        // Wait for the MenuScene to be ready
        await page.waitForFunction(() => {
            return window.game.scene.getScene('MenuScene') !== null;
        });

        // Click the BEGINNER button
        await page.evaluate(() => {
            const menuScene = window.game.scene.getScene('MenuScene');
            
            // Search recursively for the button text
            const findBtn = (root) => {
                if (root.text === 'BEGINNER') return root;
                if (root.list) {
                    for (const child of root.list) {
                        const found = findBtn(child);
                        if (found) return found;
                    }
                }
                if (root.children && root.children.list) {
                    for (const child of root.children.list) {
                        const found = findBtn(child);
                        if (found) return found;
                    }
                }
                return null;
            };

            const btn = findBtn(menuScene);
            if (btn) {
                btn.emit('pointerdown');
            }
        });

        // Wait for GameScene and UIScene to be active
        await page.waitForFunction(() => {
            return window.game.scene.isActive('GameScene') && window.game.scene.isActive('UIScene');
        }, { timeout: 10000 });

        const isGameSceneActive = await page.evaluate(() => {
            return window.game.scene.isActive('GameScene');
        });
        expect(isGameSceneActive).toBe(true);

        const isUISceneActive = await page.evaluate(() => {
            return window.game.scene.isActive('UIScene');
        });
        expect(isUISceneActive).toBe(true);
    });
});
