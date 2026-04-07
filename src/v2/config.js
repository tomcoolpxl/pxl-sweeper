export const V2_CONFIG = {
    // Layout & Scaling
    LAYOUT: {
        HUD_HEIGHT: 108,
        BASE_PADDING: 2,
        MAX_TILE_SIZE: 32,
        MARGIN_PERCENT: 0.90,
        UI_PADDING: 20,
        BOARD_OFFSET_Y_DIV: 4,
        SCENE_MARGIN: 28,
        PLAYFIELD_PADDING: 24,
        HUD_BAR_HEIGHT: 76
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
            WIDTH: 400,
            HEIGHT: 250,
            TUTORIAL_WIDTH: 500,
            TUTORIAL_HEIGHT: 350,
            BG: 0x34495e,
            DIMMER_ALPHA: 0.5, // Reduced to see board better
            TITLE_OFFSET_Y: 100,
            CLOSE_BTN_OFFSET_Y: 100,
            STATS_OFFSET_Y: 20,
            STATUS_OFFSET_Y: 70,
            PLAY_AGAIN_OFFSET_Y: 40,
            MAIN_MENU_OFFSET_Y: 90
        },
        COLORS: {
            WHITE: '#ffffff',
            WIN: '#27ae60',
            LOSS: '#e74c3c',
            MENU_BG: '#34495e',
            MENU_BG_DEEP: 0x07111f,
            MENU_BG_MID: 0x10233a,
            MENU_GRID: 0x214461,
            MENU_PANEL: 0x0d1d30,
            MENU_PANEL_INNER: 0x16314f,
            MENU_PANEL_BORDER: 0x7ee0ff,
            MENU_PANEL_SHADOW: 0x040a12,
            MENU_TEXT_MUTED: '#8fb3d1',
            MENU_TEXT_SOFT: '#cfe6ff',
            MENU_CARD: 0x10243a,
            MENU_CARD_BORDER: 0x355b7b,
            MENU_CARD_SHADOW: 0x06101b,
            MENU_UTILITY: 0x152b44,
            MENU_UTILITY_BORDER: 0x4a6787,
            ACCENT_CYAN: 0x4cc9f0,
            ACCENT_GOLD: 0xf4b942,
            ACCENT_RED: 0xff6b6b,
            ACCENT_GREEN: 0x4dd599,
            FOCUS_YELLOW: 0xf4e285,
            BTN_BLUE: '#3498db',
            BTN_GREY: '#7f8c8d',
            BTN_ORANGE: '#e67e22',
            BTN_BG: '#ecf0f1',
            BTN_HOVER: '#bdc3c7',
            BLACK: 0x000000,
            DIMMER: 0x000000,
            BOARD_BG: 0x081522,
            TILE_HIDDEN: 0x16314f,
            TILE_HIDDEN_BORDER: 0x3b678b,
            TILE_REVEALED: 0xcdd8e4,
            TILE_REVEALED_BORDER: 0x8ba9c4,
            TILE_MINE: 0xe74c3c,
            TILE_MINE_BORDER: 0xff9a9a,
            FLAG: '#e74c3c',
            NUMBERS: [
                '#ffffff', // 0
                '#2980b9', // 1
                '#27ae60', // 2
                '#c0392b', // 3
                '#8e44ad', // 4
                '#e67e22', // 5
                '#16a085', // 6
                '#2c3e50', // 7
                '#7f8c8d'  // 8
            ]
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
            TITLE_Y_OFFSET: -180,
            BTN_SPACING: 65,
            SUBTITLE_Y_OFFSET: -142,
            PANEL_WIDTH: 920,
            PANEL_HEIGHT: 560,
            PANEL_RADIUS: 28,
            CARD_WIDTH: 220,
            CARD_HEIGHT: 164,
            CARD_RADIUS: 22,
            CARD_GAP: 22,
            UTILITY_WIDTH: 230,
            UTILITY_HEIGHT: 58,
            UTILITY_RADIUS: 16,
            UTILITY_GAP: 18,
            CONTAINER_Y_PCT: 0.53,
            MOBILE_BREAKPOINT: 700,
            TABLET_BREAKPOINT: 980,
            BACKDROP_DOT_COUNT: 18
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
