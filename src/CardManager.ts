import UnitCard, { UnitCardConfig } from "./ui/UnitCard";
import type { UnitType } from "./UnitManager";

export interface CardPool {
  type: UnitType;
  cost: number;
  name: string;
  weight?: number;
}

export default class CardManager {
  private scene: Phaser.Scene;
  private cards: UnitCard[];
  private cardPool: CardPool[];
  private maxCards: number = 3;
  private cardPositions: { x: number; y: number }[];
  private onCardUsed: ((card: UnitCard) => void) | null = null;

  constructor(scene: Phaser.Scene, cardPool: CardPool[]) {
    this.scene = scene;
    this.cardPool = cardPool;
    this.cards = [];
    this.calculateCardPositions();
  }

  private calculateCardPositions(): void {
    const { width, height } = this.scene.scale.gameSize;
    const cardWidth = 112;
    const cardSpacing = 15;
    const totalWidth =
      this.maxCards * cardWidth + (this.maxCards - 1) * cardSpacing;
    const startX = (width - totalWidth) / 2 + cardWidth * 0.5;
    const cardY = height - 120;

    this.cardPositions = [];
    for (let i = 0; i < this.maxCards; i++) {
      this.cardPositions.push({
        x: startX + i * (cardWidth + cardSpacing),
        y: cardY,
      });
    }
  }

  initializeCards(): void {
    this.clearCards();
    for (let i = 0; i < this.maxCards; i++) {
      this.addRandomCard(i);
    }
  }

  private addRandomCard(index: number): void {
    if (index >= this.maxCards) return;

    const config = this.getRandomCardConfig();
    const pos = this.cardPositions[index];
    const card = new UnitCard(this.scene, pos.x, pos.y, config);

    card.setOnClick(() => {
      this.handleCardClick(card, index);
    });

    this.cards[index] = card;
  }

  private getRandomCardConfig(): UnitCardConfig {
    const totalWeight = this.cardPool.reduce(
      (sum, card) => sum + (card.weight || 1),
      0
    );
    let random = Math.random() * totalWeight;

    for (const cardData of this.cardPool) {
      random -= cardData.weight || 1;
      if (random <= 0) {
        return {
          type: cardData.type,
          cost: cardData.cost,
          name: cardData.name,
        };
      }
    }

    return this.cardPool[0];
  }

  private handleCardClick(card: UnitCard, index: number): void {
    if (this.onCardUsed) {
      this.onCardUsed(card);
    }
  }

  replaceCard(index: number): void {
    if (index < 0 || index >= this.cards.length) return;

    const oldCard = this.cards[index];
    if (oldCard) {
      oldCard.destroy();
    }

    this.addRandomCard(index);
    this.updateCardStates();
  }

  resetCards(): void {
    this.clearCards();
    this.initializeCards();
  }

  private clearCards(): void {
    this.cards.forEach((card) => {
      if (card) {
        card.destroy();
      }
    });
    this.cards = [];
  }

  updateCardStates(currentResource?: number): void {
    if (currentResource === undefined) return;

    this.cards.forEach((card) => {
      if (card) {
        card.setEnabled(currentResource >= card.getCost());
      }
    });
  }

  setOnCardUsed(callback: (card: UnitCard) => void): void {
    this.onCardUsed = callback;
  }

  getCards(): UnitCard[] {
    return this.cards;
  }

  addCardToPool(cardData: CardPool): void {
    this.cardPool.push(cardData);
  }

  removeCardFromPool(type: UnitType, name: string): void {
    this.cardPool = this.cardPool.filter(
      (card) => !(card.type === type && card.name === name)
    );
  }

  getCardPool(): CardPool[] {
    return [...this.cardPool];
  }

  setVisible(visible: boolean): void {
    this.cards.forEach((card) => {
      if (card) {
        card.setVisible(visible);
      }
    });
  }

  destroy(): void {
    this.clearCards();
  }
}
