// Chess piece definitions and game logic
class ChessGame {
  constructor() {
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

  initializeGame() {
    this.currentPlayer = "WHITE";
    this.gameState = "UNFINISHED";

    // Initialize board - standard chess starting position
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

  getPieceAt(row, col) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) {
      return null;
    }
    return this.board[row][col];
  }

  setPieceAt(row, col, piece) {
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      this.board[row][col] = piece;
    }
  }

  isValidPlayer(piece) {
    if (piece === 0) return false;

    if (this.currentPlayer === "WHITE") {
      return piece >= 10; // White pieces
    } else {
      return piece < 10 && piece > 0; // Black pieces
    }
  }

  checkHorizontalVerticalMove(currentCol, currentRow, destCol, destRow) {
    // Check if there are pieces blocking horizontal/vertical movement
    if (currentRow === destRow) {
      // Horizontal move
      let start = Math.min(currentCol, destCol) + 1;
      let end = Math.max(currentCol, destCol);
      for (let col = start; col < end; col++) {
        if (this.board[currentRow][col] !== 0) {
          return false;
        }
      }
    } else if (currentCol === destCol) {
      // Vertical move
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

  checkDiagonalMove(currentCol, currentRow, destCol, destRow) {
    let rowStep = destRow > currentRow ? 1 : -1;
    let colStep = destCol > currentCol ? 1 : -1;

    let checkRow = currentRow + rowStep;
    let checkCol = currentCol + colStep;

    while (checkRow !== destRow && checkCol !== destCol) {
      if (this.board[checkRow][checkCol] !== 0) {
        return false;
      }
      checkRow += rowStep;
      checkCol += colStep;
    }
    return true;
  }

  isValidChessMove(piece, currentCol, currentRow, destCol, destRow) {
    let rowDistance = Math.abs(currentRow - destRow);
    let colDistance = Math.abs(currentCol - destCol);

    // Can't move off board
    if (destCol < 0 || destCol >= 8 || destRow < 0 || destRow >= 8) {
      return false;
    }

    // Can't capture own piece
    let destPiece = this.board[destRow][destCol];
    if (piece < 10 && destPiece > 0 && destPiece < 10) return false; // Black capturing black
    if (piece >= 10 && destPiece >= 10) return false; // White capturing white

    // Piece-specific movement rules
    switch (piece) {
      case this.BR:
      case this.WR:
        // Rook: horizontal or vertical only
        if (currentRow !== destRow && currentCol !== destCol) return false;
        return this.checkHorizontalVerticalMove(
          currentCol,
          currentRow,
          destCol,
          destRow
        );

      case this.BH:
      case this.WH:
        // Knight: L-shape moves
        return (
          (rowDistance === 1 && colDistance === 2) ||
          (rowDistance === 2 && colDistance === 1)
        );

      case this.BB:
      case this.WB:
        // Bishop: diagonal only
        if (rowDistance !== colDistance) return false;
        return this.checkDiagonalMove(currentCol, currentRow, destCol, destRow);

      case this.BQ:
      case this.WQ:
        // Queen: any direction
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

      case this.BK:
      case this.WK:
        // King: one square in any direction, but cannot capture (atomic rule)
        if (rowDistance > 1 || colDistance > 1) return false;
        if (destPiece !== 0) return false; // Kings cannot capture in atomic chess
        return true;

      case this.BP:
        // Black pawn
        if (currentRow <= destRow) return false; // Can't move backwards
        if (destPiece === 0 && currentCol !== destCol) return false; // Can't move diagonally without capture
        if (destPiece !== 0 && currentCol === destCol) return false; // Can't capture forward

        // First move: can move 2 squares
        if (currentRow === 1) {
          return (
            rowDistance <= 2 &&
            (destPiece === 0
              ? currentCol === destCol
              : Math.abs(currentCol - destCol) === 1)
          );
        }
        return (
          rowDistance === 1 &&
          (destPiece === 0
            ? currentCol === destCol
            : Math.abs(currentCol - destCol) === 1)
        );

      case this.WP:
        // White pawn
        if (currentRow >= destRow) return false; // Can't move backwards
        if (destPiece === 0 && currentCol !== destCol) return false; // Can't move diagonally without capture
        if (destPiece !== 0 && currentCol === destCol) return false; // Can't capture forward

        // First move: can move 2 squares
        if (currentRow === 6) {
          return (
            rowDistance <= 2 &&
            (destPiece === 0
              ? currentCol === destCol
              : Math.abs(currentCol - destCol) === 1)
          );
        }
        return (
          rowDistance === 1 &&
          (destPiece === 0
            ? currentCol === destCol
            : Math.abs(currentCol - destCol) === 1)
        );
    }

    return false;
  }

  makeMove(fromSquare, toSquare) {
    // Convert chess notation to array indices
    let fromCol = fromSquare.charCodeAt(0) - "a".charCodeAt(0);
    let fromRow = 8 - parseInt(fromSquare[1]);
    let toCol = toSquare.charCodeAt(0) - "a".charCodeAt(0);
    let toRow = 8 - parseInt(toSquare[1]);

    let piece = this.getPieceAt(fromRow, fromCol);

    if (!this.isValidPlayer(piece)) {
      return {
        success: false,
        message: "Please select one of your own pieces.",
      };
    }

    if (!this.isValidChessMove(piece, fromCol, fromRow, toCol, toRow)) {
      return {
        success: false,
        message: "Invalid move according to chess rules.",
      };
    }

    if (this.gameState !== "UNFINISHED") {
      return { success: false, message: "Game is already finished." };
    }

    // Make the move
    this.setPieceAt(fromRow, fromCol, 0);
    let capturedPiece = this.getPieceAt(toRow, toCol);

    if (capturedPiece !== 0) {
      // Atomic explosion!
      this.setPieceAt(toRow, toCol, 0); // Captured piece explodes

      // Explode adjacent squares (pawns survive)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let explodeRow = toRow + dr;
          let explodeCol = toCol + dc;
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
      this.setPieceAt(toRow, toCol, piece);
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
