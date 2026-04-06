# IMPLEMENTATION_PHASE3.md - Board Rendering and Basic Reveal

## Architectural Design

This phase bridges the memory-resident game engine (Phase 2) with the browser's Document Object Model (DOM). It introduces the `Game` controller and handles the transformation of logic into visual state.

### State Definitions
- **Game Status**: Although full state management is in Phase 4, Phase 3 needs a simple `gameStarted` boolean to know when to call `placeMines` (on the first click).
- **DOM-to-Logic Mapping**: Each DOM cell will have a `data-index` attribute corresponding to its index in the `Board.grid` array.

### Function Signatures
- `Game.prototype.init()`: Sets up event listeners for difficulty buttons and the restart button.
- `Game.prototype.newGame(difficulty)`: Resets the board, clears the DOM, and re-renders the grid.
- `Game.prototype.render()`: Dynamically generates cell divs and injects them into `#board-container`.
- `Game.prototype.handleLeftClick(event)`: Event delegation handler for cell clicks.
- `Game.prototype.revealCell(index)`: Updates the `Cell` object's `isRevealed` property and triggers a UI update.
- `Game.prototype.updateCellUI(index)`: Updates a single cell's DOM element based on its current state (revealing numbers or mines).

---

## File-Level Strategy

### `app.js`
- **Responsibility**: Implement the `Game` controller and DOM manipulation logic.
- **Key Sections**:
    - DOM element references.
    - Event listener setup.
    - Grid rendering logic.
    - Reveal handler.

### `style.css`
- **Responsibility**: Define visual styles for revealed states and number colors.
- **Key Sections**:
    - `.cell.revealed` styles (inset border, flat color).
    - `.cell.mine` (background or icon).
    - `.number-1` through `.number-8` color classes (Blue, Green, Red, Purple, Maroon, Turquoise, Black, Gray).

---

## Atomic Execution Steps

### Task 1: Implement DOM generation for the grid
- **Plan**: Create a `render()` method that clears `#board-container`, sets CSS variables `--grid-cols` and `--grid-rows`, and appends cell divs with `data-index`.
- **Act**: Update `app.js` to include a `Game` class or global initialization that handles board creation.
- **Validate**: Switch difficulties and verify the DOM correctly updates with the expected number of cells (e.g., 480 for Expert).

### Task 2: Implement left-click reveal handler
- **Plan**: Add a click listener to `#board-container`. If a hidden cell is clicked:
    1. If it's the first click, call `board.placeMines(index)`.
    2. Set `cell.isRevealed = true`.
    3. Call `updateCellUI(index)`.
- **Act**: Implement event delegation and the reveal logic.
- **Validate**: Clicking a cell should change its appearance (background color change) and show its content (number or mine).

### Task 3: Map revealed cell state to visual display (numbers 1-8)
- **Plan**: In `updateCellUI`, if a cell is revealed and not a mine, set its `innerText` to `neighborMines` (if > 0) and add a corresponding CSS class for coloring.
- **Act**: Add color rules to `style.css` and logic to `app.js`.
- **Validate**: Verify that a "1" appears blue, "2" appears green, and "3" appears red.

---

## Edge Case & Boundary Audit

- **Redundant Clicks**: Clicking an already revealed cell must do nothing.
- **First Click Safety (Partial)**: In Phase 3, we simply ensure `placeMines` happens on the first click. (Full mine relocation is Phase 5).
- **Expert Mode Performance**: Ensure DOM generation for 480 cells is performant (using a `DocumentFragment` is recommended).

---

## Verification Protocol

### UI Sync Check
- [ ] Select Beginner: 81 cells rendered.
- [ ] Select Expert: 480 cells rendered.
- [ ] Clicking a cell reveals its content.
- [ ] Neighbor counts 1-8 are distinctively colored.

### Interaction Logic
- [ ] First click always triggers mine placement (verified by check console logs).
- [ ] Revealed cells are no longer clickable.
- [ ] Board resets correctly when "Restart" is pressed.

---

## Code Scaffolding

### `style.css` Number Colors
```css
.n1 { color: #2980b9; } /* Blue */
.n2 { color: #27ae60; } /* Green */
.n3 { color: #c0392b; } /* Red */
.n4 { color: #8e44ad; } /* Purple */
.n5 { color: #7f8c8d; } /* Gray/Maroon */
.n6 { color: #16a085; } /* Turquoise */
.n7 { color: #2c3e50; } /* Black */
.n8 { color: #34495e; } /* Slate */

.cell.revealed.mine {
    background-color: #e74c3c;
}
```

### `app.js` Game Controller Skeleton
```javascript
class Game {
    constructor() {
        this.board = null;
        this.gameStarted = false;
        this.difficulty = DIFFICULTIES.BEGINNER;
        
        this.init();
    }

    init() {
        // Event listeners for buttons
        // First render
    }

    render() {
        const container = document.getElementById('board-container');
        // Clear and populate
    }

    handleCellClick(index) {
        // Logic for reveal and first-click safety
    }
}
```
