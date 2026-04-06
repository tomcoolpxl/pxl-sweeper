# PXL Sweeper

A modern, minimalist Minesweeper clone built with vanilla JavaScript, CSS Grid, and zero external dependencies.

## Features

- **Three Difficulty Levels**:
  - Beginner: 9x9 board, 10 mines
  - Intermediate: 16x16 board, 40 mines
  - Expert: 30x16 board, 99 mines
- **First-Click Safety**: Your first reveal will never be a mine.
- **Zero-Expansion**: Clicking a cell with no neighboring mines automatically reveals the entire connected area.
- **Marking System**: Right-click to cycle through Flag (🚩), Question Mark (?), and Unmarked states.
- **Real-time HUD**: Includes a timer and a mine counter that updates based on flags placed.
- **Enhanced Visual Feedback**: Distinct styling for triggered mines, hidden mines, and incorrect flags on game loss.
- **Modern UI**: Clean design with smooth reveal animations and responsive grid centering.

## How to Play

1. **Left-Click**: Reveal a cell. If it's a mine, the game is over. If it's a number, it shows how many mines are in the 8 adjacent cells.
2. **Right-Click**: Mark a cell with a flag (🚩) if you think there's a mine, or a question mark (?) if you're unsure.
3. **Win**: Reveal all non-mine cells to win.
4. **Loss**: Clicking a mine ends the game. All remaining mines will be revealed.

## Technical Details

- **Language**: JavaScript (ES6+)
- **Styling**: CSS3 (CSS Grid, Flexbox, Custom Variables, Animations)
- **Structure**: Vanilla HTML5
- **Engine**: Custom iterative flood-fill algorithm for expansion logic.
- **Debug Mode**: Add `?debug` to the URL to enable console-based board visualization.

## Compatibility

Optimized for modern Chromium-based desktop browsers (Chrome, Edge, etc.).
