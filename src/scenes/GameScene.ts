import CameraManager from "../CameraManager";
import GameManager from "../GameManager";
import { MonsterManager } from "../MonsterManager";
import { UnitManager } from "../UnitManager";
import { SpawnManager } from "../SpawnManager";
import ResourceManager from "../ResourceManager";
import ResourceUI from "../ui/ResourceUI";
import UnitCard from "../ui/UnitCard";
import CardManager from "../CardManager";
import Base, { BaseTeam } from "../Base";
import PlayerDeck from "../PlayerDeck";

export default class GameScene extends Phaser.Scene {
  private cameraManager: CameraManager;
  private gameManager: GameManager;
  private monsterManager: MonsterManager;
  private unitManager: UnitManager;
  private spawnManager: SpawnManager;
  private resourceManager: ResourceManager;
  private resourceUI: ResourceUI;
  private cardManager: CardManager;
  private playerBase: Base;
  private enemyBase: Base;

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

    this.resourceManager = new ResourceManager(this, 10, 2000);

    this.setupBases();
    this.setupSpawnManager();
    this.setupGameEventHandlers();
    this.setupMobileOptimization();
    this.setupResourceUI();
    this.setupUnitCards();

    this.cameraManager.setupCameraDrag();

    this.gameManager.startBattle();
  }

  private setupBases(): void {
    const { width, height } = this.scale.gameSize;

    const playerBaseX = 150;
    const enemyBaseX = width - 150;
    const baseY = height / 2;

    this.playerBase = new Base(this, playerBaseX, baseY, BaseTeam.PLAYER, 100);
    this.enemyBase = new Base(this, enemyBaseX, baseY, BaseTeam.ENEMY, 100);

    this.data.set("playerBase", this.playerBase);
    this.data.set("enemyBase", this.enemyBase);
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
      if (this.playerBase && this.playerBase.isActive()) {
        this.playerBase.takeDamage(1);
      }
    });

    this.events.on("unit-reached-enemy-base", (_unit: any) => {
      if (this.enemyBase && this.enemyBase.isActive()) {
        this.enemyBase.takeDamage(1);
      }
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

  private setupResourceUI(): void {
    const { height } = this.scale.gameSize;

    this.resourceUI = new ResourceUI(this, 20, height - 80, 10);
    this.resourceUI.updateResource(this.resourceManager.getCurrentResource());

    this.events.on("resource-changed", (currentResource: number) => {
      this.resourceUI.updateResource(currentResource);
      this.updateCardStates();
    });
  }

  private setupUnitCards(): void {
    const deck = PlayerDeck.getInstance();
    const deckCards = deck.getCards();

    const cardPool = deckCards.map(card => ({
      type: card.type,
      cost: card.cost,
      name: card.name,
      weight: 1,
    }));

    if (cardPool.length === 0) {
      console.warn("No cards in deck! Using default cards.");
      const { UnitRegistry } = require("../units/UnitRegistry");
      const warriorSpec = UnitRegistry.getSpec("warrior");
      const archerSpec = UnitRegistry.getSpec("archer");
      cardPool.push(
        { type: warriorSpec.id, cost: warriorSpec.cost, name: warriorSpec.name, weight: 1 },
        { type: archerSpec.id, cost: archerSpec.cost, name: archerSpec.name, weight: 1 }
      );
    }

    this.cardManager = new CardManager(this, cardPool);
    this.cardManager.initializeCards();

    this.cardManager.setOnCardUsed((card) => {
      this.spawnUnitFromCard(card);
    });

    this.updateCardStates();
  }

  private spawnUnitFromCard(card: UnitCard): void {
    const cost = card.getCost();

    if (!this.resourceManager.spendResource(cost)) {
      console.log("Not enough resources!");
      return;
    }

    const { height } = this.scale.gameSize;
    const playerBaseX = 50;
    const spawnX = playerBaseX + 120;
    const spawnY = height / 2;

    const unitType = card.getType();

    this.unitManager.spawnUnit(unitType, spawnX, spawnY);

    console.log(`Spawned ${unitType} unit for ${cost} resources`);

    const cardIndex = this.cardManager.getCards().indexOf(card);
    if (cardIndex !== -1) {
      this.cardManager.replaceCard(cardIndex);
    }
  }

  private updateCardStates(): void {
    if (!this.cardManager) return;

    const currentResource = this.resourceManager.getCurrentResource();
    this.cardManager.updateCardStates(currentResource);
  }

  update(): void {
    if (this.monsterManager) {
      this.monsterManager.update();
    }
    if (this.unitManager) {
      this.unitManager.update(this.time.now, this.game.loop.delta);
    }
    if (this.resourceManager) {
      this.resourceManager.update(this.time.now);
    }
  }
}
