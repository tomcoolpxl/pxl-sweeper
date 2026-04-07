export const THEMES = {
    CLASSIC: {
        name: 'Classic',
        bg: 0x2c3e50,
        tileHidden: 0x95a5a6,
        tileRevealed: 0xbdc3c7,
        tileMine: 0xe74c3c,
        text: 0xffffff,
        uiBg: 0x34495e,
        accent: 0x3498db,
        numberColors: [
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
    DARK: {
        name: 'Dark',
        bg: 0x1a1a1a,
        tileHidden: 0x333333,
        tileRevealed: 0x444444,
        tileMine: 0x990000,
        text: 0xcccccc,
        uiBg: 0x222222,
        accent: 0x666666,
        numberColors: [
            '#cccccc', // 0
            '#5dade2', // 1
            '#58d68d', // 2
            '#ec7063', // 3
            '#af7ac5', // 4
            '#f4d03f', // 5
            '#48c9b0', // 6
            '#aab7b8', // 7
            '#566573'  // 8
        ]
    }
};

class ThemeManager {
    constructor() {
        this.currentTheme = THEMES.CLASSIC;
    }

    setTheme(key) {
        if (THEMES[key]) {
            this.currentTheme = THEMES[key];
        }
    }

    getTheme() {
        return this.currentTheme;
    }
}

export const themeManager = new ThemeManager();
