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
        // Wait for the MenuScene to be ready and buttons to be created
        await page.waitForFunction(() => {
            const menuScene = window.game.scene.getScene('MenuScene');
            // Check if buttons (Phaser.GameObjects.Text) exist in children list
            return menuScene.children && menuScene.children.list.length > 0;
        });

        // Click the BEGINNER button by simulating a click on its coordinates
        await page.evaluate(() => {
            const menuScene = window.game.scene.getScene('MenuScene');
            // The "BEGINNER" button is the second text object (index 1) after the title
            const btn = menuScene.children.list.find(c => c.text === 'BEGINNER');
            if (btn) {
                // Simulate pointerdown
                btn.emit('pointerdown');
            }
        });

        // Wait for GameScene and UIScene to be active
        await page.waitForFunction(() => {
            return window.game.scene.isActive('GameScene') && window.game.scene.isActive('UIScene');
        });

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
