import { HeroType } from "./HeroManager";
import { HeroRegistry } from "../units/heroes";
import { CardType } from "../skills/SkillTypes";
import { LocalStorage } from "../data/LocalStorage";

export interface CardData {
  cardType: CardType;
  type: HeroType | string; // HeroType for heroes, string for skills
  cost: number;
  name: string;
  id: string;
}

export default class PlayerDeckManager {
  private static instance: PlayerDeckManager;
  private cards: CardData[] = [];
  private readonly MAX_CARDS = 20;
  private readonly STORAGE_KEY = "deck";

  private constructor() {
    this.load();

    if (this.cards.length === 0) {
      this.initializeDefaultDeck();
    }
  }

  static getInstance(): PlayerDeckManager {
    if (!PlayerDeckManager.instance) {
      PlayerDeckManager.instance = new PlayerDeckManager();
    }
    return PlayerDeckManager.instance;
  }

  private initializeDefaultDeck(): void {
    const defaultHeroTypes: HeroType[] = [
      "warrior",
      "archer",
      "lightning_wizard",
      "frozen_wizard",
    ];

    const heroCards: CardData[] = defaultHeroTypes.map((type) => {
      const spec = HeroRegistry.getSpec(type);
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

    [...heroCards].forEach((card) => this.addCard(card));
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
    LocalStorage.set(this.STORAGE_KEY, this.cards);
  }

  private load(): void {
    this.cards = LocalStorage.get<CardData[]>(this.STORAGE_KEY, []);
  }

  reset(): void {
    this.cards = [];
    this.initializeDefaultDeck();
  }
}
