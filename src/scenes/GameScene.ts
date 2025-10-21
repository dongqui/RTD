import CameraManager from "../CameraManager";
import GameManager from "../GameManager";
import { MonsterManager } from "../MonsterManager";
import { UnitManager } from "../UnitManager";
import { SpawnManager } from "../SpawnManager";

export default class GameScene extends Phaser.Scene {
  private cameraManager: CameraManager;
  private gameManager: GameManager;
  private monsterManager: MonsterManager;
  private unitManager: UnitManager;
  private spawnManager: SpawnManager;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.spineJson(
      "fantasy_character",
      "assets/spine/Fantasy Character.json"
    );
    this.load.spineAtlas(
      "fantasy_character-atlas",
      "assets/spine/Fantasy Character.atlas.txt"
    );
  }

  create() {
    this.gameManager = new GameManager(this);
    this.cameraManager = new CameraManager(this);
    this.gameManager.setCameraManager(this.cameraManager);

    this.monsterManager = new MonsterManager(this);
    this.unitManager = new UnitManager(this);

    this.setupBases();
    this.setupSpawnManager();
    this.setupGameEventHandlers();
    this.setupMobileOptimization();

    this.cameraManager.setupCameraDrag();

    this.gameManager.startBattle();
  }

  private setupBases(): void {
    const { width, height } = this.scale.gameSize;

    const playerBaseX = 50;
    const enemyBaseX = width - 50;
    const baseY = height / 2;

    const playerBase = this.add
      .rectangle(playerBaseX, baseY, 100, 100, 0x0000ff)
      .setDepth(0);

    const enemyBase = this.add
      .rectangle(enemyBaseX, baseY, 100, 100, 0xff0000)
      .setDepth(0);

    this.data.set("playerBase", playerBase);
    this.data.set("enemyBase", enemyBase);
  }

  private setupSpawnManager(): void {
    this.spawnManager = new SpawnManager(
      this,
      this.gameManager,
      this.unitManager,
      this.monsterManager
    );
  }

  private setupMobileOptimization(): void {
    this.input.addPointer(2);
    this.scale.on("resize", this.handleResize, this);
    this.handleResize();
  }

  private handleResize(): void {
    const { width, height } = this.scale.gameSize;

    this.cameras.main.setBounds(0, 0, width, height);

    if (width < 800 || height < 600) {
      this.cameras.main.setZoom(0.8);
    } else {
      this.cameras.main.setZoom(1);
    }
  }

  private setupGameEventHandlers(): void {
    this.events.on(
      "monster-manager-killed",
      (_monster: any, reward: number) => {
        this.gameManager.addGold(reward);
      }
    );

    this.events.on("monster-manager-reached-player-base", (_monster: any) => {
      this.gameManager.damagePlayerBase(1);
    });

    this.events.on("unit-reached-enemy-base", (_unit: any) => {
      this.gameManager.damageEnemyBase(1);
    });

    this.events.on("battle-started", () => {
      console.log("Battle started!");
    });

    this.events.on("game-over", () => {
      console.log("Game Over!");
      this.showGameOverScreen();
    });

    this.events.on("game-clear", () => {
      console.log("Game Clear!");
      this.showGameClearScreen();
    });

    this.createUI();
  }

  private createUI(): void {
    const { width, height } = this.scale.gameSize;
    const isMobile = width < 800 || height < 600;

    const infoText = this.add
      .text(20, 20, "", {
        fontSize: isMobile ? "20px" : "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: isMobile ? 15 : 10, y: isMobile ? 8 : 5 },
      })
      .setScrollFactor(0)
      .setDepth(9999);

    const updateInfo = () => {
      const text = isMobile
        ? `Player HP: ${this.gameManager.getPlayerBaseHealth()} | Enemy HP: ${this.gameManager.getEnemyBaseHealth()} | Gold: ${this.gameManager.getGold()}`
        : `Player Base: ${this.gameManager.getPlayerBaseHealth()} | Enemy Base: ${this.gameManager.getEnemyBaseHealth()} | Gold: ${this.gameManager.getGold()}`;
      infoText.setText(text);
    };

    this.events.on("player-base-damaged", updateInfo);
    this.events.on("enemy-base-damaged", updateInfo);
    this.events.on("gold-changed", updateInfo);

    updateInfo();
  }

  private showGameOverScreen(): void {
    const { width, height } = this.scale.gameSize;

    this.add
      .text(width / 2, height / 2, "GAME OVER", {
        fontSize: "64px",
        color: "#ff0000",
        backgroundColor: "#000000",
        padding: { x: 40, y: 20 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10000);

    this.spawnManager.stop();
  }

  private showGameClearScreen(): void {
    const { width, height } = this.scale.gameSize;

    this.add
      .text(width / 2, height / 2, "VICTORY!", {
        fontSize: "64px",
        color: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 40, y: 20 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10000);

    this.spawnManager.stop();
  }

  update(): void {
    if (this.monsterManager) {
      this.monsterManager.update();
    }
    if (this.unitManager) {
      this.unitManager.update(this.time.now, this.game.loop.delta);
    }
  }
}
