import PlayerDeck, { CardData } from "../PlayerDeck";

export default class DeckViewUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private onClose: () => void;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    this.scene = scene;
    this.onClose = onClose;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(10000);

    this.createUI();
  }

  private createUI(): void {
    const { width, height } = this.scene.scale.gameSize;

    const overlay = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setInteractive();

    const panelWidth = Math.min(width * 0.9, 800);
    const panelHeight = Math.min(height * 0.9, 600);
    const panelX = width / 2;
    const panelY = height / 2;

    const panel = this.scene.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x2a2a3a)
      .setStrokeStyle(3, 0x5555ff);

    const title = this.scene.add
      .text(panelX, panelY - panelHeight / 2 + 40, "내 카드 덱", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const deck = PlayerDeck.getInstance();
    const cards = deck.getCards();

    const countText = this.scene.add
      .text(
        panelX,
        panelY - panelHeight / 2 + 80,
        `카드: ${cards.length}/${deck.getMaxCards()}`,
        {
          fontSize: "20px",
          color: "#cccccc",
        }
      )
      .setOrigin(0.5);

    this.createCardGrid(cards, panelX, panelY, panelWidth, panelHeight);

    const closeButton = this.createCloseButton(panelX, panelY + panelHeight / 2 - 40);

    this.container.add([overlay, panel, title, countText, closeButton]);
  }

  private createCardGrid(
    cards: CardData[],
    panelX: number,
    panelY: number,
    panelWidth: number,
    panelHeight: number
  ): void {
    const cardWidth = 100;
    const cardHeight = 140;
    const cardSpacing = 10;
    const cardsPerRow = 5;
    const maxRows = 4;

    const gridStartY = panelY - panelHeight / 2 + 140;
    const gridWidth = cardsPerRow * (cardWidth + cardSpacing);
    const gridStartX = panelX - gridWidth / 2;

    cards.forEach((card, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      if (row >= maxRows) return;

      const x = gridStartX + col * (cardWidth + cardSpacing) + cardWidth / 2;
      const y = gridStartY + row * (cardHeight + cardSpacing) + cardHeight / 2;

      this.createCardSlot(card, x, y, cardWidth, cardHeight);
    });

    const deck = PlayerDeck.getInstance();
    const emptySlots = deck.getMaxCards() - cards.length;

    for (let i = 0; i < emptySlots && cards.length + i < maxRows * cardsPerRow; i++) {
      const index = cards.length + i;
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      if (row >= maxRows) break;

      const x = gridStartX + col * (cardWidth + cardSpacing) + cardWidth / 2;
      const y = gridStartY + row * (cardHeight + cardSpacing) + cardHeight / 2;

      this.createEmptySlot(x, y, cardWidth, cardHeight);
    }
  }

  private createCardSlot(
    card: CardData,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const bg = this.scene.add
      .rectangle(x, y, width, height, 0x3a3a4a)
      .setStrokeStyle(2, 0x5555ff)
      .setInteractive();

    const unitColors: Record<string, number> = {
      warrior: 0xff4444,
      archer: 0x44ff44,
    };

    const icon = this.scene.add.circle(x, y - 30, 20, unitColors[card.type] || 0xffffff);

    const nameText = this.scene.add
      .text(x, y + 10, card.name, {
        fontSize: "14px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const costText = this.scene.add
      .text(x, y + 40, `${card.cost}`, {
        fontSize: "24px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => {
      bg.setStrokeStyle(2, 0xffff00);
      this.scene.input.setDefaultCursor("pointer");
    });

    bg.on("pointerout", () => {
      bg.setStrokeStyle(2, 0x5555ff);
      this.scene.input.setDefaultCursor("default");
    });

    bg.on("pointerdown", () => {
      this.confirmRemoveCard(card);
    });

    this.container.add([bg, icon, nameText, costText]);
  }

  private createEmptySlot(x: number, y: number, width: number, height: number): void {
    const bg = this.scene.add
      .rectangle(x, y, width, height, 0x1a1a2a)
      .setStrokeStyle(2, 0x3a3a4a, 0.5);

    const emptyText = this.scene.add
      .text(x, y, "빈 슬롯", {
        fontSize: "12px",
        color: "#666666",
      })
      .setOrigin(0.5);

    this.container.add([bg, emptyText]);
  }

  private confirmRemoveCard(card: CardData): void {
    const confirmed = confirm(`${card.name} 카드를 제거하시겠습니까?`);

    if (confirmed) {
      PlayerDeck.getInstance().removeCard(card.id);
      this.destroy();
      this.onClose();
    }
  }

  private createCloseButton(x: number, y: number): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);

    const bg = this.scene.add
      .rectangle(0, 0, 200, 50, 0x4a4a8a)
      .setInteractive()
      .setStrokeStyle(2, 0x6a6aaa);

    const text = this.scene.add
      .text(0, 0, "닫기", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => {
      bg.setFillStyle(0x5a5a9a);
      this.scene.input.setDefaultCursor("pointer");
    });

    bg.on("pointerout", () => {
      bg.setFillStyle(0x4a4a8a);
      this.scene.input.setDefaultCursor("default");
    });

    bg.on("pointerdown", () => {
      this.destroy();
      this.onClose();
    });

    buttonContainer.add([bg, text]);

    return buttonContainer;
  }

  destroy(): void {
    this.container.destroy();
  }
}
