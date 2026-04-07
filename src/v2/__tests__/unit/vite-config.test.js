import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Vite config', () => {
    it('uses a relative base path so GitHub Pages project deployments resolve assets correctly', () => {
        const viteConfigPath = resolve(process.cwd(), 'vite.config.js');
        const viteConfigSource = readFileSync(viteConfigPath, 'utf8');

        expect(viteConfigSource).toContain("base: './'");
    });
});
