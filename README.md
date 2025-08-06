# Atomic Chess Game

## Rules
### Explosive Captures:
When a piece is captured, it triggers an explosion that affects the 8 surrounding squares. All non-pawn pieces in the blast radius, including the capturing piece, are destroyed.

### Pawn Immunity:
Pawns are immune to explosions unless they are directly captured or make the capturing move themselves.

### No King Captures:
Kings are not allowed to make captures.

### King Safety Rule:
A move that would result in both kings being destroyed is not allowed.

### Victory Condition:
The game ends immediately when a king is destroyed; this counts as a capture.

## Preview

<img width="500" height="1316" alt="Screenshot 2025-08-05 122231" src="https://github.com/user-attachments/assets/e695b88a-f906-4979-be69-b13fad4ae701" />

run `python -m http.server 8000` to start a Python HTTP server on port 8000 to serve the web app
