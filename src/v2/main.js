import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { V2_CONFIG } from './config';
import { soundManager } from './utils/SoundManager';
import ambientTrackUrl from '../../assets/Underwater-Ambient-Pad-isaiah658.ogg';

// #16: BootScene removed — PreloadScene is the entry point directly

soundManager.setBackgroundTrack(ambientTrackUrl);

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: V2_CONFIG.UI.COLORS.BOARD_BG,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
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
