import GameManager from "../GameManager";
import { MonsterManager } from "../MonsterManager";
import { UnitManager } from "../UnitManager";
import { SpawnManager } from "../SpawnManager";
import ResourceManager from "../ResourceManager";
import ResourceUI from "../ui/ResourceUI";
import UnitCard from "../ui/UnitCard";
import { SkillCard } from "../cards/SkillCard";
import CardManager from "../CardManager";
import Base, { BaseTeam } from "../Base";
import PlayerDeck from "../PlayerDeck";
import BottomNavigation from "../ui/BottomNavigation";
import { UnitRegistry } from "../units/UnitRegistry";
import { registerAllSkills } from "../skills/SkillIndex";
import { SAFE_AREA } from "../main";
import { SkillContext } from "../skills/SkillTypes";
import { WaveManager } from "../WaveManager";
import { WaveUI } from "../ui/WaveUI";
import { CardDrawUI } from "../ui/CardDrawUI";

export default class GameScene extends Phaser.Scene {
  private gameManager: GameManager;
  private monsterManager: MonsterManager;
  private unitManager: UnitManager;
  private spawnManager: SpawnManager;
  private resourceManager: ResourceManager;
  private resourceUI: ResourceUI;
  private cardManager: CardManager;
  private playerBase: Base;
  private enemyBase: Base;
  private navigation: BottomNavigation;
  private infoText: Phaser.GameObjects.Text;
  private startButton: Phaser.GameObjects.Rectangle;
  private startButtonText: Phaser.GameObjects.Text;
  private waveManager: WaveManager;
  private waveUI: WaveUI;
  private cardDrawUI: CardDrawUI;

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
    registerAllSkills();

    const { width, height } = this.scale.gameSize;

    const background = this.add
      .image(width / 2, height / 2, "background_game")
      .setOrigin(0.5)
      .setDepth(-1);

    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);

    background.setScale(scale);

    this.gameManager = new GameManager(this);

    this.monsterManager = new MonsterManager(this);
    this.unitManager = new UnitManager(this);

    this.resourceManager = new ResourceManager(this, 10, 2000);

    this.setupBases();
    this.setupSpawnManager();
    this.setupWaveManager();
    this.setupGameEventHandlers();
    this.setupResourceUI();
    this.setupUnitCards();

    this.navigation = new BottomNavigation(this);

    this.hideGameElements();
    this.createStartButton();
  }

  private setupBases(): void {
    const { width, height } = this.scale.gameSize;

    const playerBaseX = SAFE_AREA.left;
    const enemyBaseX = SAFE_AREA.right;
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

  private setupWaveManager(): void {
    const { width } = this.scale.gameSize;

    this.waveManager = WaveManager.getInstance();
    this.waveManager.initialize(this, this.spawnManager, this.monsterManager);

    this.waveUI = new WaveUI(this, width / 2, 50);
    this.waveUI.updateWave(
      this.waveManager.getCurrentWave(),
      this.waveManager.getTotalWaves()
    );
    this.waveUI.setVisible(false);

    this.cardDrawUI = new CardDrawUI(this, PlayerDeck.getInstance());
    this.cardDrawUI.setVisible(false);

    this.events.on("wave-monster-spawned", () => {
      this.waveManager.onMonsterSpawned();
    });

    this.events.on("wave-started", (waveNumber: number) => {
      console.log(`Wave ${waveNumber} started`);
      this.waveUI.setVisible(true);
      this.waveUI.showWaveStartAnimation(waveNumber);
      this.waveUI.updateWave(waveNumber, this.waveManager.getTotalWaves());
    });

    this.events.on("wave-completed", (waveNumber: number) => {
      console.log(`Wave ${waveNumber} completed (received event)`);

      if (waveNumber === -1) {
        console.log("Enemy base destroyed, completing wave");
        const currentWave = this.waveManager.getCurrentWave();
        const totalWaves = this.waveManager.getTotalWaves();

        this.waveUI.showWaveCompletedAnimation(currentWave);

        if (currentWave >= totalWaves) {
          console.log("Last wave completed!");
          this.time.delayedCall(2500, () => {
            this.gameManager.gameClear();
          });
        } else {
          console.log("Showing reward selection");
          this.time.delayedCall(2500, () => {
            this.showRewardSelection();
          });
        }
      }
    });

    this.events.on("wave-failed", () => {
      this.gameManager.gameOver();
    });
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

    this.events.on("unit-died", (cardId: string) => {
      this.onUnitDied(cardId);
    });

    this.createUI();
  }

  private onUnitDied(cardId: string): void {
    if (!cardId) return;

    this.cardManager.returnCard(cardId);
    console.log(`Card returned to deck: ${cardId}`);

    for (let i = 0; i < this.cardManager.getCards().length; i++) {
      const card = this.cardManager.getCards()[i];
      if (!card) {
        this.cardManager.replaceCard(i);
        break;
      }
    }

    this.updateCardStates();
  }

  private createUI(): void {
    const { width, height } = this.scale.gameSize;
    const isMobile = width < 800 || height < 600;

    this.infoText = this.add
      .text(10, 10, "", {
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
      this.infoText.setText(text);
    };

    this.events.on("player-base-damaged", updateInfo);
    this.events.on("enemy-base-damaged", updateInfo);
    this.events.on("gold-changed", updateInfo);

    updateInfo();
  }

  private showGameOverScreen(): void {
    const { width, height } = this.scale.gameSize;

    const resultText = this.add
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
    this.hideGameElements();

    this.time.delayedCall(2000, () => {
      resultText.destroy();
      this.resetToInitialState();
    });
  }

  private showGameClearScreen(): void {
    const { width, height } = this.scale.gameSize;

    const resultText = this.add
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
    this.hideGameElements();

    this.time.delayedCall(2000, () => {
      resultText.destroy();
      this.resetToInitialState();
    });
  }

  private setupResourceUI(): void {
    const { height } = this.scale.gameSize;

    this.resourceUI = new ResourceUI(this, 10, height - 180, 10);
    this.resourceUI.updateResource(this.resourceManager.getCurrentResource());

    this.events.on("resource-changed", (currentResource: number) => {
      this.resourceUI.updateResource(currentResource);
      this.updateCardStates();
    });
  }

  private setupUnitCards(): void {
    const deck = PlayerDeck.getInstance();
    const deckCards = deck.getCards();

    const cardPool = deckCards.map((card) => ({
      id: card.id,
      cardType: card.cardType,
      type: card.type,
      cost: card.cost,
      name: card.name,
      weight: 1,
    }));

    this.cardManager = new CardManager(this, cardPool);
    this.cardManager.initializeCards();

    this.cardManager.setOnCardUsed((card) => {
      this.handleCardUsed(card);
    });

    this.updateCardStates();
  }

  private handleCardUsed(card: UnitCard | SkillCard): void {
    if (card instanceof SkillCard) {
      this.useSkillCard(card);
    } else {
      this.spawnUnitFromCard(card);
    }
  }

  private spawnUnitFromCard(card: UnitCard): void {
    const cost = card.getCost();

    if (!this.resourceManager.spendResource(cost)) {
      console.log("Not enough resources!");
      return;
    }

    const { height } = this.scale.gameSize;
    const spawnX = this.playerBase.getX() - 20;
    const randomYOffset = Phaser.Math.Between(-100, 100);
    const spawnY = height / 2 + randomYOffset;

    const unitType = card.getType();
    const cardId = card.getCardId();

    this.unitManager.spawnUnit(unitType, spawnX, spawnY, cardId);

    this.cardManager.useCard(cardId);

    console.log(
      `Spawned ${unitType} unit for ${cost} resources (cardId: ${cardId})`
    );

    const cardIndex = this.cardManager.getCards().indexOf(card);
    if (cardIndex !== -1) {
      this.cardManager.replaceCard(cardIndex);
    }
  }

  private useSkillCard(card: SkillCard): void {
    const cost = card.getCost();

    if (!this.resourceManager.spendResource(cost)) {
      console.log("Not enough resources!");
      return;
    }

    const skill = card.getSkill();
    if (!skill) {
      console.error("Skill not found for card");
      return;
    }

    const context: SkillContext = {
      scene: this,
      unitManager: this.unitManager,
      monsterManager: this.monsterManager,
      resourceManager: this.resourceManager,
      playerBase: this.playerBase,
      enemyBase: this.enemyBase,
    };

    if (!skill.canExecute(context)) {
      console.log("Cannot execute skill");
      this.resourceManager.addResource(cost);
      return;
    }

    skill.execute(context);

    const cardId = card.getCardId();

    if (skill.isConsumable()) {
      this.cardManager.removeCardFromPool(cardId);
    }

    console.log(
      `Used skill ${skill.getName()} for ${cost} resources (cardId: ${cardId})`
    );

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

  private createStartButton(): void {
    const { width, height } = this.scale.gameSize;

    this.startButton = this.add
      .rectangle(width / 2, height / 2, 300, 100, 0x4a9eff)
      .setInteractive({ useHandCursor: true })
      .setDepth(10000);

    this.startButtonText = this.add
      .text(width / 2, height / 2, "START", {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10001);

    this.startButton.on("pointerover", () => {
      this.startButton.setFillStyle(0x5aafff);
      this.startButtonText.setScale(1.1);
    });

    this.startButton.on("pointerout", () => {
      this.startButton.setFillStyle(0x4a9eff);
      this.startButtonText.setScale(1);
    });

    this.startButton.on("pointerdown", () => {
      this.startButton.setFillStyle(0x3a8eef);
      this.startButtonText.setScale(0.95);
    });

    this.startButton.on("pointerup", () => {
      this.startGame();
      this.startButton.destroy();
      this.startButtonText.destroy();
    });
  }

  private startGame(): void {
    this.navigation.hide();
    this.showGameElements();
    this.gameManager.startBattle();
    this.startWave();
  }

  private startWave(): void {
    this.waveManager.startWave();
  }

  private showRewardSelection(): void {
    this.spawnManager.stop();
    this.cardManager.setVisible(false);
    this.resourceUI.setVisible(false);

    this.cardDrawUI.show((selectedCard) => {
      console.log("Selected reward card:", selectedCard);

      const deck = PlayerDeck.getInstance();
      const added = deck.addCard({
        cardType: selectedCard.cardType,
        type: selectedCard.type,
        cost: selectedCard.cost,
        name: selectedCard.name,
      });

      if (added) {
        console.log(`Added ${selectedCard.name} to deck`);
      } else {
        console.warn("Failed to add card to deck (deck might be full)");
      }

      this.cardDrawUI.hide();
      this.cardManager.setVisible(true);
      this.resourceUI.setVisible(true);

      this.waveManager.onRewardSelected();

      this.resetToNextWave();
    });
  }

  private resetToNextWave(): void {
    this.monsterManager.clear();
    this.unitManager.clear();
    this.playerBase.reset();
    this.enemyBase.reset();
    this.cardManager.resetCards();
    this.hideGameElements();
    this.waveUI.setVisible(false);
    this.navigation.show();
    this.createStartButton();
  }

  private hideGameElements(): void {
    if (this.resourceUI) {
      this.resourceUI.setVisible(false);
    }
    if (this.cardManager) {
      this.cardManager.setVisible(false);
    }
    if (this.infoText) {
      this.infoText.setVisible(false);
    }
  }

  private showGameElements(): void {
    if (this.resourceUI) {
      this.resourceUI.setVisible(true);
    }
    if (this.cardManager) {
      this.cardManager.setVisible(true);
    }
    if (this.infoText) {
      this.infoText.setVisible(true);
    }
  }

  private resetToInitialState(): void {
    this.monsterManager.clear();
    this.unitManager.clear();
    this.gameManager.reset();
    this.waveManager.reset();
    this.waveUI.updateWave(0, this.waveManager.getTotalWaves());
    this.waveUI.hideStartButton();

    PlayerDeck.getInstance().reset();

    this.cardManager.resetCards();
    this.hideGameElements();
    this.navigation.show();
    this.createStartButton();
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
    if (this.waveManager && this.waveUI) {
      const remaining = this.waveManager.getMonstersRemaining();
      this.waveUI.updateEnemies(remaining);
    }
  }
}
