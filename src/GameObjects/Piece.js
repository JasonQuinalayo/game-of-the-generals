function Piece(imageId, pieceNumber, ctx, x, y, width, height) {
  this.x = x;
  this.y = y;
  this.pieceNumber = pieceNumber;
  this.imageId = imageId;
  this.ctx = ctx;
  this.width = width;
  this.height = height;
  this.initialPosCenterX = x + this.width / 2;
  this.initialPosCenterY = y + this.height / 2;
  this.center = {
    x: this.initialPosCenterX,
    y: this.initialPosCenterY,
  };
  this.tile = null;
  this.isEliminated = false;
}

Piece.prototype.draw = function draw() {
  this.ctx.drawImage(
    document.getElementById(this.imageId), this.x, this.y, this.width, this.height,
  );
};

Piece.prototype.isWithin = function isWithin(x, y) {
  return (x >= this.x && x <= this.x + this.width
    && y >= this.y && y <= this.y + this.height);
};

Piece.prototype.move = function move(x, y) {
  this.x = x - this.width / 2;
  this.y = y - this.height / 2;
  this.adjustCenter();
};

Piece.prototype.moveToTile = function moveToTile(tile) {
  if (!tile) {
    this.move(this.initialPosCenterX, this.initialPosCenterY);
  } else {
    this.x = tile.x + 1;
    this.y = tile.y + 16;
  }
  this.tile = tile;
  this.adjustCenter();
};

Piece.prototype.adjustCenter = function adjustCenter() {
  this.center.x = this.x + this.width / 2;
  this.center.y = this.y + this.height / 2;
};

Piece.prototype.eliminate = function eliminate() {
  if (this.isEliminated) return;
  this.isEliminated = true;
  if (this.tile) {
    this.tile.piece = null;
  }
  this.tile = null;
  this.move(this.initialPosCenterX, this.initialPosCenterY);
};

export default Piece;
