# requirements.md

## Project Overview

This project is a small static one-page web application that implements a Minesweeper clone. The application shall reproduce the core rules and interactions of classic Minesweeper while keeping scope and implementation complexity low.

The initial version shall be self-contained, run entirely in the browser, and require no backend services, accounts, networking, or remote storage. It shall include local persistence for highscores.

## Goals

* Reproduce the core gameplay loop of classic Minesweeper.
* Keep the application small enough to implement as a simple one-page web app.
* Define requirements that are precise enough to guide design, implementation, and testing.
* Exclude features that do not directly support core Minesweeper play.
* Provide a highscore system to track and display fastest win times for each difficulty.

## Non-Goals

The initial version shall not include:

* Backend services
* Multiplayer or any online interaction
* User accounts or profiles
* Progression systems, unlocks, or achievements
* Story, lore, or campaign structure
* Additional gameplay mechanics beyond standard Minesweeper rules
* Cosmetic customization systems
* Audio systems
* Mobile or tablet support
* Framework-based implementation

## Target Platform

* The application shall run in a modern Chromium-based desktop web browser.
* The application shall be delivered as a single static web page.
* The primary input method shall be a mouse or trackpad with left-click and right-click support.
* Desktop browser usage is in scope.
* Mobile and tablet support are out of scope.

## Core Gameplay Requirements

* The game shall present a rectangular grid of hidden cells.
* Each game shall place a fixed number of mines on the grid according to the selected difficulty preset.
* Each non-mine cell shall store the number of adjacent mines in the eight neighboring cells.
* The player shall attempt to reveal all non-mine cells without revealing a mine.
* Revealing a mine shall immediately end the game in a loss state.
* Revealing a non-mine cell with one or more adjacent mines shall display the corresponding number.
* Revealing a non-mine cell with zero adjacent mines shall reveal that cell and all connected zero-adjacent cells, plus their bordering numbered cells.
* The player shall be able to mark hidden cells as flagged.
* The player shall be able to mark hidden cells as question-marked.
* A flagged or question-marked cell shall remain hidden until its mark state changes.
* The player shall win when all non-mine cells have been revealed.
* The player shall not be required to flag all mines in order to win.

## Difficulty Presets

The initial version shall support exactly these difficulty presets:

* Beginner: 9 x 9 grid with 10 mines
* Intermediate: 16 x 16 grid with 40 mines
* Expert: 16 x 30 grid with 99 mines

The player shall be able to start a new game using any of these presets.

## UI Requirements

### Required UI Elements

The application shall display:

* the game board
* a mine counter
* a restart control
* a timer
* difficulty selection controls
* an instructions dialog trigger
* a highscore screen trigger

### Board Presentation

* Hidden cells, revealed cells, flagged cells, question-marked cells, revealed mines, and incorrectly flagged cells shown after loss shall be visually distinguishable from one another.
* Revealed numbered cells shall display their adjacent-mine count.
* Cells shall be arranged in a visible square grid.
* The full playable interface shall be available on a single page.
* Instructions and Highscores shall be presented as modal dialogs.

### Layout Constraints

* The game shall not require navigation to another page to start, play, restart, win, or lose.
* The board and required controls shall be visible without opening menus or dialogs.
* Optional settings screens, overlays, and secondary pages are out of scope.
* The layout shall support all three difficulty presets within a desktop browser viewport.

### Visual Direction

* The visual style shall be simple and modern.
* The restart control shall be a simple button.
* The interface shall not attempt to reproduce the exact classic desktop Minesweeper look.

## Game States

The game shall support exactly these states:

### Not Started

* A new board has been created.
* All cells are hidden and unmarked.
* The timer displays zero.
* The player may reveal cells, place or remove marks, choose a difficulty preset, or restart.

### In Progress

* At least one successful reveal action has changed board state.
* The timer is running.
* The player may reveal cells, place or remove marks, choose a difficulty preset, or restart.
* Choosing a different difficulty preset during play shall immediately start a new game using that preset.

### Won

* All non-mine cells have been revealed.
* The timer is stopped.
* The board no longer accepts reveal or mark actions.
* The interface shall indicate that the game has been won.
* The player may start a new game by using restart or by selecting a difficulty preset.

### Lost

* A mine has been revealed.
* The timer is stopped.
* The board no longer accepts reveal or mark actions.
* The interface shall indicate that the game has been lost.
* The player may start a new game by using restart or by selecting a difficulty preset.

## Controls

* Left-click on a hidden cell that is not flagged shall reveal that cell.
* Left-click on a flagged cell shall do nothing.
* Left-click on a revealed cell shall do nothing.
* Right-click on a hidden unmarked cell shall place a flag on that cell.
* Right-click on a hidden flagged cell shall replace the flag with a question mark.
* Right-click on a hidden question-marked cell shall remove the mark and return the cell to the hidden unmarked state.
* Right-click on a revealed cell shall do nothing.
* Right-click interactions on the board shall not open the browser context menu.
* Activating the restart control shall immediately start a new game using the currently selected difficulty preset.
* Activating a difficulty preset control shall immediately start a new game using that preset.

The following controls are out of scope:

* chord reveal
* double-click interactions
* keyboard-only controls
* touch gestures
* drag interactions

## Functional Requirements

### Board Configuration

* The game shall use the selected difficulty preset's configured width, height, and mine count.
* Each new game shall generate a new valid mine layout.
* A valid mine layout shall contain exactly the configured number of mines.

### Cell State

Each cell shall track at least:

* whether it contains a mine
* whether it is revealed
* whether it is flagged
* whether it is question-marked
* its adjacent-mine count

A cell shall never be both revealed and marked at the same time.

### Reveal Behavior

* Revealing a hidden, unmarked, non-mine cell shall mark it as revealed.
* Revealing a hidden question-marked, non-mine cell shall mark it as revealed.
* Revealing a hidden, unmarked mine cell shall transition the game to the lost state.
* Revealing a hidden question-marked mine cell shall transition the game to the lost state.
* Revealing an already revealed cell shall not change game state.
* Revealing a flagged cell shall not change game state.
* When a zero-adjacent cell is revealed, zero-expansion shall reveal all connected zero-adjacent cells and their bordering numbered cells exactly once.

### First Click Behavior

* The first reveal action of a new game shall never reveal a mine.
* First-click safety shall only guarantee that the clicked cell is not a mine.
* First-click safety shall not guarantee that the clicked cell has zero adjacent mines.

### Mark Behavior

* Marks may only be placed on hidden cells.
* The right-click mark cycle shall be: unmarked -> flagged -> question-marked -> unmarked.
* Mark changes shall not reveal cells.
* The mine counter shall display `configured mine count - current flag count`.
* Question-marked cells shall not affect the mine counter.
* The mine counter may display negative values if the player places more flags than the configured mine count.

### Win Detection

* The game shall check for a win after each reveal action that changes board state.
* The game shall enter the won state when all non-mine cells are revealed.
* Placing or removing marks alone shall not produce a win.

### Loss Behavior

* The game shall enter the lost state immediately when a mine is revealed.
* On loss, all mined cells shall be revealed.
* The mine that triggered the loss shall be visually distinguishable from other revealed mines.
* On loss, any flagged cell that does not contain a mine shall be visually distinguishable as an incorrect flag.
* On loss, question-marked cells shall not receive any special visual treatment beyond the standard loss display rules.
* After loss, no further board interaction shall change cell state.

### Timer Behavior

* The timer shall start on the first successful reveal action that changes board state.
* The timer shall not start when the player only places or removes marks.
* The timer shall stop immediately on win or loss.
* The timer shall reset to zero when a new game starts.
* The timer shall display elapsed whole seconds.

### Restart and Preset Change Behavior

* The player shall be able to restart the game from any state.
* Restarting shall:

  * create a new valid board using the currently selected difficulty preset
  * clear all revealed cells
  * clear all marks
  * reset the timer to zero
  * return the game to the not started state
* Selecting a difficulty preset shall:

  * create a new valid board using the selected preset
  * clear all revealed cells
  * clear all marks
  * reset the timer to zero
  * return the game to the not started state

## Non-Functional Requirements

### Simplicity

* The implementation shall not require a backend, database, or server-side game logic.
* The implementation shall use only the functionality required to play the game.
* The implementation shall use plain HTML, CSS, and JavaScript with no framework.

### Performance

* On all supported difficulty presets, reveal actions, restart actions, difficulty changes, and initial board creation shall complete without noticeable delay during normal desktop use.

### Reliability

* Invalid user actions shall not corrupt game state.
* The game shall maintain a consistent board state across all allowed interactions.
* Restarting shall always produce a valid new game.
* Changing difficulty shall always produce a valid new game.

### Usability

* The player shall be able to distinguish hidden, revealed, flagged, question-marked, mine, and incorrectly flagged cells during play or loss display.
* The mine counter, timer, restart control, and difficulty controls shall remain visible while the game is playable.

## Technical Constraints

* The application shall be implemented as a static web app.
* The application shall run entirely in the browser after page load.
* The implementation shall use HTML, CSS, and JavaScript only.
* No external framework shall be used.
* No network connection shall be required for gameplay after the application has loaded.
* No account system, save system, local persistence, or remote storage shall be included.
* Refreshing the page shall not be required to preserve game state.
* The supported browser target for the initial version shall be modern Chromium-based desktop browsers.

## Acceptance Criteria

The implementation is acceptable only if all of the following are true:

* Opening the application displays a playable Minesweeper board on a single page.
* The page displays a mine counter, restart control, timer, and difficulty controls.
* The available difficulty presets are exactly Beginner, Intermediate, and Expert with the configured board sizes and mine counts.
* Selecting a difficulty preset starts a new game using that preset.
* Left-click on a hidden, unflagged cell reveals that cell.
* Left-click on a hidden question-marked cell reveals that cell.
* Left-click on a flagged cell does not reveal that cell.
* Right-click on a hidden cell cycles its mark state through unmarked, flagged, question-marked, and back to unmarked.
* Right-click on the board does not open the browser context menu.
* The first reveal action of a new game never hits a mine.
* Revealing a numbered cell shows the correct adjacent-mine count.
* Revealing a zero-adjacent cell reveals the correct connected empty region and bordering numbered cells.
* Revealing a mine ends the game immediately.
* After loss, all mined cells are visible and the triggering mine is visually distinct.
* After loss, incorrectly flagged cells are visually distinct.
* Question-marked cells do not require special loss-state rendering beyond the standard loss display rules.
* The player wins only when all non-mine cells are revealed.
* Placing or removing marks alone cannot trigger a win.
* After win or loss, reveal and mark actions no longer change board state.
* The timer starts only after the first successful reveal action.
* The timer does not start from mark placement or mark removal alone.
* The timer stops on win or loss.
* The restart control resets the board, marks, timer, and game state using the current difficulty preset.
* The application runs without backend services or frameworks.
* The application is playable in a modern Chromium-based desktop browser.

## Out of Scope

The following are explicitly out of scope for the initial version:

* custom board sizes
* custom mine counts
* multiplayer
* online features
* accounts or profiles
* persistence across page reloads
* cloud save
* achievements or progression
* new mechanics beyond classic Minesweeper except for the documented first-click safety rule
* chord reveal
* audio
* themes or skins
* mobile or tablet support
* touch-specific controls
* keyboard-specific controls
* leaderboards
* analytics
* map editor
* replay system

## Open Questions

None.
