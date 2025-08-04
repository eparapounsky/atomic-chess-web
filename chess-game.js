/**
 * @class ChessGame
 * @description Manages the game state, piece movement, and rules of atomic chess.
 * This class handles the core game logic but does not include GUI or user interactions.
 */
class ChessGame {
  constructor() {
    // piece definitions (numbers used for easier comparison)
    this.EMPTY = 0;
    this.BR = 1; // Black Rook
    this.BH = 2; // Black Knight (Horse)
    this.BB = 3; // Black Bishop
    this.BQ = 4; // Black Queen
    this.BK = 5; // Black King
    this.BP = 6; // Black Pawn
    this.WR = 10; // White Rook
    this.WH = 20; // White Knight (Horse)
    this.WB = 30; // White Bishop
    this.WQ = 40; // White Queen
    this.WK = 50; // White King
    this.WP = 60; // White Pawn

    // unicode symbols for gui
    this.pieceSymbols = {
      0: "", // empty
      1: "♜", // black rook
      2: "♞", // black knight
      3: "♝", // black bishop
      4: "♛", // black queen
      5: "♚", // black king
      6: "♟", // black pawn
      10: "♖", // white rook
      20: "♘", // white knight
      30: "♗", // white bishop
      40: "♕", // white queen
      50: "♔", // white king
      60: "♙", // white pawn
    };

    this.initializeGame();
  }

  /**
   * Initializes a new chess game.
   * Sets the current player to WHITE, game state to UNFINISHED,
   * and creates a new board with pieces in their starting positions.
   *
   * The board is represented as an 8x8 2D array where:
   * - 0 represents an empty square
   * - Constants like WP represent pieces
   */
  initializeGame() {
    this.currentPlayer = "WHITE";
    this.gameState = "UNFINISHED";

    this.board = [
      [this.BR, this.BH, this.BB, this.BQ, this.BK, this.BB, this.BH, this.BR],
      [this.BP, this.BP, this.BP, this.BP, this.BP, this.BP, this.BP, this.BP],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [this.WP, this.WP, this.WP, this.WP, this.WP, this.WP, this.WP, this.WP],
      [this.WR, this.WH, this.WB, this.WQ, this.WK, this.WB, this.WH, this.WR],
    ];
  }

  /**
   * Returns the chess piece at the specified row and column on the board.
   * If the coordinates are out of bounds (not between 0 and 7), returns null.
   *
   * @param {number} row - The row index (0-7) of the board.
   * @param {number} col - The column index (0-7) of the board.
   * @returns {(Object|null)} The piece object at the specified position, or null if out of bounds.
   */
  getPieceAt(row, col) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) {
      return null;
    }
    return this.board[row][col];
  }

  /**
   * Sets a chess piece at the specified position on the board.
   *
   * @param {number} row - The row index (0-7) where the piece will be placed.
   * @param {number} col - The column index (0-7) where the piece will be placed.
   * @param {*} piece - The chess piece to set at the specified position.
   */
  setPieceAt(row, col, piece) {
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      this.board[row][col] = piece;
    }
  }

  /**
   * Determines if the given piece belongs to the current player.
   *
   * @param {number} piece - The numeric representation of a chess piece.
   * @returns {boolean} True if the piece belongs to the current player, false otherwise.
   */
  isValidPlayer(piece) {
    if (piece === 0) return false;

    if (this.currentPlayer === "WHITE") {
      return piece >= 10; // white pieces
    } else {
      return piece < 10 && piece > 0; // black pieces
    }
  }

  /**
   * Checks if a horizontal or vertical move from the current position to the destination
   * is blocked by any pieces on the board.
   *
   * @param {number} currentCol - The column index of the current position.
   * @param {number} currentRow - The row index of the current position.
   * @param {number} destCol - The column index of the destination position.
   * @param {number} destRow - The row index of the destination position.
   * @returns {boolean} True if the path is clear, false if blocked by any piece.
   */
  checkHorizontalVerticalMove(currentCol, currentRow, destCol, destRow) {
    // horizontal move
    if (currentRow === destRow) {
      // both directions are valid
      let start = Math.min(currentCol, destCol) + 1; // +1 to skip the current square
      let end = Math.max(currentCol, destCol);
      // check all squares between current and destination
      for (let col = start; col < end; col++) {
        if (this.board[currentRow][col] !== 0) {
          return false;
        }
      }
    }
    // vertical move
    else if (currentCol === destCol) {
      let start = Math.min(currentRow, destRow) + 1;
      let end = Math.max(currentRow, destRow);
      for (let row = start; row < end; row++) {
        if (this.board[row][currentCol] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if a diagonal move from the current position to the destination
   * is blocked by any pieces on the board.
   *
   * @param {number} currentCol - The column index of the current position.
   * @param {number} currentRow - The row index of the current position.
   * @param {number} destCol - The column index of the destination position.
   * @param {number} destRow - The row index of the destination position.
   * @returns {boolean} True if the path is clear, false if blocked by any piece.
   */
  checkDiagonalMove(currentCol, currentRow, destCol, destRow) {
    // check whether move is upwards (lower indices) or downwards (higher indices)
    let rowStep = destRow > currentRow ? 1 : -1;
    let colStep = destCol > currentCol ? 1 : -1;

    // calculate the next square in the diagonal direction
    let checkRow = currentRow + rowStep;
    let checkCol = currentCol + colStep;

    // check all squares between current and destination
    while (checkRow !== destRow && checkCol !== destCol) {
      if (this.board[checkRow][checkCol] !== 0) {
        return false;
      }
      checkRow += rowStep;
      checkCol += colStep;
    }
    return true;
  }

  /**
   * Determines if a move is valid for a given chess piece according to both standard chess rules
   * and atomic chess rules.
   *
   * @param {number} movingPiece - The piece to move, encoded as an integer.
   * @param {number} currentCol - The current column of the piece.
   * @param {number} currentRow - The current row of the piece.
   * @param {number} destCol - The destination column.
   * @param {number} destRow - The destination row.
   * @returns {boolean} True if the move is valid, false otherwise.
   */
  isValidChessMove(movingPiece, currentCol, currentRow, destCol, destRow) {
    let rowDistance = Math.abs(currentRow - destRow);
    let colDistance = Math.abs(currentCol - destCol);

    // can't move off board
    if (destCol < 0 || destCol >= 8 || destRow < 0 || destRow >= 8) {
      return false;
    }

    // can't capture own piece
    let destPiece = this.board[destRow][destCol];
    if (movingPiece < 10 && destPiece > 0 && destPiece < 10) return false; // black capturing black
    if (movingPiece >= 10 && destPiece >= 10) return false; // white capturing white

    // piece-specific movement rules
    switch (movingPiece) {
      // rook: horizontal or vertical only
      case this.BR:
      case this.WR:
        if (currentRow !== destRow && currentCol !== destCol) return false;
        return this.checkHorizontalVerticalMove(
          currentCol,
          currentRow,
          destCol,
          destRow
        );

      // knight: L-shape moves
      case this.BH:
      case this.WH:
        return (
          (rowDistance === 1 && colDistance === 2) ||
          (rowDistance === 2 && colDistance === 1)
        );

      // bishop: diagonal only
      case this.BB:
      case this.WB:
        if (rowDistance !== colDistance) return false;
        return this.checkDiagonalMove(currentCol, currentRow, destCol, destRow);

      // queen: any direction
      case this.BQ:
      case this.WQ:
        if (rowDistance === colDistance) {
          return this.checkDiagonalMove(
            currentCol,
            currentRow,
            destCol,
            destRow
          );
        } else if (currentRow === destRow || currentCol === destCol) {
          return this.checkHorizontalVerticalMove(
            currentCol,
            currentRow,
            destCol,
            destRow
          );
        }
        return false;

      // king: one square in any direction
      case this.BK:
      case this.WK:
        if (rowDistance > 1 || colDistance > 1) return false;
        if (destPiece !== 0) return false; // kings cannot capture in atomic chess
        return true;

      // black pawn
      case this.BP:
        if (currentRow <= destRow) return false; // can't move backwards or sideways
        if (destPiece === 0 && currentCol !== destCol) return false; // can't move diagonally without capture
        if (destPiece !== 0 && currentCol === destCol) return false; // can't capture forward

        // first move: can move 2 squares
        if (currentRow === 1) {
          return rowDistance <= 2 && currentCol === destCol;
        }
        return rowDistance === 1;

      // white pawn
      case this.WP:
        if (currentRow >= destRow) return false;
        if (destPiece === 0 && currentCol !== destCol) return false;
        if (destPiece !== 0 && currentCol === destCol) return false;

        if (currentRow === 6) {
          return rowDistance <= 2 && currentCol === destCol;
        }
        return rowDistance === 1;
    }

    return false;
  }

  /**
   * Attempts to make a move from one square to another in the atomic chess game.
   * Handles move validation, captures, atomic explosions, and updates game state.
   *
   * @param {string} currentSquare - The starting square in chess notation ("e2").
   * @param {string} destSquare - The destination square in chess notation ("e4").
   * @returns {{success: boolean, message: string}} An object, with (1) a boolean indicating whether the move was successful,
   * and (2) a message describing the result.
   */
  makeMove(currentSquare, destSquare) {
    // convert chess notation to array indices
    let currentCol = currentSquare.charCodeAt(0) - "a".charCodeAt(0);
    let currentRow = 8 - parseInt(currentSquare[1]);
    let destCol = destSquare.charCodeAt(0) - "a".charCodeAt(0);
    let destRow = 8 - parseInt(destSquare[1]);

    let piece = this.getPieceAt(currentRow, currentCol);

    if (!this.isValidPlayer(piece)) {
      return {
        success: false,
        message: "Please select one of your own pieces.",
      };
    }

    if (!this.isValidChessMove(piece, currentCol, currentRow, destCol, destRow)) {
      return {
        success: false,
        message: "Invalid move according to chess rules.",
      };
    }

    if (this.gameState !== "UNFINISHED") {
      return { success: false, message: "Game is already finished." };
    }

    // Make the move
    this.setPieceAt(currentRow, currentCol, 0);
    let capturedPiece = this.getPieceAt(destRow, destCol);

    if (capturedPiece !== 0) {
      // Atomic explosion!
      this.setPieceAt(destRow, destCol, 0); // Captured piece explodes

      // Explode adjacent squares (pawns survive)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let explodeRow = destRow + dr;
          let explodeCol = destCol + dc;
          let explodePiece = this.getPieceAt(explodeRow, explodeCol);

          if (
            explodePiece !== null &&
            explodePiece !== this.BP &&
            explodePiece !== this.WP
          ) {
            this.setPieceAt(explodeRow, explodeCol, 0);
          }
        }
      }
    } else {
      // Normal move (no capture)
      this.setPieceAt(destRow, destCol, piece);
    }

    this.checkGameEnd();
    this.switchPlayer();

    return { success: true, message: "Move completed successfully." };
  }

  checkGameEnd() {
    // Check if kings are still on the board
    let blackKingExists = false;
    let whiteKingExists = false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = this.board[row][col];
        if (piece === this.BK) blackKingExists = true;
        if (piece === this.WK) whiteKingExists = true;
      }
    }

    if (!blackKingExists) {
      this.gameState = "WHITE_WON";
    } else if (!whiteKingExists) {
      this.gameState = "BLACK_WON";
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "WHITE" ? "BLACK" : "WHITE";
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getGameState() {
    return this.gameState;
  }

  getPieceSymbol(piece) {
    return this.pieceSymbols[piece] || "";
  }
}
