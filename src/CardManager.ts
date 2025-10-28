import UnitCard, { UnitCardConfig } from "./ui/UnitCard";
import { SkillCard, SkillCardConfig } from "./cards/SkillCard";
import type { UnitType } from "./UnitManager";
import { CardType } from "./skills/SkillTypes";

export interface CardPool {
  id: string;
  cardType: CardType;
  type: string;
  cost: number;
  name: string;
  weight?: number;
}

export default class CardManager {
  private scene: Phaser.Scene;
  private cards: (UnitCard | SkillCard)[];
  private availableCards: CardPool[];
  private usedCards: Map<string, CardPool>;
  private cardsInHand: Set<string>;
  private maxCards: number = 3;
  private cardPositions: { x: number; y: number }[];
  private onCardUsed: ((card: UnitCard | SkillCard) => void) | null = null;

  constructor(scene: Phaser.Scene, cardPool: CardPool[]) {
    this.scene = scene;
    this.availableCards = [...cardPool];
    this.usedCards = new Map();
    this.cardsInHand = new Set();
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

    const cardData = this.getRandomCardFromAvailable();
    if (!cardData) {
      this.cards[index] = null;
      return;
    }

    this.cardsInHand.add(cardData.id);

    const pos = this.cardPositions[index];
    let card: UnitCard | SkillCard;

    if (cardData.cardType === CardType.SKILL) {
      const skillConfig: SkillCardConfig = {
        id: cardData.id,
        skillType: cardData.type,
        cost: cardData.cost,
        name: cardData.name,
      };
      card = new SkillCard(this.scene, pos.x, pos.y, skillConfig);
    } else {
      const unitConfig: UnitCardConfig = {
        id: cardData.id,
        type: cardData.type as UnitType,
        cost: cardData.cost,
        name: cardData.name,
      };
      card = new UnitCard(this.scene, pos.x, pos.y, unitConfig);
    }

    card.setOnClick(() => {
      this.handleCardClick(card, index);
    });

    this.cards[index] = card;
  }

  private getRandomCardFromAvailable(): CardPool | null {
    const availableNotInHand = this.availableCards.filter(
      card => !this.cardsInHand.has(card.id) && !this.usedCards.has(card.id)
    );

    if (availableNotInHand.length === 0) {
      return null;
    }

    const totalWeight = availableNotInHand.reduce(
      (sum, card) => sum + (card.weight || 1),
      0
    );
    let random = Math.random() * totalWeight;

    for (const cardData of availableNotInHand) {
      random -= cardData.weight || 1;
      if (random <= 0) {
        return cardData;
      }
    }

    return availableNotInHand[0];
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
      this.cardsInHand.delete(oldCard.getCardId());
      oldCard.destroy();
    }

    this.addRandomCard(index);
    this.updateCardStates();
  }

  resetCards(): void {
    this.clearCards();
    this.cardsInHand.clear();
    this.initializeCards();
  }

  private clearCards(): void {
    this.cards.forEach((card) => {
      if (card) {
        card.destroy();
      }
    });
    this.cards = [];
    this.cardsInHand.clear();
  }

  updateCardStates(currentResource?: number): void {
    if (currentResource === undefined) return;

    this.cards.forEach((card) => {
      if (card) {
        card.setEnabled(currentResource >= card.getCost());
      }
    });
  }

  setOnCardUsed(callback: (card: UnitCard | SkillCard) => void): void {
    this.onCardUsed = callback;
  }

  getCards(): (UnitCard | SkillCard)[] {
    return this.cards;
  }

  useCard(cardId: string): void {
    const cardIndex = this.availableCards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      const card = this.availableCards.splice(cardIndex, 1)[0];
      this.usedCards.set(cardId, card);
    }
  }

  returnCard(cardId: string): void {
    const card = this.usedCards.get(cardId);
    if (card) {
      this.usedCards.delete(cardId);
      this.availableCards.push(card);
    }
  }

  addCardToPool(cardData: CardPool): void {
    this.availableCards.push(cardData);
  }

  removeCardFromPool(cardId: string): void {
    const index = this.availableCards.findIndex(card => card.id === cardId);
    if (index !== -1) {
      this.availableCards.splice(index, 1);
    }
  }

  getAvailableCards(): CardPool[] {
    return [...this.availableCards];
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
