import PlayerDeck, { CardData } from "../PlayerDeck";
import { UnitRegistry } from "../units/UnitRegistry";
import { SkillRegistry } from "../skills/SkillRegistry";
import { CardType } from "../skills/SkillTypes";

interface CardOption extends CardData {
  weight?: number;
}

export class CardDrawUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private onSelectCallback: ((card: CardData) => void) | null = null;
  private cardOptions: CardOption[] = [];
  private deck: PlayerDeck;

  constructor(scene: Phaser.Scene, deck: PlayerDeck) {
    this.scene = scene;
    this.deck = deck;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(10000);
    this.container.setVisible(false);
  }

  private generateCardOptions(): void {
    const cardPool: CardOption[] = [];

    const unitSpecs = UnitRegistry.getAllSpecs();
    unitSpecs.forEach(spec => {
      cardPool.push({
        cardType: CardType.UNIT,
        type: spec.id,
        cost: spec.cost,
        name: spec.name,
        id: `temp_${spec.id}`,
        weight: 1
      });
    });

    const skillSpecs = SkillRegistry.getAllSpecs();
    skillSpecs.forEach(spec => {
      cardPool.push({
        cardType: CardType.SKILL,
        type: spec.id,
        cost: spec.cost,
        name: spec.name,
        id: `temp_${spec.id}`,
        weight: 1
      });
    });

    const shuffled = [...cardPool].sort(() => Math.random() - 0.5);
    this.cardOptions = shuffled.slice(0, 3);
  }

  private createUI(): void {
    const { width, height } = this.scene.scale.gameSize;

    const overlay = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setInteractive();

    const panelWidth = Math.min(width * 0.9, 900);
    const panelHeight = Math.min(height * 0.8, 500);
    const panelX = width / 2;
    const panelY = height / 2;

    const panel = this.scene.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x2a2a3a)
      .setStrokeStyle(3, 0x5555ff);

    const title = this.scene.add
      .text(panelX, panelY - panelHeight / 2 + 40, "카드 뽑기", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const subtitle = this.scene.add
      .text(panelX, panelY - panelHeight / 2 + 80, "카드를 선택하세요 (1장)", {
        fontSize: "20px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    const skipButton = this.createSkipButton(panelX, panelY + panelHeight / 2 - 40);

    this.container.add([overlay, panel, title, subtitle, skipButton]);

    this.createCardOptions(panelX, panelY, panelWidth, panelHeight);
  }

  private createCardOptions(
    panelX: number,
    panelY: number,
    panelWidth: number,
    panelHeight: number
  ): void {
    const cardWidth = 140;
    const cardHeight = 200;
    const cardSpacing = 40;
    const totalCardsWidth = 3 * cardWidth + 2 * cardSpacing;
    const startX = panelX - totalCardsWidth / 2 + cardWidth / 2;
    const cardY = panelY;

    this.cardOptions.forEach((option, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      this.createDrawCard(option, x, cardY, cardWidth, cardHeight);
    });
  }

  private createDrawCard(
    option: CardOption,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add
      .rectangle(0, 0, width, height, 0x3a3a4a)
      .setStrokeStyle(3, 0x5555ff)
      .setInteractive();

    const typeLabel = this.scene.add
      .text(0, -60, option.cardType === CardType.SKILL ? "SKILL" : "UNIT", {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    const nameText = this.scene.add
      .text(0, -20, option.name, {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const costLabel = this.scene.add
      .text(0, 40, "COST", {
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const costText = this.scene.add
      .text(0, 65, `${option.cost}`, {
        fontSize: "32px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => {
      bg.setStrokeStyle(3, 0xffff00);
      bg.setFillStyle(0x4a4a5a);
      this.scene.input.setDefaultCursor("pointer");
      this.scene.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    bg.on("pointerout", () => {
      bg.setStrokeStyle(3, 0x5555ff);
      bg.setFillStyle(0x3a3a4a);
      this.scene.input.setDefaultCursor("default");
      this.scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    bg.on("pointerdown", () => {
      this.selectCard(option);
    });

    container.add([bg, typeLabel, nameText, costLabel, costText]);
    this.container.add(container);

    this.scene.tweens.add({
      targets: container,
      y: y,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1 },
      duration: 300,
      delay: 100 * (this.cardOptions.indexOf(option)),
      ease: "Back.easeOut",
    });
  }

  private selectCard(option: CardOption): void {
    if (this.deck.isFull()) {
      alert("덱이 가득 찼습니다! (최대 20장)");
      return;
    }

    const added = this.deck.addCard(option);

    if (added && this.onSelectCallback) {
      this.hide();
      this.onSelectCallback(option as CardData);
    }
  }

  show(onSelect: (card: CardData) => void): void {
    if (this.container.visible) {
      console.warn("CardDrawUI is already visible, skipping show()");
      return;
    }

    this.onSelectCallback = onSelect;
    this.cardOptions = [];
    this.container.removeAll(true);

    this.generateCardOptions();
    this.createUI();
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  setVisible(visible: boolean): void {
    if (this.container.visible === visible) return;
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }

  private createSkipButton(x: number, y: number): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);

    const bg = this.scene.add
      .rectangle(0, 0, 200, 50, 0x4a4a4a)
      .setInteractive()
      .setStrokeStyle(2, 0x6a6a6a);

    const text = this.scene.add
      .text(0, 0, "스킵", {
        fontSize: "24px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => {
      bg.setFillStyle(0x5a5a5a);
      this.scene.input.setDefaultCursor("pointer");
    });

    bg.on("pointerout", () => {
      bg.setFillStyle(0x4a4a4a);
      this.scene.input.setDefaultCursor("default");
    });

    bg.on("pointerdown", () => {
      this.hide();
      if (this.onSelectCallback) {
        this.onSelectCallback(null as any);
      }
    });

    buttonContainer.add([bg, text]);

    return buttonContainer;
  }
}
