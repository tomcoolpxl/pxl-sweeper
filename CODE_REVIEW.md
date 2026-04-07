# CODE_REVIEW.md — PXL Sweeper V2

**Reviewer:** Senior Principal Engineer / SDET
**Date:** 2026-04-07
**Scope:** Full codebase audit — architecture, quality, testing, UX, requirement traceability

---

## Executive Summary

**Score: 6 / 10**

The engine layer (`MinesweeperEngine.js`) is genuinely well-written: pure, UI-agnostic, correctly implements first-click safety and flood-fill, and is the clear highlight of the codebase. However the UI layer contains a confirmed runtime bug that silently breaks "Play Again", two module-level singletons that crash in non-browser environments, magic array-index access in a resize handler that is one refactor away from a production outage, and a test suite that covers only one of six source modules. The gap between requirement ambition and current implementation is significant.

---

## Architecture & Design

### Strengths

- **Engine/Scene separation is correct in principle.** `MinesweeperEngine` has zero Phaser or DOM dependency. It can be unit-tested in isolation with jsdom — this is the right call.
- **`V2_CONFIG` as a single configuration object** (`src/v2/config.js`) avoids scattered magic numbers throughout the codebase. All timing, layout, sound, and particle values are centralised.
- **Scene lifecycle is used appropriately.** `init()` for per-launch state, `create()` for construction, `launch()` for the parallel UIScene. This follows Phaser idioms.
- **`HighscoreManager` and `SoundManager` as dedicated utility classes** correctly separate cross-cutting concerns from scene logic.

### Issues

#### UIScene is coupled to GameScene's internal engine reference
`UIScene.init()` (`UIScene.js:11`) receives the engine instance directly as `data.engine`. This makes UIScene tightly coupled to GameScene's private state. A scene re-launch can cause the engine reference to become stale without warning. The scenes already communicate via events (`update-mines`, `game-won`, `game-lost`) — prefer event-only coupling.

#### GameScene is approaching a God Object
`GameScene.js` (219 lines) handles: board layout math, tile creation, input routing, long-press detection, sound triggering, haptic feedback, particle effect emission, and win/loss orchestration. Each of those is a distinct responsibility. At 219 lines it is not yet unmanageable, but the direction is wrong.

#### V1 (`src/js/app.js`) is dead code living in the repo
`app.js` is 663 lines of the original DOM implementation. It is not imported anywhere in V2. It is included in the lint glob, which adds noise. Either delete it or move it to a clearly-marked archive directory.

#### `BootScene` adds zero value
`BootScene` does nothing except immediately start `PreloadScene`. Phaser supports setting the first scene directly in the config. This empty-scene pattern adds confusion with no benefit.

---

## Implementation & Code Quality

### Confirmed Bug: `engine.difficultyKey` does not exist

**File:** `UIScene.js:88`
```js
this.scene.start('GameScene', { difficulty: this.engine.difficultyKey });
```

`MinesweeperEngine` stores `this.difficulty` (the config object `{ rows, cols, mines }`) and never sets `this.difficultyKey`. At runtime, `this.engine.difficultyKey` is `undefined`. The "PLAY AGAIN" button silently passes `{ difficulty: undefined }` to GameScene, which defaults to `'BEGINNER'`. An Expert player clicking "Play Again" gets a Beginner board.

**Fix:** Add `this.difficultyKey = difficultyKey;` to `MinesweeperEngine.constructor()` (`MinesweeperEngine.js:31`).

---

### SoundManager crashes at module import in any non-browser environment

**File:** `SoundManager.js:5`
```js
this.ctx = new (window.AudioContext || window.webkitAudioContext)();
```

This executes at module import time with no guard. In jsdom, `window.AudioContext` is undefined and this throws. Any test that directly or transitively imports `SoundManager` will fail. This is why `SoundManager` has zero test coverage — it cannot even be imported in the test environment.

Additionally, `AudioContext` in modern browsers starts in a `suspended` state until a user gesture (Chrome autoplay policy). The code never calls `this.ctx.resume()` before playback. The first reveal sound will silently fail.

---

### HighscoreManager executes `localStorage` in its constructor at module import time

**File:** `HighscoreManager.js:5`
```js
this.scores = this.loadScores(); // calls localStorage.getItem immediately
```

Same pattern as SoundManager: instantiated as a module-level singleton, calls a browser API in the constructor. A Node environment without jsdom setup will throw. Lazy initialisation (call `loadScores()` on first access, not at construction) fixes both singletons.

---

### `disableContextMenu()` called once per tile, inside the creation loop

**File:** `GameScene.js:113`
```js
// Inside for (let i = 0; i < this.engine.grid.length; i++) { ... }
this.input.mouse.disableContextMenu();
```

This calls the same Phaser method 81 times (Beginner), 256 times (Intermediate), or 480 times (Expert) per game start. Move this call to once, before or after the loop.

---

### `updateBoardUI` is O(n²) due to `Array.includes` inside a loop

**File:** `GameScene.js:154`
```js
if (revealedIndices.includes(i) && tile.bg.fillColor !== UI.COLORS.TILE_REVEALED) {
```

`revealedIndices` is an array. `.includes()` is O(n). Called inside a loop over all grid cells (n). For an Expert board with a large zero-expansion cascade, this becomes O(480 × cascade_size). Convert `revealedIndices` to a `Set` before the loop for O(1) lookup.

---

### `handleResize` accesses overlay children by magic integer index

**File:** `UIScene.js:168–180`
```js
const dimmer     = this.overlay.list[0];
const modal      = this.overlay.list[1];
const playAgainBtn = this.overlay.list[4];
const mainMenuBtn  = this.overlay.list[5];
const reviewBtn    = this.overlay.list[6];
```

The overlay container child order is documented only by insertion order in `create()`. If any child is added, removed, or reordered, these indices silently point to wrong elements and cause a runtime crash at next resize. Store named references (`this.dimmer`, `this.modal`, etc.) in `create()` and use them directly in `handleResize()`.

---

### `confirm()` used in a game context

**File:** `MenuScene.js:135`
```js
if (confirm('Clear all scores?')) {
```

`window.confirm()` is a blocking native dialog: it freezes the Phaser render loop, cannot be styled to match the game, and is disallowed in some embedded/iframe contexts. Replace with an in-game confirmation modal consistent with the existing UI style.

---

### Local `spacing` variable duplicates a config value

**File:** `MenuScene.js:44`
```js
const spacing = 65;
```

`V2_CONFIG.UI.MENU.BTN_SPACING` is already `65`. The local variable shadows the config, meaning these two values can drift independently. Use `UI.MENU.BTN_SPACING` from config directly.

---

### `longPressed` flag is not reset on `pointerout`

**File:** `GameScene.js:106–111`
```js
bg.on('pointerout', () => {
    if (this.longPressTimer) {
        this.longPressTimer.remove();
        this.longPressTimer = null;
    }
    // Missing: tileContainer.setData('longPressed', false);
});
```

The timer is correctly cancelled on pointer-out, but `longPressed` is never cleared. If the user starts a long-press, moves off the tile, then returns and releases, `longPressed` is still `true` from the previous interaction and suppresses the left-click reveal.

---

### Modal dimensions in UIScene ignore the config

**File:** `UIScene.js:60`
```js
const modal = this.add.rectangle(width / 2, height / 2, 400, 350, UI.MODAL.BG);
```

`V2_CONFIG.UI.MODAL.WIDTH` is `400` and `V2_CONFIG.UI.MODAL.HEIGHT` is `250`. The literal `350` used here is not in config at all. Inconsistency between config and usage is exactly the class of drift that causes hard-to-find visual bugs.

---

## Testing & Stability

### Coverage by module

| Module | Unit Tests | E2E Coverage |
|---|---|---|
| `MinesweeperEngine.js` | ✅ 7 meaningful tests | Indirect |
| `HighscoreManager.js` | ❌ None | None |
| `SoundManager.js` | ❌ None (cannot import) | None |
| `GameScene.js` | ❌ None | Partial (transition only) |
| `UIScene.js` | ❌ None | None |
| `MenuScene.js` | ❌ None | Partial (button click) |

5 of 6 source modules have zero unit test coverage.

### Engine tests: good but incomplete

`engine.test.js` correctly uses AAA pattern, resets state in `beforeEach`, and tests happy-path and boundary conditions. Missing cases:

- `revealCell` on an already-revealed cell (should return `[]` without side effects)
- `toggleMark` on a revealed cell (should be a no-op)
- `toggleMark` when state is `WON` or `LOST`
- `getRemainingMines()` after auto-flag on win
- `revealCell` with an out-of-bounds index (no guard — currently throws `TypeError`)

### Zero-expansion test has a misleading comment

**File:** `engine.test.js:55`
```js
// Corners/Edges next to mine should NOT be revealed if they are not neighbors of a 0
expect(engine.grid[8].isRevealed).toBe(false); // mine — this is correct
```

In the 3×3 test setup with mine at index 8, revealing index 0 (which has `neighborMines=0`) cascades through indices 1, 2, 3, 4, 5, 6, and 7 — the entire non-mine area. Indices 2, 5, 6, and 7 are also revealed but not asserted. The comment is incorrect. The test passes because it happens to omit the un-asserted cells, not because the behaviour is wrong. The assertions should be completed.

### E2E tests rely on internal Phaser scene graph traversal

**File:** `game.spec.js:29–46`
```js
const findBtn = (root) => {
    if (root.text === 'BEGINNER') return root;
    if (root.list) { for (const child of root.list) { ... } }
    if (root.children && root.children.list) { ... }
```

This recursive Phaser-internals walk is fragile. Any change to container hierarchy or button label breaks it silently. Prefer adding `setName()` to interactive elements and selecting by name.

### No e2e tests cover actual gameplay

The e2e suite tests: (1) the page loads, (2) MenuScene is active, (3) clicking BEGINNER transitions to GameScene+UIScene. There is no test that reveals a cell, flags a cell, triggers a win, or triggers a loss. These are the core user flows and are entirely untested end-to-end.

---

## UX & Accessibility

### Strengths
- `aria-live="polite"` region (`#a11y-hud`) is correctly implemented in `index.html` and populated via `UIScene.updateA11y()`.
- `overflow: hidden` on the body correctly enforces the zero-scroll mandate.
- Haptic feedback is correctly guarded with `if (window.navigator && window.navigator.vibrate)`.
- Long-press (300ms) for mobile flagging is correctly implemented and consistent with the requirement.

### Issues

- **No keyboard navigation.** There is no way to play with a keyboard — no focus management, no arrow-key cell selection, no Enter-to-reveal, no Space-to-flag. This is a significant accessibility gap.
- **Modal does not trap focus.** When game-over or tutorial modals open, keyboard focus remains wherever it was. Screen readers will not navigate into the modal.
- **Timer format inconsistency.** The HUD timer pads to 3 digits (`Time: 042`), but the game-over stats show raw seconds (`TIME: 42s`). Pick one format and use it everywhere.
- **No mute control.** Sound plays immediately with no user-accessible toggle. `SoundManager.enabled` exists but is never exposed in the UI.
- **`confirm()` dialog** is visually inconsistent with the rest of the game (see Code Quality section).

---

## Error Handling & Logic Integrity

### First-click safety: correctly implemented
`MinesweeperEngine.placeMines(excludeIndex)` (`MinesweeperEngine.js:48`) correctly excludes the first-clicked index. Lazy mine placement (only triggered on first `revealCell`) is the correct approach.

### No bounds checking on `revealCell`
`MinesweeperEngine.revealCell(startIndex)` performs no bounds check. If `startIndex < 0` or `startIndex >= grid.length`, accessing `this.grid[startIndex]` returns `undefined` and the subsequent property access throws a TypeError. `GameScene` computes the index safely via a bounded loop, so this is safe in practice — but the engine has no defensive boundary.

### `placeMines` can infinite-loop on pathological inputs
If `mineCount >= grid.length` (impossible with valid config but conceivable with programmatic use), the `while` loop has no termination condition. A precondition guard (`if (this.mineCount >= this.grid.length) throw new Error(...)`) eliminates the risk.

### AudioContext suspended state never resumed
Modern browsers auto-suspend `AudioContext` until after a user gesture. `SoundManager` never calls `this.ctx.resume()`. The first sound on first click will silently fail in Chrome and Safari. Add `if (this.ctx.state === 'suspended') this.ctx.resume();` at the start of each `play*()` method.

---

## Requirement Traceability

### REQUIREMENTS_V2.md compliance

| Requirement | Status | Notes |
|---|---|---|
| Phaser 3 engine | ✅ Met | Phaser 3.90.0 |
| WebGL/Canvas fallback | ✅ Met | `Phaser.AUTO` |
| Texture Atlases | ❌ Not met | `particle_rect` dynamically generated; no atlas |
| Fit-to-viewport / zero-scroll | ✅ Met | `Scale.FIT` + `calculateScaling()` |
| Tap to reveal | ✅ Met | |
| Long-press to flag (300ms) | ✅ Met | |
| Haptic feedback | ✅ Met | Guarded `navigator.vibrate` |
| Pinch-to-zoom | ❌ Not met | No implementation |
| PWA (manifest + SW) | ❌ Removed | Intentionally removed; requirement text needs update |
| Tile reveal SFX | ✅ Met | Web Audio sine sweep |
| Flag SFX | ✅ Met | Triangle wave |
| Win fanfare | ✅ Met | 4-note chord sequence |
| Loss SFX | ✅ Met | Sawtooth sweep |
| UI interaction SFX | ❌ Not met | Buttons have no sound |
| Win particles | ✅ Met | 150-particle confetti |
| Loss particles | ✅ Met | Fire-colour burst at mine location |
| Tile reveal tweens | ✅ Met | scale 0.8→1.0, Back.easeOut |
| Custom fonts | ❌ Not met | System `monospace` only |
| Theme infrastructure | ❌ Not met | Config has hover colour; no theme switching |
| Animated menu background | ❌ Not met | Static background |
| Main menu with difficulty | ✅ Met | |
| Game Over overlay with stats | ✅ Met | |
| New record indicator | ✅ Met | |
| Interactive tutorial | ⚠️ Partial | Text-only; not a visual walkthrough |
| 60 FPS target | ✅ Likely met | No heavy per-frame work |
| <5MB load | ✅ Likely met | No large assets bundled |
| V1 highscore migration | ❌ Not met | Different storage key, no migration logic |

---

## Actionable Recommendations

Ordered by severity.

### Critical — fix before next release

**1. Fix `engine.difficultyKey` bug**
Add `this.difficultyKey = difficultyKey;` to `MinesweeperEngine.constructor()` (`MinesweeperEngine.js:31`). This is a confirmed silent runtime bug breaking "Play Again" for every difficulty except Beginner.

**2. Guard `SoundManager` and `HighscoreManager` against non-browser environments**
Lazy-initialise `AudioContext` and `localStorage` access: initialise on first use, not in constructors. This unblocks writing unit tests for both modules.

**3. Call `AudioContext.resume()` before first playback**
Add `if (this.ctx.state === 'suspended') this.ctx.resume();` at the top of each `play*()` method. Without this, sound silently fails on first user gesture in Chrome/Safari.

### High — fix this sprint

**4. Replace magic index access in `UIScene.handleResize`**
Store named references (`this.dimmer`, `this.modal`, etc.) in `create()`. Using `this.overlay.list[4]` is one container change away from a silent breakage.

**5. Fix `Array.includes` inside `updateBoardUI` loop**
Convert `revealedIndices` to a `Set` before the loop. One line change, eliminates O(n²) behaviour on large cascade reveals.

**6. Move `disableContextMenu()` outside the tile creation loop**
`GameScene.js:113` — call it once after the loop. Currently called `rows × cols` times per game start.

**7. Reset `longPressed` flag in `pointerout` handler**
Add `tileContainer.setData('longPressed', false);` in the `pointerout` callback to prevent stale flag state on tile re-entry.

**8. Replace `confirm()` with an in-game modal**
`MenuScene.js:135` — the blocking native dialog is inconsistent with game style and disallowed in some browser contexts.

### Medium — next sprint

**9. Add unit tests for `HighscoreManager` and `SoundManager`**
Once lazy initialisation is in place (recommendation 2), these become trivially testable. Mock `localStorage` with Vitest's built-in facility; mock `AudioContext` with a stub. Target: full branch coverage of both modules.

**10. Add gameplay e2e tests**
At minimum: reveal a safe tile, flag a tile, trigger a loss (click a mine), trigger a win. These are the four core user flows and are entirely untested end-to-end.

**11. Add missing engine test cases**
`revealCell` on a revealed cell, `toggleMark` on a revealed cell, `toggleMark` in WON/LOST state, `getRemainingMines()` after auto-flag on win, out-of-bounds index handling.

**12. Use `UI.MENU.BTN_SPACING` from config in `MenuScene`**
Remove the local `spacing = 65` variable at `MenuScene.js:44` and reference the config directly.

**13. Add `setName()` to interactive Phaser objects**
Replace the fragile recursive `findBtn` tree-walk in `game.spec.js` with `scene.getByName()`. Stabilises e2e tests against refactors.

**14. Update `REQUIREMENTS_V2.md` to reflect removed PWA requirement**
Section 3 still lists "PWA: manifest + Service Worker" as a mandate. The implementation intentionally removed PWA. The requirements document should reflect reality.

### Low — backlog

**15. Remove or archive `src/js/app.js`**
663 lines of dead code. Delete it or move to `archive/v1/`. Remove its glob from the `lint` script if deleted.

**16. Remove the empty `BootScene`**
Set `PreloadScene` as the first scene in `main.js` directly. Eliminates an unnecessary scene hop.

**17. Add keyboard controls for accessibility**
Arrow keys to navigate cells, Enter to reveal, Space to flag. This is the largest single accessibility gap.

**18. Add a mute/unmute button to the HUD**
`SoundManager.enabled` already exists. Wire it to a toggle button in UIScene.

**19. Unify timer display format**
Pad everywhere (`042s`) or use raw numbers everywhere. Currently `Time: 042` in the HUD vs `TIME: 42s` in the game-over modal.

**20. Add bounds check and mine-count precondition to `MinesweeperEngine`**
Guard `revealCell` against out-of-bounds indices. Guard `placeMines` against `mineCount >= grid.length`.
