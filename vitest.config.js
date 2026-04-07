import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/__tests__/**/*.test.js'],
        globals: true,
        setupFiles: ['./src/js/__tests__/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/v2/**/*.js'],
            exclude: ['src/**/__tests__/**']
        }
    }
});
