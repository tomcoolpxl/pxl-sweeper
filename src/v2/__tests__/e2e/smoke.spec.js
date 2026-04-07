import { test, expect } from '@playwright/test';

test.describe('V2 Minesweeper Smoke Test', () => {
    const consoleErrors = [];
    const networkErrors = [];

    test.beforeEach(async ({ page }) => {
        consoleErrors.length = 0;
        networkErrors.length = 0;

        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        page.on('requestfailed', request => {
            networkErrors.push(`${request.url()}: ${request.failure()?.errorText}`);
        });

        page.on('response', response => {
            if (response.status() >= 500) {
                networkErrors.push(`${response.url()}: Status ${response.status()}`);
            }
        });
    });

    test('should load the page without any 500 errors or console crashes', async ({ page }) => {
        const response = await page.goto('/');
        
        // Check if the main page itself loaded successfully
        expect(response?.status()).toBeLessThan(400);

        // Wait for a reasonable amount of time for any async scripts to trigger errors
        await page.waitForTimeout(1000);

        // Assert no console errors
        expect(consoleErrors, `Console errors detected: ${consoleErrors.join(', ')}`).toHaveLength(0);

        // Assert no network errors (especially 500s)
        expect(networkErrors, `Network errors detected: ${networkErrors.join(', ')}`).toHaveLength(0);
        
        // Verify Phaser actually booted
        const phaserBooted = await page.evaluate(() => window.game !== undefined);
        expect(phaserBooted, 'Phaser game instance not found on window object').toBe(true);
    });
});
