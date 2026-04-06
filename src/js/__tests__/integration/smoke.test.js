import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Environmental Smoke Test', () => {
    it('should have type="module" on the main script tag to support exports', () => {
        const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
        // Simple regex or string check to ensure the module type is present
        expect(html).toContain('type="module"');
        expect(html).toContain('src="src/js/app.js"');
    });

    it('should have all required HUD elements in the HTML', () => {
        const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
        expect(html).toContain('id="mine-count-display"');
        expect(html).toContain('id="timer-display"');
        expect(html).toContain('id="restart-btn"');
    });
});
