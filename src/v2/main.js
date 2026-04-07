import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

import { themeManager } from './utils/ThemeManager';

// PWA registration is now handled automatically by vite-plugin-pwa (injectRegister: 'script')

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: themeManager.getTheme().bg,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        GameScene,
        UIScene
    ],
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
        window.game = game;
    }
});
