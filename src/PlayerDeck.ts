import { UnitType } from "./UnitManager";
import { UnitRegistry } from "./units/UnitRegistry";
import { CardType } from "./skills/SkillTypes";
import { SkillRegistry } from "./skills/SkillRegistry";

export interface CardData {
  cardType: CardType;
  type: UnitType;
  cost: number;
  name: string;
  id: string;
}

export default class PlayerDeck {
  private static instance: PlayerDeck;
  private cards: CardData[] = [];
  private readonly MAX_CARDS = 20;
  private readonly STORAGE_KEY = "player_deck";

  private constructor() {
    this.load();

    if (this.cards.length === 0) {
      this.initializeDefaultDeck();
    }
  }

  static getInstance(): PlayerDeck {
    if (!PlayerDeck.instance) {
      PlayerDeck.instance = new PlayerDeck();
    }
    return PlayerDeck.instance;
  }

  private initializeDefaultDeck(): void {
    const defaultUnitTypes: UnitType[] = [
      "warrior",
      "archer",
      "lightning_wizard",
      "frozen_wizard",
    ];

    const unitCards: CardData[] = defaultUnitTypes.map((type) => {
      const spec = UnitRegistry.getSpec(type);
      return {
        cardType: CardType.UNIT,
        type: spec.id,
        cost: spec.cost,
        name: spec.name,
        id: this.generateId(),
      };
    });

    const defaultSkillTypes = ["resource_boost", "heal_all"];

    // const skillCards: CardData[] = defaultSkillTypes.map((skillType) => {
    //   const spec = SkillRegistry.getSpec(skillType);
    //   return {
    //     cardType: CardType.SKILL,
    //     type: skillType as SkillType,
    //     cost: spec.cost,
    //     name: spec.name,
    //     id: this.generateId(),
    //   };
    // });

    [...unitCards].forEach((card) => this.addCard(card));
  }

  addCard(card: Omit<CardData, "id">): boolean {
    if (this.cards.length >= this.MAX_CARDS) {
      console.log("Deck is full!");
      return false;
    }

    const newCard: CardData = {
      ...card,
      id: this.generateId(),
    };

    this.cards.push(newCard);
    this.save();
    return true;
  }

  removeCard(id: string): boolean {
    const index = this.cards.findIndex((card) => card.id === id);

    if (index === -1) {
      return false;
    }

    this.cards.splice(index, 1);
    this.save();
    return true;
  }

  getCards(): CardData[] {
    return [...this.cards];
  }

  getRandomCards(count: number): CardData[] {
    const shuffled = [...this.cards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.cards.length));
  }

  getCardCount(): number {
    return this.cards.length;
  }

  getMaxCards(): number {
    return this.MAX_CARDS;
  }

  isFull(): boolean {
    return this.cards.length >= this.MAX_CARDS;
  }

  private generateId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cards));
    } catch (error) {
      console.error("Failed to save deck:", error);
    }
  }

  private load(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.cards = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load deck:", error);
      this.cards = [];
    }
  }

  reset(): void {
    this.cards = [];
    this.initializeDefaultDeck();
  }
}
