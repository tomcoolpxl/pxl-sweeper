import Phaser from 'phaser';
import { V2_CONFIG } from '../config';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const { width, height } = this.cameras.main;
        const { PRELOAD, UI } = V2_CONFIG;

        // Loading bar UI
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(PRELOAD.BG_COLOR, PRELOAD.BG_ALPHA);
        progressBox.fillRect(
            width / 2 - PRELOAD.BAR_WIDTH / 2, 
            height / 2 - PRELOAD.BAR_Y_OFFSET, 
            PRELOAD.BAR_WIDTH, 
            PRELOAD.BAR_HEIGHT
        );

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - PRELOAD.TEXT_Y_OFFSET,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: UI.COLORS.WHITE
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(PRELOAD.BAR_COLOR, 1);
            progressBar.fillRect(
                width / 2 - PRELOAD.BAR_INNER_WIDTH / 2, 
                height / 2 - (PRELOAD.BAR_INNER_HEIGHT / 2), 
                PRELOAD.BAR_INNER_WIDTH * value, 
                PRELOAD.BAR_INNER_HEIGHT
            );
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        const { PRELOAD } = V2_CONFIG;
        // Generate common textures here to act as a dynamic atlas
        if (!this.textures.exists('particle_rect')) {
            const size = PRELOAD.PARTICLE_TEXTURE_SIZE;
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, size, size);
            g.generateTexture('particle_rect', size, size);
        }

        this.scene.start('MenuScene');
    }
}
