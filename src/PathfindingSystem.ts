import { GridSystem } from "./GridSystem";

interface PathNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  parent: PathNode | null;
}

export class PathfindingSystem {
  private gridSystem: GridSystem;
  private gridWidth: number;
  private gridHeight: number;

  constructor(gridSystem: GridSystem, gridWidth: number, gridHeight: number) {
    this.gridSystem = gridSystem;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  findPath(startX: number, startY: number, endX: number, endY: number): Array<{x: number, y: number}> | null {
    const openList: PathNode[] = [];
    const closedList: PathNode[][] = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(null));

    const startNode: PathNode = {
      x: startX,
      y: startY,
      f: 0,
      g: 0,
      h: this.calculateHeuristic(startX, startY, endX, endY),
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const currentNode = openList.shift()!;

      closedList[currentNode.y][currentNode.x] = currentNode;

      if (currentNode.x === endX && currentNode.y === endY) {
        return this.reconstructPath(currentNode);
      }

      const neighbors = this.getNeighbors(currentNode);

      for (const neighbor of neighbors) {
        if (closedList[neighbor.y][neighbor.x] || this.gridSystem.isTileOccupied(neighbor.x, neighbor.y)) {
          continue;
        }

        const tentativeG = currentNode.g + 1;
        const existingNode = openList.find(node => node.x === neighbor.x && node.y === neighbor.y);

        if (!existingNode) {
          const newNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            f: 0,
            g: tentativeG,
            h: this.calculateHeuristic(neighbor.x, neighbor.y, endX, endY),
            parent: currentNode
          };
          newNode.f = newNode.g + newNode.h;
          openList.push(newNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = currentNode;
        }
      }
    }

    return null;
  }

  private getNeighbors(node: PathNode): Array<{x: number, y: number}> {
    const neighbors: Array<{x: number, y: number}> = [];
    const directions = [
      {x: 0, y: -1},
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: -1, y: 0}
    ];

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;

      if (this.isValidPosition(newX, newY)) {
        neighbors.push({x: newX, y: newY});
      }
    }

    return neighbors;
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  private calculateHeuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private reconstructPath(endNode: PathNode): Array<{x: number, y: number}> {
    const path: Array<{x: number, y: number}> = [];
    let currentNode = endNode;

    while (currentNode) {
      path.unshift({x: currentNode.x, y: currentNode.y});
      currentNode = currentNode.parent!;
    }

    path.shift();
    return path;
  }
}