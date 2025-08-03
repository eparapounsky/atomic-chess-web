// Chess GUI Controller
class ChessGUI {
  constructor() {
    this.game = new ChessGame();
    this.selectedSquare = null;
    this.boardElement = document.getElementById("chess-board");
    this.gameStateElement = document.getElementById("game-state");
    this.currentPlayerElement = document.getElementById("current-player");
    this.statusMessageElement = document.getElementById("status-message");

    this.initializeBoard();
    this.setupEventListeners();
    this.updateDisplay();
  }

  initializeBoard() {
    this.boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;
        square.dataset.square = this.coordsToChessNotation(row, col);

        // Determine square color
        const isLight = (row + col) % 2 === 0;
        square.classList.add(isLight ? "light" : "dark");

        square.addEventListener("click", (e) => this.handleSquareClick(e));

        this.boardElement.appendChild(square);
      }
    }
  }

  setupEventListeners() {
    // New Game button
    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.newGame();
    });

    // Rules button and modal
    const rulesBtn = document.getElementById("rules-btn");
    const modal = document.getElementById("rules-modal");
    const closeBtn = modal.querySelector(".close");

    rulesBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearSelection();
      } else if (e.key === "n" || e.key === "N") {
        this.newGame();
      }
    });
  }

  coordsToChessNotation(row, col) {
    return String.fromCharCode("a".charCodeAt(0) + col) + (8 - row);
  }

  chessNotationToCoords(notation) {
    const col = notation.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(notation[1]);
    return { row, col };
  }

  handleSquareClick(event) {
    const square = event.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const chessNotation = square.dataset.square;

    if (this.game.getGameState() !== "UNFINISHED") {
      this.showMessage(
        `Game is finished! Winner: ${this.game.getGameState()}`,
        "info"
      );
      return;
    }

    if (this.selectedSquare === null) {
      // First click - select a piece
      this.selectSquare(row, col, chessNotation);
    } else {
      // Second click - make a move or deselect
      if (this.selectedSquare === chessNotation) {
        // Clicking the same square deselects it
        this.clearSelection();
      } else {
        // Attempt to make a move
        this.attemptMove(this.selectedSquare, chessNotation);
      }
    }
  }

  selectSquare(row, col, chessNotation) {
    const piece = this.game.getPieceAt(row, col);
    console.log(
      `Selecting square ${chessNotation}, piece: ${piece}, current player: ${this.game.getCurrentPlayer()}`
    );

    if (piece === 0) {
      this.showMessage("Please select a piece to move.", "error");
      return;
    }

    if (!this.game.isValidPlayer(piece)) {
      this.showMessage("Please select one of your own pieces.", "error");
      return;
    }

    this.selectedSquare = chessNotation;
    this.highlightSelectedSquare(chessNotation);
    this.showMessage(
      `Selected ${this.game.getPieceSymbol(
        piece
      )} on ${chessNotation.toUpperCase()}`,
      "info"
    );
  }

  attemptMove(fromSquare, toSquare) {
    console.log(`Attempting move: ${fromSquare} to ${toSquare}`);
    const result = this.game.makeMove(fromSquare, toSquare);
    console.log(`Move result:`, result);

    if (result.success) {
      this.clearSelection();
      this.updateDisplay();
      this.showMessage(
        `Move: ${fromSquare.toUpperCase()} → ${toSquare.toUpperCase()}`,
        "success"
      );

      // Check for game end
      if (this.game.getGameState() !== "UNFINISHED") {
        setTimeout(() => {
          this.showMessage(
            `🎉 GAME OVER! Winner: ${this.game.getGameState()} 🎉`,
            "success"
          );
        }, 1000);
      }
    } else {
      this.showMessage(result.message, "error");
      this.clearSelection();
    }
  }

  highlightSelectedSquare(chessNotation) {
    // Clear previous highlights
    this.clearHighlights();

    // Highlight selected square
    const coords = this.chessNotationToCoords(chessNotation);
    const squareElement = this.getSquareElement(coords.row, coords.col);
    if (squareElement) {
      squareElement.classList.add("selected");
    }
  }

  clearSelection() {
    this.selectedSquare = null;
    this.clearHighlights();
    this.showMessage("Selection cleared.", "info");
  }

  clearHighlights() {
    const squares = this.boardElement.querySelectorAll(".square");
    squares.forEach((square) => {
      square.classList.remove("selected", "valid-move", "invalid-move");
    });
  }

  getSquareElement(row, col) {
    return this.boardElement.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
  }

  updateDisplay() {
    this.updateBoard();
    this.updateGameInfo();
  }

  updateBoard() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.getPieceAt(row, col);
        const symbol = this.game.getPieceSymbol(piece);
        const squareElement = this.getSquareElement(row, col);

        if (squareElement) {
          squareElement.innerHTML = `<span class="piece">${symbol}</span>`;
        }
      }
    }
  }

  updateGameInfo() {
    this.gameStateElement.textContent = this.game.getGameState();
    this.currentPlayerElement.textContent = this.game.getCurrentPlayer();

    // Update colors based on game state
    if (this.game.getGameState() !== "UNFINISHED") {
      this.gameStateElement.style.color = "#e74c3c";
    } else {
      this.gameStateElement.style.color = "#2ecc71";
    }

    // Update current player color
    if (this.game.getCurrentPlayer() === "WHITE") {
      this.currentPlayerElement.style.color = "#ecf0f1";
    } else {
      this.currentPlayerElement.style.color = "#95a5a6";
    }
  }

  showMessage(message, type = "info") {
    this.statusMessageElement.textContent = message;
    this.statusMessageElement.className = `status-message ${type}`;

    // Auto-clear info messages after 3 seconds
    if (type === "info") {
      setTimeout(() => {
        this.statusMessageElement.textContent = "";
        this.statusMessageElement.className = "status-message";
      }, 3000);
    }
  }

  newGame() {
    this.game.initializeGame();
    this.selectedSquare = null;
    this.clearHighlights();
    this.updateDisplay();
    this.showMessage("New game started! White goes first.", "success");
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const chessGUI = new ChessGUI();
  console.log("Atomic Chess game initialized!");
});
