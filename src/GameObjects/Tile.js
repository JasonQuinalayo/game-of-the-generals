function Tile(x, y, length, ctx, row, column) {
  this.row = row;
  this.column = column;
  this.x = x;
  this.y = y;
  this.center = {
    x: x + (length / 2),
    y: y + (length / 2),
  };
  this.length = length;
  this.ctx = ctx;
  this.piece = null;
}

Tile.prototype.setPiece = function setPiece(piece) {
  this.piece = piece;
};

Tile.prototype.isOccupiedByAlly = function isOccupiedByAlly() {
  return this.piece !== null;
};

Tile.prototype.draw = function draw() {
  this.ctx.fillRect(this.x, this.y, this.length, this.length);
};

export default Tile;
