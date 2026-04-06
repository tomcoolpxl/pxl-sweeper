import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Environmental Smoke Test', () => {
    it('should have type="module" on the main script tag pointing to v2/main.js', () => {
        const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
        expect(html).toContain('type="module"');
        expect(html).toContain('src="/src/v2/main.js"');
    });

    it('should have the Phaser game container in the HTML', () => {
        const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
        expect(html).toContain('id="game-container"');
    });
});
