import GameManager from "../GameManager";
import { MonsterManager } from "../MonsterManager";
import { UnitManager } from "../UnitManager";
import { SpawnManager } from "../SpawnManager";
import ResourceManager from "../ResourceManager";
import ResourceUI from "../ui/ResourceUI";
import Card from "../ui/Card";
import CardManager from "../CardManager";
import Base, { BaseTeam } from "../Base";
import PlayerDeck from "../PlayerDeck";

import { registerAllSkills } from "../skills/SkillIndex";
import { SAFE_AREA } from "../main";
import { SkillContext, CardType } from "../skills/SkillTypes";
import { WaveManager } from "../WaveManager";
import { WaveUI } from "../ui/WaveUI";
import { RewardCardUI } from "../ui/RewardCardUI";
import { Button } from "../ui/Button";
import { SkillRegistry } from "../skills/SkillRegistry";

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
  private infoText: Phaser.GameObjects.Text;
  private startButton: Button;
  private waveManager: WaveManager;
  private waveUI: WaveUI;
  private rewardCardUI: RewardCardUI;

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

    this.hideGameElements();
    this.createStartButton();
  }

  private setupBases(): void {
    const { height } = this.scale.gameSize;

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

    this.rewardCardUI = new RewardCardUI(this, PlayerDeck.getInstance());
    this.rewardCardUI.setVisible(false);

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

    this.events.on("add-resource", (amount: number) => {
      this.resourceManager.addResource(amount);
      console.log(`Resource added: +${amount} (from thief death)`);
    });
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

    // ResourceUI를 화면 바닥에 배치 (바텀쪽에 공간 확보)
    const resourceUIX = SAFE_AREA.left;
    const resourceUIY = height - 80; // 바닥에서 80px 위 (공간 확보)

    this.resourceUI = new ResourceUI(this, resourceUIX, resourceUIY, 10);
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

  private handleCardUsed(card: Card): void {
    if (card.getCardType() === CardType.SKILL) {
      this.useSkillCard(card);
    } else {
      this.spawnUnitFromCard(card);
    }
  }

  private spawnUnitFromCard(card: Card): void {
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

  private useSkillCard(card: Card): void {
    const cost = card.getCost();

    if (!this.resourceManager.spendResource(cost)) {
      console.log("Not enough resources!");
      return;
    }

    const skillType = card.getType();
    const skill = SkillRegistry.create(skillType as string, this);

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

    this.startButton = new Button(this, width / 2, height / 2, {
      text: "START",
      width: 300,
      height: 100,
      onClick: () => {
        console.log("Start button clicked!");
        this.startGame();
        this.startButton.destroy();
      },
    });
  }

  private startGame(): void {
    this.game.events.emit("hideNavigation");
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

    this.rewardCardUI.showRewardSelection((selectedCard) => {
      console.log("Selected reward card:", selectedCard);

      // Card is already added to deck in RewardCardUI.handleConfirm()
      // Just log the result here
      if (selectedCard) {
        console.log(`Card selection confirmed: ${selectedCard.name}`);
      } else {
        console.log("Reward skipped");
      }

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
    this.game.events.emit("showNavigation");
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
    this.game.events.emit("showNavigation");
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
