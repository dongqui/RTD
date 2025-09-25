import { BaseMonster } from "./monsters/BaseMonster";
import { BasicMonster } from "./monsters/BasicMonster";
import { FastMonster } from "./monsters/FastMonster";
import { TankMonster } from "./monsters/TankMonster";
import { PathfindingSystem } from "./PathfindingSystem";
import { GridSystem } from "./GridSystem";
import GameManager from "./GameManager";
import { MonsterManager } from "./MonsterManager";

export interface WaveConfig {
  waveNumber: number;
  monsters: Array<{
    type: "basic" | "fast" | "tank";
    count: number;
    spawnDelay: number;
  }>;
  totalReward: number;
}

export interface SpawnPoint {
  x: number;
  y: number;
}

export class WaveManager {
  private scene: Phaser.Scene;
  private gameManager: GameManager;
  private pathfindingSystem: PathfindingSystem;
  private gridSystem: GridSystem;
  private monsterManager: MonsterManager;

  private currentWave: number = 0;
  private isWaveActive: boolean = false;

  private spawnPoints: SpawnPoint[] = [];
  private corePosition = { x: 14, y: 14, width: 2, height: 2 };

  private waveConfigs: WaveConfig[] = [
    {
      waveNumber: 1,
      monsters: [{ type: "basic", count: 3, spawnDelay: 1000 }],
      totalReward: 30,
    },
    {
      waveNumber: 2,
      monsters: [{ type: "basic", count: 8, spawnDelay: 800 }],
      totalReward: 80,
    },
    {
      waveNumber: 3,
      monsters: [
        { type: "basic", count: 6, spawnDelay: 1000 },
        { type: "fast", count: 2, spawnDelay: 1500 },
      ],
      totalReward: 120,
    },
    {
      waveNumber: 4,
      monsters: [{ type: "basic", count: 10, spawnDelay: 600 }],
      totalReward: 150,
    },
    {
      waveNumber: 5,
      monsters: [{ type: "fast", count: 8, spawnDelay: 800 }],
      totalReward: 200,
    },
  ];

  constructor(
    scene: Phaser.Scene,
    gameManager: GameManager,
    pathfindingSystem: PathfindingSystem,
    gridSystem: GridSystem,
    monsterManager: MonsterManager
  ) {
    this.scene = scene;
    this.gameManager = gameManager;
    this.pathfindingSystem = pathfindingSystem;
    this.gridSystem = gridSystem;
    this.monsterManager = monsterManager;

    this.setupSpawnPoints();
    this.setupEventHandlers();
  }

  private setupSpawnPoints(): void {
    this.spawnPoints = [
      { x: 2, y: 15 },   // 왼쪽
      { x: 28, y: 15 },  // 오른쪽
      { x: 15, y: 2 },   // 위쪽
      { x: 15, y: 28 },  // 아래쪽
      { x: 5, y: 5 },    // 왼쪽 위
      { x: 25, y: 5 },   // 오른쪽 위
      { x: 5, y: 25 },   // 왼쪽 아래
      { x: 25, y: 25 },  // 오른쪽 아래
    ];
  }

  private setupEventHandlers(): void {
    this.scene.events.on(
      "monster-manager-killed",
      (monster: BaseMonster, reward: number) => {
        this.gameManager.addGold(reward);
        this.checkWaveComplete();
      }
    );

    this.scene.events.on(
      "monster-manager-reached-core",
      (monster: BaseMonster) => {
        this.gameManager.takeDamage(1);
        this.checkWaveComplete();
      }
    );

    this.scene.events.on("wave-started", (waveNumber: number) => {
      this.startWave(waveNumber);
    });
  }

  private checkWaveComplete(): void {
    if (
      this.monsterManager.getActiveMonsterCount() === 0 &&
      this.isWaveActive
    ) {
      this.isWaveActive = false;
      this.gameManager.completeWave();
    }
  }

  startWave(waveNumber: number): void {
    if (waveNumber < 1 || waveNumber > 15) {
      console.error(`Invalid wave number: ${waveNumber}`);
      return;
    }

    this.currentWave = waveNumber;
    this.isWaveActive = true;

    this.spawnMonstersNearCore();
  }

  private spawnMonstersNearCore(): void {
    const coreNearPositions = [
      { x: 10, y: 15 }, // 코어 왼쪽 더 멀리
      { x: 19, y: 15 }, // 코어 오른쪽 더 멀리
      { x: 15, y: 10 }, // 코어 위쪽 더 멀리
    ];

    for (let i = 0; i < 3; i++) {
      const spawnPos = coreNearPositions[i];
      const spawnWorldPos = this.gridSystem.gridToWorld(spawnPos.x, spawnPos.y);

      const monster = new BasicMonster(
        this.scene,
        spawnWorldPos.x,
        spawnWorldPos.y
      );

      // 킹(코어)으로 가는 경로 설정
      const path = this.pathfindingSystem.findPath(
        spawnPos.x,
        spawnPos.y,
        this.corePosition.x + 1,
        this.corePosition.y + 1
      );

      if (path) {
        monster.setPath(path);
        this.monsterManager.addMonster(monster);
        this.scene.events.emit("monster-spawned", monster);
      } else {
        console.warn("No path found for monster near core, destroying");
        monster.sprite.destroy();
      }
    }
  }

  private spawnWave(waveConfig: WaveConfig): void {
    let totalDelay = 0;

    for (const monsterGroup of waveConfig.monsters) {
      for (let i = 0; i < monsterGroup.count; i++) {
        this.scene.time.delayedCall(totalDelay, () => {
          this.spawnMonster(monsterGroup.type);
        });
        totalDelay += monsterGroup.spawnDelay;
      }
    }
  }

  private spawnMonster(type: "basic" | "fast" | "tank"): void {
    const spawnPoint = this.getRandomSpawnPoint();
    const spawnWorldPos = this.gridSystem.gridToWorld(
      spawnPoint.x,
      spawnPoint.y
    );

    let monster: BaseMonster;

    switch (type) {
      case "basic":
        monster = new BasicMonster(
          this.scene,
          spawnWorldPos.x,
          spawnWorldPos.y
        );
        break;
      case "fast":
        monster = new FastMonster(this.scene, spawnWorldPos.x, spawnWorldPos.y);
        break;
      case "tank":
        monster = new TankMonster(this.scene, spawnWorldPos.x, spawnWorldPos.y);
        break;
      default:
        return;
    }

    const path = this.pathfindingSystem.findPath(
      spawnPoint.x,
      spawnPoint.y,
      this.corePosition.x + 1,
      this.corePosition.y + 1
    );

    if (path) {
      monster.setPath(path);
      this.monsterManager.addMonster(monster);
      this.scene.events.emit("monster-spawned", monster);
    } else {
      console.warn("No path found for monster, destroying");
      monster.sprite.destroy();
    }
  }

  private getRandomSpawnPoint(): SpawnPoint {
    return this.spawnPoints[
      Math.floor(Math.random() * this.spawnPoints.length)
    ];
  }

  update(): void {
    // MonsterManager에서 업데이트 처리
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getActiveMonsters(): BaseMonster[] {
    return this.monsterManager.getActiveMonsters();
  }

  isWaveInProgress(): boolean {
    return this.isWaveActive;
  }
}
