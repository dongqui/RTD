export class GridSystem {
  public static readonly DEFAULT_TILE_SIZE = 80;

  private scene: Phaser.Scene;
  private tileSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private grid: boolean[][];
  private gridRenderTexture: Phaser.GameObjects.RenderTexture;
  private highlightGraphics: Phaser.GameObjects.Graphics;

  static gridToWorldStatic(
    gridX: number,
    gridY: number,
    tileSize: number = GridSystem.DEFAULT_TILE_SIZE
  ): { x: number; y: number } {
    return {
      x: gridX * tileSize + tileSize / 2,
      y: gridY * tileSize + tileSize / 2,
    };
  }

  static worldToGridStatic(
    worldX: number,
    worldY: number,
    tileSize: number = GridSystem.DEFAULT_TILE_SIZE
  ): { x: number; y: number } {
    return {
      x: Math.floor(worldX / tileSize),
      y: Math.floor(worldY / tileSize),
    };
  }

  constructor(
    scene: Phaser.Scene,
    tileSize: number = GridSystem.DEFAULT_TILE_SIZE,
    gridWidth: number = 31,
    gridHeight: number = 31
  ) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    this.grid = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));

    this.createGridRenderTexture();
    this.highlightGraphics = scene.add.graphics();
    this.highlightGraphics.setDepth(0);
  }

  private createGridRenderTexture() {
    const worldWidth = this.gridWidth * this.tileSize;
    const worldHeight = this.gridHeight * this.tileSize;

    this.gridRenderTexture = this.scene.add.renderTexture(
      0,
      0,
      worldWidth,
      worldHeight
    );
    this.gridRenderTexture.setOrigin(0, 0);
    this.gridRenderTexture.setDepth(-10);

    const tempGraphics = this.scene.add.graphics();
    tempGraphics.lineStyle(4, 0x333333, 0.5);

    for (let x = 0; x <= this.gridWidth; x++) {
      const worldX = x * this.tileSize;
      tempGraphics.beginPath();
      tempGraphics.moveTo(worldX, 0);
      tempGraphics.lineTo(worldX, this.gridHeight * this.tileSize);
      tempGraphics.strokePath();
    }

    for (let y = 0; y <= this.gridHeight; y++) {
      const worldY = y * this.tileSize;
      tempGraphics.beginPath();
      tempGraphics.moveTo(0, worldY);
      tempGraphics.lineTo(this.gridWidth * this.tileSize, worldY);
      tempGraphics.strokePath();
    }

    this.gridRenderTexture.draw(tempGraphics);
    tempGraphics.destroy();
  }

  worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize),
    };
  }

  gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.tileSize + this.tileSize / 2,
      y: gridY * this.tileSize + this.tileSize / 2,
    };
  }

  isValidPosition(gridX: number, gridY: number): boolean {
    return (
      gridX >= 0 &&
      gridX < this.gridWidth &&
      gridY >= 0 &&
      gridY < this.gridHeight
    );
  }

  isTileOccupied(gridX: number, gridY: number): boolean {
    if (!this.isValidPosition(gridX, gridY)) return true;
    return this.grid[gridY][gridX];
  }

  setTileOccupied(
    gridX: number,
    gridY: number,
    occupied: boolean = true
  ): boolean {
    if (!this.isValidPosition(gridX, gridY)) return false;
    this.grid[gridY][gridX] = occupied;
    return true;
  }

  isValidArea(
    gridX: number,
    gridY: number,
    width: number,
    height: number
  ): boolean {
    for (let x = gridX; x < gridX + width; x++) {
      for (let y = gridY; y < gridY + height; y++) {
        if (!this.isValidPosition(x, y)) {
          return false;
        }
      }
    }
    return true;
  }

  isAreaOccupied(
    gridX: number,
    gridY: number,
    width: number,
    height: number
  ): boolean {
    if (!this.isValidArea(gridX, gridY, width, height)) return true;

    for (let x = gridX; x < gridX + width; x++) {
      for (let y = gridY; y < gridY + height; y++) {
        if (this.grid[y][x]) {
          return true;
        }
      }
    }
    return false;
  }

  setAreaOccupied(
    gridX: number,
    gridY: number,
    width: number,
    height: number,
    occupied: boolean = true
  ): boolean {
    if (!this.isValidArea(gridX, gridY, width, height)) return false;

    for (let x = gridX; x < gridX + width; x++) {
      for (let y = gridY; y < gridY + height; y++) {
        this.grid[y][x] = occupied;
      }
    }
    return true;
  }

  showGrid() {
    this.gridRenderTexture.setVisible(true);
  }

  hideGrid() {
    this.gridRenderTexture.setVisible(false);
  }

  highlightTile(
    gridX: number,
    gridY: number,
    color: number = 0x00ff00,
    alpha: number = 0.3
  ) {
    if (!this.isValidPosition(gridX, gridY)) return;

    const worldX = gridX * this.tileSize;
    const worldY = gridY * this.tileSize;

    this.highlightGraphics.fillStyle(color, alpha);
    this.highlightGraphics.fillRect(
      worldX,
      worldY,
      this.tileSize,
      this.tileSize
    );
  }

  highlightAreaValidPlacement(
    gridX: number,
    gridY: number,
    width: number,
    height: number
  ) {
    this.highlightArea(gridX, gridY, width, height, 0x00ff00, 0.5);
  }

  highlightAreaInvalidPlacement(
    gridX: number,
    gridY: number,
    width: number,
    height: number
  ) {
    this.highlightArea(gridX, gridY, width, height, 0xff0000, 0.5);
  }

  highlightArea(
    gridX: number,
    gridY: number,
    width: number,
    height: number,
    color: number = 0x00ff00,
    alpha: number = 0.3
  ) {
    for (let x = gridX; x < gridX + width; x++) {
      for (let y = gridY; y < gridY + height; y++) {
        this.highlightTile(x, y, color, alpha);
      }
    }
  }

  clearHighlights() {
    this.highlightGraphics.clear();
  }
}
