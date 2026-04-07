# PXL Sweeper V2

A cross-platform Minesweeper game built with **Phaser 3** (WebGL/Canvas). Supports mouse, touch, and keyboard input with particle effects, Web Audio sound, and persistent highscores.

## Features

- **Three Difficulty Levels**: Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (16×30, 99 mines)
- **Guaranteed Safe Opening**: First click always lands on a blank cell — the clicked tile and all 8 neighbours are mine-free, so flood-fill always opens an area
- **Zero-Scroll Layout**: Board scales to fit any viewport; no scrolling required
- **Mouse, Touch & Keyboard**: Left/right click, long-press to flag on mobile, full arrow-key + Enter/Space keyboard navigation
- **Sound Effects**: Web Audio API — reveal, flag, win fanfare, loss rumble; mute toggle in HUD
- **Particle Effects**: Confetti on win, fire burst at the triggered mine on loss
- **Highscores**: Best times per difficulty persisted to `localStorage`, with new-record detection
- **Accessibility**: `aria-live` region announces game state; full keyboard play after pressing any arrow key

## How to Play

| Input | Action |
|---|---|
| Left-click / Tap | Reveal a cell |
| Right-click / Long-press (300 ms) | Flag / unflag a cell |
| Arrow keys | Navigate board (activates keyboard mode) |
| Enter | Reveal focused cell |
| Space | Flag focused cell |

Reveal all non-mine cells to win. Clicking a mine ends the game.

## Local Development

```bash
npm install          # install dependencies
npm start            # start dev server at http://localhost:5173
npm test             # run Vitest unit tests
npm run test:e2e     # run Playwright e2e tests
npm run test:coverage  # coverage report
npm run lint         # ESLint
npm run build        # production build
```

## Tech Stack

| Concern | Tool |
|---|---|
| Renderer | Phaser 3 (WebGL / Canvas fallback) |
| Build | Vite 6 |
| Unit tests | Vitest + jsdom |
| E2E tests | Playwright |
| Lint | ESLint |
| Audio | Web Audio API (no external files) |
| Storage | localStorage |

## Project Docs

- [`REQUIREMENTS_V2.md`](REQUIREMENTS_V2.md) — full functional specification
- [`CODE_REVIEW.md`](CODE_REVIEW.md) — architectural audit and quality assessment
- [`GEMINI.md`](GEMINI.md) — project workflow rules
