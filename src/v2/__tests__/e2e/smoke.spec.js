import { test, expect } from '@playwright/test';

test.describe('V2 Minesweeper Bulletproof Smoke Test', () => {
    const failures = [];

    test.beforeEach(async ({ page }) => {
        failures.length = 0;

        page.on('console', msg => {
            if (msg.type() === 'error') {
                failures.push(`Console Error: ${msg.text()}`);
            }
        });

        page.on('requestfailed', request => {
            failures.push(`Network Failure: ${request.url()} - ${request.failure()?.errorText}`);
        });

        page.on('response', response => {
            if (response.status() >= 400) {
                failures.push(`Server Error: ${response.url()} - Status ${response.status()}`);
            }
        });

        page.on('pageerror', error => {
            failures.push(`Page Context Error: ${error.message}`);
        });
    });

    test('should load the game and all assets without any network interference', async ({ page }) => {
        // Step 1: Navigate to the origin to allow storage access
        await page.goto('/');
        
        // Step 2: Clean start (unregister SWs and clear storage)
        await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }
            window.localStorage.clear();
            window.sessionStorage.clear();
        });

        // Step 3: Reload to ensure a clean, SW-free load
        const response = await page.goto('/', { waitUntil: 'networkidle' });
        expect(response?.status(), 'Initial load failed').toBeLessThan(400);

        // Step 4: Explicitly verify critical assets are loaded
        const scripts = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('script')).map(s => s.src);
        });
        
        const hasMainJs = scripts.some(src => src.includes('main.js'));
        if (!hasMainJs) {
            failures.push('Deployment Error: main.js script tag not found in DOM.');
        }

        // Step 5: Verify Phaser initialization
        await page.waitForFunction(() => window.game !== undefined, { timeout: 10000 }).catch(() => {
            failures.push('Logic Error: Phaser (window.game) timed out during initialization.');
        });

        // Final aggregate assertion
        expect(failures, `CRITICAL FAILURES DETECTED:\n${failures.join('\n')}`).toHaveLength(0);
    });
});
