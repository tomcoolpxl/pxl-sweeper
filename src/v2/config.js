export const V2_CONFIG = {
    // Layout & Scaling
    LAYOUT: {
        HUD_HEIGHT: 100,
        BASE_PADDING: 2,
        MAX_TILE_SIZE: 32,
        MARGIN_PERCENT: 0.95,
        UI_PADDING: 20
    },
    // Timers & Delays
    TIMERS: {
        LONG_PRESS_MS: 300,
        THROTTLE_REVEAL_SFX_MS: 50,
        GAMEOVER_FADE_MS: 500,
        TIMER_INTERVAL_MS: 1000,
        REVEAL_TWEEN_MS: 150
    },
    // Haptics
    HAPTICS: {
        WIN: [100, 50, 100],
        LOSS: 200,
        FLAG: 50
    },
    // Accessibility
    A11Y: {
        HUD_ID: 'a11y-hud'
    },
    // UI Visuals
    UI: {
        MODAL: {
            WIDTH: 300,
            HEIGHT: 200,
            TUTORIAL_WIDTH: 500,
            TUTORIAL_HEIGHT: 350,
            BG: 0x34495e,
            DIMMER_ALPHA: 0.7
        },
        COLORS: {
            WHITE: '#ffffff',
            WIN: '#27ae60',
            LOSS: '#e74c3c',
            MENU_BG: '#34495e',
            BTN_BLUE: '#3498db',
            BTN_GREY: '#7f8c8d',
            BTN_ORANGE: '#e67e22',
            BTN_BG: '#ecf0f1',
            BTN_HOVER: '#bdc3c7'
        },
        PARTICLES: {
            WIN_QUANTITY: 150,
            WIN_LIFESPAN: 3000,
            LOSS_QUANTITY: 50,
            LOSS_LIFESPAN: 800
        }
    }
};
