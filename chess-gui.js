class ChessGUI {
  /**
   * Creates a new ChessGame instance.
   * References DOM elements for board, game state, current player, and status messages.
   * Initializes the board, sets up event listeners, and updates the display.
   */
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

  /**
   * Initializes the chess board by creating and appending square elements to the board container.
   * Clears any existing squares before rendering a new 8x8 grid.
   * Each square is assigned its row, column, and chess notation as data attributes,
   * and is styled as either light or dark based on its position.
   * Adds a click event listener to each square for handling user interactions.
   */
  initializeBoard() {
    this.boardElement.innerHTML = ""; // clear any existing squares

    // create grid of squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;
        square.dataset.square = this.coordsToChessNotation(row, col); // turn coordinates into chess notation

        // determine square color
        const isLight = (row + col) % 2 === 0;
        square.classList.add(isLight ? "light" : "dark");

        square.addEventListener("click", (e) => this.handleSquareClick(e));

        this.boardElement.appendChild(square);
      }
    }
  }

  /**
   * Sets up event listeners for UI interactions.
   * Handles "New Game" button click to start a new game.
   * Manages "Rules" modal open/close via button and overlay click.
   */
  setupEventListeners() {
    // new game button
    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.newGame();
    });

    // rules button and modal
    const rulesBtn = document.getElementById("rules-btn");
    const modal = document.getElementById("rules-modal");
    const closeBtn = modal.querySelector(".close");

    rulesBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // click event listener on entire browser
    // allows closing modal when clicking outside of it
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  /**
   * Converts board coordinates (row, col) to standard chess notation (like "e4").
   *
   * @param {number} row - The row index (0-based, with 0 at the top of the board).
   * @param {number} col - The column index (0-based, with 0 at the leftmost file).
   * @returns {string} The chess notation corresponding to the given coordinates.
   */
  coordsToChessNotation(row, col) {
    return String.fromCharCode("a".charCodeAt(0) + col) + (8 - row);
  }

  /**
   * Converts chess board notation to zero-based row and column coordinates.
   *
   * @param {string} notation - The chess notation string.
   * @returns {{row: number, col: number}} An object containing the row and column.
   */
  chessNotationToCoords(notation) {
    const col = notation.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(notation[1]);
    return { row, col };
  }

  /**
   * Handles the click event on a chessboard square.
   * If the game is finished, displays the winner and prevents further actions.
   * If no square is selected, selects the clicked square.
   * If the same square is clicked again, deselects it.
   * If a different square is clicked, attempts to make a move from the selected square to the clicked square.
   *
   * @param {MouseEvent} event - The click event triggered by the user on a chessboard square.
   */
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

    // first click, select a piece
    if (this.selectedSquare === null) {
      this.selectSquare(row, col, chessNotation);
    }
    // second click
    else {
      // clicking the same square deselects it
      if (this.selectedSquare === chessNotation) {
        this.clearSelection();
      }
      // make a move
      else {
        this.attemptMove(this.selectedSquare, chessNotation);
      }
    }
  }

  /**
   * Handles the selection of a square on the chess board.
   * Validates the selected piece, ensures it belongs to the current player,
   * and highlights the selected square.
   *
   * @param {number} row - The row index of the selected square.
   * @param {number} col - The column index of the selected square.
   * @param {string} chessNotation - The chess notation (like "e4") of the selected square.
   */
  selectSquare(row, col, chessNotation) {
    const piece = this.game.getPieceAt(row, col);

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

  /**
   * Clears previous highlights and highlights the square specified by chess notation.
   *
   * @param {string} chessNotation - The chess notation of the square to highlight.
   */
  highlightSelectedSquare(chessNotation) {
    this.clearHighlights();

    // highlight selected square
    const coords = this.chessNotationToCoords(chessNotation);
    const squareElement = this.getSquareElement(coords.row, coords.col);
    if (squareElement) {
      squareElement.classList.add("selected");
    }
  }

  /**
   * Clears the currently selected square and any highlighted squares.
   */
  clearSelection() {
    this.selectedSquare = null;
    this.clearHighlights();
  }

  /**
   * Removes all highlight classes ("selected", "valid-move", "invalid-move") from every square on the board.
   * This clears any visual indicators of selection.
   */
  clearHighlights() {
    const squares = this.boardElement.querySelectorAll(".square");

    // iterate over all squares and remove highlights
    squares.forEach((square) => {
      square.classList.remove("selected", "valid-move", "invalid-move");
    });
  }

  /**
   * Returns the DOM element representing the chessboard square at the specified row and column.
   * Used for accessing and manipulating specific squares in the UI to sync with the game state.
   *
   * @param {number} row - The row index of the square.
   * @param {number} col - The column index of the square.
   * @returns {Element|null} The DOM element for the specified square, or null if not found.
   */
  getSquareElement(row, col) {
    return this.boardElement.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
  }

  /**
   * Updates the chess board and game information display.
   */
  updateDisplay() {
    this.updateBoard();
    this.updateGameInfo();
  }

/**
 * Updates the visual representation of the chess board by iterating over each square,
 * retrieving the piece at each position, and setting the corresponding HTML element's
 * content to display the piece symbol.
 */
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

/**
 * Updates the game state and current player.
 */
  updateGameInfo() {
    this.gameStateElement.textContent = this.game.getGameState();
    this.currentPlayerElement.textContent = this.game.getCurrentPlayer();

    // update colors based on game state
    if (this.game.getGameState() !== "UNFINISHED") {
      this.gameStateElement.style.color = "#e74c3c";
    } else {
      this.gameStateElement.style.color = "#2ecc71";
    }

    // update current player color
    if (this.game.getCurrentPlayer() === "WHITE") {
      this.currentPlayerElement.style.color = "#ffffffff";
    } else {
      this.currentPlayerElement.style.color = "#000000ff";
    }
  }

  /**
   * Displays a status message in the UI with a specified type.
   *
   * @param {string} message - The message to display.
   * @param {string} [type="info"] - The type of message ("info" (default), "error", "success", etc).
   */
  showMessage(message, type = "info") {
    this.statusMessageElement.textContent = message;
    this.statusMessageElement.className = `status-message ${type}`; // update css class based on type

    // clear info messages after 3 seconds
    if (type === "info") {
      setTimeout(() => {
        this.statusMessageElement.textContent = "";
        this.statusMessageElement.className = "status-message";
      }, 3000);
    }
  }

  /**
   * Starts a new chess game by initializing the game state, clearing selections and highlights,
   * updating the display, and showing a message indicating the start of the game.
   */
  newGame() {
    this.game.initializeGame();
    this.selectedSquare = null;
    this.clearHighlights();
    this.updateDisplay();
    this.showMessage("New game started! White goes first.", "success");
  }
}

// initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const chessGUI = new ChessGUI();
});
