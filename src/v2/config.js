export const V2_CONFIG = {
    // Layout & Scaling
    LAYOUT: {
        HUD_HEIGHT: 80, // Reduced from 100 to save space
        BASE_PADDING: 2,
        MAX_TILE_SIZE: 32,
        MARGIN_PERCENT: 0.90, // Reduced from 0.95 to ensure clear safety margins
        UI_PADDING: 20,
        BOARD_OFFSET_Y_DIV: 4
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
            DIMMER_ALPHA: 0.7,
            TITLE_OFFSET_Y: 140,
            CLOSE_BTN_OFFSET_Y: 130,
            STATS_OFFSET_Y: 20,
            STATUS_OFFSET_Y: 80,
            PLAY_AGAIN_OFFSET_Y: 50,
            MAIN_MENU_OFFSET_Y: 110
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
            BTN_HOVER: '#bdc3c7',
            BLACK: 0x000000,
            DIMMER: 0x000000
        },
        PARTICLES: {
            WIN_QUANTITY: 150,
            WIN_LIFESPAN: 3000,
            LOSS_QUANTITY: 50,
            LOSS_LIFESPAN: 800,
            WIN_SPEED_MIN: 200,
            WIN_SPEED_MAX: 400,
            LOSS_SPEED_MIN: 50,
            LOSS_SPEED_MAX: 150,
            LOSS_GRAVITY_Y: -100
        },
        MENU: {
            TITLE_Y_DIV: 4,
            BTN_START_Y_PCT: 0.45,
            BTN_SPACING: 60,
            THEME_BTN_OFFSET_Y: 50,
            TUTORIAL_OFFSET_Y_SPACING: 4.3 // Adjusted to 4.3 to match actual code
        }
    },
    // Preload Constants
    PRELOAD: {
        BAR_WIDTH: 320,
        BAR_HEIGHT: 50,
        BAR_INNER_WIDTH: 300,
        BAR_INNER_HEIGHT: 30,
        BAR_Y_OFFSET: 25,
        TEXT_Y_OFFSET: 50,
        BG_COLOR: 0x222222,
        BG_ALPHA: 0.8,
        BAR_COLOR: 0xffffff,
        PARTICLE_TEXTURE_SIZE: 4
    },
    // Sound Constants
    SOUNDS: {
        REVEAL: {
            FREQ_START: 400,
            FREQ_END: 800,
            GAIN: 0.1,
            DURATION: 0.05
        },
        FLAG: {
            FREQ_START: 300,
            FREQ_END: 100,
            GAIN: 0.2,
            DURATION: 0.1
        },
        WIN: {
            NOTES: [440, 554.37, 659.25, 880],
            GAIN: 0.1,
            SPACING: 0.1,
            DURATION: 0.2
        },
        LOSS: {
            FREQ_START: 100,
            FREQ_END: 10,
            GAIN: 0.3,
            DURATION: 0.5
        }
    },
    // Engine Defaults
    ENGINE: {
        EXCLUDE_DEFAULT: -1
    }
};
