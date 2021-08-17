import Tile from './Tile';
import Piece from './Piece';
import RankToImgId from '../RANK_TO_IMG_ID';

function Board(ctx, canvasWidth, canvasHeight) {
  this.ctx = ctx;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.squareLength = 80;
  this.margin = 1;
  this.pieceWidth = 75;
  this.pieceHeight = 45;
  this.boardWidth = this.squareLength * 9;
  this.boardHeight = this.squareLength * 8;
  this.tiles = [];
  for (let i = 0; i < 8; i++) {
    const tileRow = [];
    for (let j = 0; j < 9; j++) {
      const x = this.squareLength * j + this.margin;
      const y = this.squareLength * i + this.margin;
      tileRow.push(new Tile(x, y, this.squareLength - 2 * this.margin, ctx, i, j));
    }
    this.tiles.push(tileRow);
  }
  this.pieces = [];
  this.draggedPiece = null;
  this.enemyPieces = null;
  this.isInitialized = false;
  this.playMode = false;
  this.validMovementTiles = null;
  this.enemyReady = false;
  this.highlightedEnemyMovementTiles = null;
}

Board.prototype.init = function init(playerPieces) {
  this.isInitialized = true;
  const initialXPos = (i) => (
    this.boardWidth + ((i % 2) * this.squareLength)
  );
  const initialYPos = (i) => (
    50 * (Math.floor(i / 2))
  );
  for (let i = 0; i < playerPieces.length; i++) {
    this.pieces.push(
      new Piece(
        RankToImgId[playerPieces[i]], i, this.ctx,
        initialXPos(i), initialYPos(i), this.pieceWidth, this.pieceHeight,
      ),
    );
  }
  this.draw();
};

Board.prototype.draw = function draw() {
  const { ctx } = this;
  const drawEnemyPiece = (piece) => {
    ctx.fillRect(piece[1] * this.squareLength + 2, piece[0] * this.squareLength + 16,
      this.pieceWidth, this.pieceHeight);
  };
  ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  ctx.fillStyle = '#a6a6a6';
  ctx.fillRect(0, 0,
    this.boardWidth - 2 * this.margin, this.boardHeight - 2 * this.margin);
  ctx.fillStyle = '#808080';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 9; j++) {
      this.tiles[i][j].draw();
    }
  }
  ctx.fillStyle = '#cccccc';
  for (let i = 4; i < 8; i++) {
    for (let j = 0; j < 9; j++) {
      this.tiles[i][j].draw();
    }
  }
  if (this.highlightedEnemyMovementTiles) {
    this.ctx.fillStyle = '#ebb434';
    for (let i = 0; i < this.highlightedEnemyMovementTiles.length; i++) {
      (this.tiles[this.highlightedEnemyMovementTiles[i][0]][
        this.highlightedEnemyMovementTiles[i][1]]).draw();
    }
  }
  if (this.validMovementTiles) {
    this.ctx.fillStyle = '#66ff66';
    for (let i = 0; i < this.validMovementTiles.length; i++) {
      (this.tiles[this.validMovementTiles[i].row][
        this.validMovementTiles[i].column]).draw();
    }
  }
  for (let i = 0; i < this.pieces.length; i++) {
    this.pieces[i].draw();
  }
  if (this.enemyPieces) {
    ctx.fillStyle = '#000';
    for (let i = 0; i < this.enemyPieces.length; i++) {
      drawEnemyPiece(this.enemyPieces[i]);
    }
  }
  if (this.draggedPiece) this.draggedPiece.draw();
  if (this.enemyReady && !this.playMode) {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '30px Arial';
    this.ctx.fillText('Your enemy is ready', this.boardWidth / 2 - 140, this.boardHeight / 4 - 10);
  }
};

Board.prototype.movePieceToTile = function movePieceToTile(piece, tile) {
  if (piece.tile) {
    piece.tile.setPiece(null);
  }
  piece.moveToTile(tile);
  if (tile) {
    tile.setPiece(piece);
  }
};

Board.prototype.handleMouseDown = function handleMouseDown(x, y) {
  if (!this.isInitialized) return;
  for (let i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].isWithin(x, y)) {
      if (this.pieces[i].isEliminated) return;
      this.draggedPiece = this.pieces[i];
      this.setValidMovementTiles(this.pieces[i]);
      break;
    }
  }
};

Board.prototype.handleMouseMove = function handleMouseMove(x, y) {
  if (!this.isInitialized || !this.draggedPiece) return;
  this.draggedPiece.move(x, y);
  this.draw();
};

Board.prototype.handleMouseUp = function handleMouseUp() {
  if (!(this.draggedPiece) || !(this.isInitialized)) return null;
  let tile = null;
  for (let i = 0; i < this.tiles.length; i++) {
    for (let j = 0; j < this.tiles[i].length; j++) {
      if (Math.abs(this.tiles[i][j].center.x - this.draggedPiece.center.x) <= 40
      && Math.abs(this.tiles[i][j].center.y - this.draggedPiece.center.y) <= 40) {
        tile = this.tiles[i][j];
        break;
      }
    }
    if (tile) break;
  }
  let returnVal = null;
  if (tile === null || !this.validMovementTiles.includes(tile)) {
    if (!this.playMode) {
      this.movePieceToTile(this.draggedPiece, null);
      returnVal = {
        piece: this.draggedPiece.pieceNumber,
        tile: null,
      };
    } else {
      this.movePieceToTile(this.draggedPiece, this.draggedPiece.tile);
    }
  } else {
    this.movePieceToTile(this.draggedPiece, tile);
    returnVal = {
      piece: this.draggedPiece.pieceNumber,
      tile: { row: tile.row, column: tile.column },
    };
  }
  this.validMovementTiles = null;
  this.draw();
  this.draggedPiece = null;
  return returnVal;
};

Board.prototype.updateGameState = function updateGameState(boardState, elimPieces, enemyMovement) {
  const newEnemyLocations = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 9; j++) {
      const piece = boardState[i][j];
      if (piece) {
        if (piece.isEnemy) {
          newEnemyLocations.push([i, j]);
        } else {
          this.movePieceToTile(this.pieces[piece.number], this.tiles[i][j]);
        }
      }
    }
  }
  this.enemyPieces = newEnemyLocations;
  for (let i = 0; i < elimPieces.length; i++) {
    this.pieces[elimPieces[i]].eliminate();
  }
  this.highlightedEnemyMovementTiles = enemyMovement;
  this.draw();
};

Board.prototype.setValidMovementTiles = function setValidMovementTiles(piece) {
  const validMovementTiles = [];
  if (this.playMode) {
    const tileRow = piece.tile.row;
    const tileColumn = piece.tile.column;
    if (this.isTileValid(tileRow + 1, tileColumn)) {
      validMovementTiles.push(this.tiles[tileRow + 1][tileColumn]);
    }
    if (this.isTileValid(tileRow, tileColumn + 1)) {
      validMovementTiles.push(this.tiles[tileRow][tileColumn + 1]);
    }
    if (this.isTileValid(tileRow - 1, tileColumn)) {
      validMovementTiles.push(this.tiles[tileRow - 1][tileColumn]);
    }
    if (this.isTileValid(tileRow, tileColumn - 1)) {
      validMovementTiles.push(this.tiles[tileRow][tileColumn - 1]);
    }
  } else {
    for (let i = 5; i < 8; i++) {
      for (let j = 0; j < 9; j++) {
        if (!(this.tiles[i][j].isOccupiedByAlly())) {
          validMovementTiles.push(this.tiles[i][j]);
        }
      }
    }
  }
  this.validMovementTiles = validMovementTiles;
};

Board.prototype.isTileValid = function isTileValid(row, column) {
  return row >= 0 && row < 8 && column >= 0 && column < 9
  && !(this.tiles[row][column].isOccupiedByAlly());
};

Board.prototype.isReady = function isReady() {
  for (let i = 0; i < this.pieces.length; i++) {
    if (!(this.pieces[i].tile)) return false;
  }
  return true;
};

Board.prototype.play = function play() {
  this.playMode = true;
};

Board.prototype.setEnemyReady = function setEnemyReady(enemyReady) {
  this.enemyReady = enemyReady;
};

Board.prototype.drawTextOnBoard = function drawTextOnBoard(text) {
  this.ctx.fillStyle = '#ff0000';
  this.ctx.font = '60px Arial';
  this.ctx.fillText(text, 60, this.boardHeight / 2);
  this.ctx.strokeText(text, 60, this.boardHeight / 2);
};

Board.prototype.gameOver = function gameOver(isWinner) {
  const matchResult = isWinner ? 'win' : 'lose';
  const text = `Game Over! You ${matchResult}! `;
  this.drawTextOnBoard(text);
};

Board.prototype.enemyDisconnected = function enemyDisconnected() {
  this.drawTextOnBoard('Opponent disconnected');
};

Board.prototype.serverDisconnected = function serverDisconnected() {
  this.drawTextOnBoard('Server Disconnected');
};

Board.prototype.restore = function restore(state) {
  this.updateGameState(state.boardState, state.eliminatedPieces, state.enemyMovement);
  this.playMode = state.playMode;
  this.enemyReady = state.enemyReady;
};

export default Board;
