# IMPLEMENTATION_PHASE1.md

## Architectural Design

The goal of this phase is to establish the static skeleton of the PXL Sweeper application. The design focuses on high-contrast, modern UI elements and a flexible layout that accommodates the varying grid sizes of the three difficulty presets.

### HTML Structure
- **Container**: A central wrapper `#app` to keep the game centered.
- **HUD (Heads-Up Display)**: 
    - `#mine-count-display`: Left-aligned counter.
    - `#restart-btn`: Central control button.
    - `#timer-display`: Right-aligned clock.
- **Difficulty Selector**: A dedicated div `#difficulty-controls` containing buttons for Beginner, Intermediate, and Expert.
- **Game Board**: A `#board-container` that will serve as the parent for dynamically generated grid cells.

### CSS Strategy
- **Layout**: Flexbox for the vertical stack (Controls -> HUD -> Board).
- **Grid**: The `#board-container` will use `display: grid`. The number of columns and rows will be set via CSS Variables (`--grid-cols`, `--grid-rows`) to be injected by JavaScript in later phases.
- **Responsiveness**: Use `min-width` and `overflow` handling to ensure the 30x16 Expert grid is playable on desktop viewports without breaking the HUD.
- **Theming**: A modern dark or "clean light" palette using CSS variables for colors (e.g., `--bg-color`, `--cell-color`, `--cell-hover-color`).

### Visual Symbol Strategy
To ensure consistency across resolutions and platforms without external assets:
- **Flag**: A stylized CSS shape (a red triangle on a thin black pole) or a specific Unicode character (🚩 `\1F6A9`) wrapped in a `.flag` class.
- **Mine**: A black circle with radial "spikes" using CSS `repeating-conic-gradient` or Unicode (💣 `\1F4A3`).
- **Question Mark**: Bold text (❓ `\2753`).
- **Numbers (1-8)**: High-contrast, color-coded digits (1: Blue, 2: Green, 3: Red, 4: Purple, etc.).

---

## File-Level Strategy

### `index.html`
- **Responsibility**: Define the semantic structure and load the stylesheet and (empty) script.
- **Key Hooks**: IDs for all HUD elements and the board container.

### `style.css`
- **Responsibility**: Implement the "simple and modern" visual direction.
- **Key Sections**:
    - Global resets.
    - HUD layout (flexbox).
    - Cell styling (unrevealed vs. revealed).
    - Difficulty button styling (active vs. inactive states).
    - Grid-specific styles using variables.

### `README.md`
- **Responsibility**: Basic project description and instructions for local execution.

---

## Atomic Execution Steps

### Task 1: Create `index.html` with HUD and Board containers
- **Plan**: Define the base HTML5 structure. Include a header for title, a section for difficulty selection, a HUD section, and a board section.
- **Act**: Write the boilerplate and structure as defined in Architectural Design.
- **Validate**: Open in Chromium; verify that all semantic sections exist in the Elements inspector.

### Task 2: Implement basic CSS for difficulty selection and grid layout
- **Plan**: Create `style.css`. Define variables for colors and board dimensions. Set up the vertical flex layout. Style the cells in a "hidden" state as a placeholder.
- **Act**: Apply styles for buttons, containers, and a mockup 9x9 grid to test visual spacing.
- **Validate**: Verify that the HUD items (Timer, Counter) are properly aligned (spaced-between). Verify buttons have hover states.

### Task 3: Verify page loads in Chromium with correct initial layout
- **Plan**: Perform a visual audit of the Expert mode dimensions.
- **Act**: Manually set `--grid-cols: 30` and `--grid-rows: 16` in CSS and populate the board with 480 placeholder div cells.
- **Validate**: Ensure the board does not overflow the main container and that cells remain square.

---

## Edge Case & Boundary Audit

- **Expert Mode Overflow**: If the viewport is too small for a 30-column grid, the board must scroll horizontally or scale down, but cells must never lose their 1:1 aspect ratio.
- **Right-Click Default**: Ensure the `contextmenu` is targeted for disabling in later phases, but for now, ensure `#board-container` doesn't have CSS that interferes with pointer events.
- **System Fonts**: Fallback to `sans-serif` to avoid layout shifts on different desktop environments.

---

## Verification Protocol

### UI Element Presence Check
- [ ] Element `#board-container` exists.
- [ ] Element `#timer-display` exists and shows "000".
- [ ] Element `#mine-count-display` exists.
- [ ] Element `#restart-btn` exists.
- [ ] Three difficulty buttons are present and labeled.

### Visual Layout Verification
- [ ] HUD elements are horizontally aligned.
- [ ] Board container is centered.
- [ ] Placeholders for "Flag" and "Mine" are visually distinct using CSS classes.
- [ ] Application loads without errors in Chromium DevTools Console.

---

## Code Scaffolding

### `index.html` Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PXL Sweeper</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <header>
            <h1>PXL Sweeper</h1>
            <div id="difficulty-controls">
                <button id="btn-beginner">Beginner</button>
                <button id="btn-intermediate">Intermediate</button>
                <button id="btn-expert">Expert</button>
            </div>
        </header>

        <main>
            <div id="hud">
                <div id="mine-count-display">010</div>
                <button id="restart-btn">😊</button>
                <div id="timer-display">000</div>
            </div>
            <div id="board-container"></div>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>
```

### `style.css` Grid Placeholder
```css
:root {
    --grid-cols: 9;
    --grid-rows: 9;
    --cell-size: 30px;
    --bg-color: #f0f0f0;
    --cell-color: #bdbdbd;
}

#board-container {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols), var(--cell-size));
    grid-template-rows: repeat(var(--grid-rows), var(--cell-size));
    gap: 1px;
    background-color: #7b7b7b;
    border: 3px solid #7b7b7b;
    margin: 20px auto;
    width: max-content;
}

.cell {
    width: var(--cell-size);
    height: var(--cell-size);
    background-color: var(--cell-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
}
```
