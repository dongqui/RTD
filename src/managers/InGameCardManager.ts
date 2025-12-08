import Card from "../ui/Card";
import { CardType } from "../skills/SkillTypes";
import { SAFE_AREA } from "../main";
import { CARD_WIDTH, CARD_HEIGHT } from "../constants";

export interface CardPool {
  id: string;
  cardType: CardType;
  type: string;
  cost: number;
  name: string;
  weight?: number;
}

export default class InGameCardManager {
  private scene: Phaser.Scene;
  private cards: (Card | null)[];
  private availableCards: CardPool[];
  private usedCards: Map<string, CardPool>;
  private cardsInHand: Set<string>;
  private maxCards: number = 3;
  private cardPositions: { x: number; y: number; scale: number }[];
  private onCardUsed: ((card: Card) => void) | null = null;

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
    const cardSpacing = 20;

    const sidePadding = 40;
    const cardsPerRow = 3;
    const availableWidth = width - sidePadding * 2;
    const scaledCardWidth =
      (availableWidth - cardSpacing * (cardsPerRow - 1)) / cardsPerRow;
    const scale = scaledCardWidth / CARD_WIDTH;
    const scaledCardHeight = CARD_HEIGHT * scale;

    const totalWidth =
      this.maxCards * scaledCardWidth + (this.maxCards - 1) * cardSpacing;

    const resourceUIY = height - 80;
    const resourceUIHeight = 80;

    const cardY =
      resourceUIY - resourceUIHeight / 2 - 20 - scaledCardHeight / 2;

    const centerX = (SAFE_AREA.left + SAFE_AREA.right) / 2;
    const startX = centerX - totalWidth / 2 + scaledCardWidth / 2;

    this.cardPositions = [];
    for (let i = 0; i < this.maxCards; i++) {
      this.cardPositions.push({
        x: startX + i * (scaledCardWidth + cardSpacing),
        y: cardY,
        scale: scale, // 스케일 정보 추가
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

    const card = new Card(this.scene, pos.x, pos.y, {
      cardType: cardData.cardType,
      id: cardData.id,
      type: cardData.type,
    });

    // DeckScene과 동일한 스케일 적용
    const cardContainer = (card as any).container;
    if (cardContainer && pos.scale) {
      cardContainer.setScale(pos.scale);
    }

    card.setOnClick(() => {
      this.handleCardClick(card, index);
    });

    this.cards[index] = card;
  }

  private getRandomCardFromAvailable(): CardPool | null {
    const availableNotInHand = this.availableCards.filter(
      (card) => !this.cardsInHand.has(card.id) && !this.usedCards.has(card.id)
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

  private handleCardClick(card: Card, index: number): void {
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

    this.usedCards.forEach((card) => {
      this.availableCards.push(card);
    });
    this.usedCards.clear();

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

  setOnCardUsed(callback: (card: Card) => void): void {
    this.onCardUsed = callback;
  }

  getCards(): (Card | null)[] {
    return this.cards;
  }

  getCardById(cardId: string): CardPool | undefined {
    const usedCard = this.usedCards.get(cardId);
    if (usedCard) {
      return usedCard;
    }

    return this.availableCards.find((card) => card.id === cardId);
  }

  removeUsedCard(cardId: string): void {
    this.usedCards.delete(cardId);
    this.cardsInHand.delete(cardId);
  }

  useCard(cardId: string): void {
    const cardIndex = this.availableCards.findIndex(
      (card) => card.id === cardId
    );
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
    const index = this.availableCards.findIndex((card) => card.id === cardId);
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
