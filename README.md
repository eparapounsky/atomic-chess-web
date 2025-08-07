# Atomic Chess Game
A browser-based implementation of Atomic Chess with interactive gameplay and modern UI, written in JavaScript and HTML/CSS.

## Live Demo
See the project [here](https://atomic-chess.up.railway.app/) 

## Features
- Interactive chessboard with move validation
- Visual highlights for selection, valid/invalid moves, and game state
- Status messages and error feedback
- New game/reset button
- Modal dialog with rules and instructions

## Rules
- Atomic chess follows standard chess rules with one major exception: captures cause explosions
- When a piece captures another piece, both pieces are destroyed along with all pieces in the 8 adjacent squares
- Pawns are immune to explosions unless they are directly captured or make the capturing move themselves
- Kings cannot make captures because they would explode themselves
- A move that would result in both kings being destroyed is not allowed
- The game ends immediately when a king is destroyed; this counts as a capture

## Preview

<img width="500" height="1316" alt="Screenshot 2025-08-05 122231" src="https://github.com/user-attachments/assets/e695b88a-f906-4979-be69-b13fad4ae701" />

run `python -m http.server 8000`
