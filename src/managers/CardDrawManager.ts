import { CardData } from "../PlayerDeck";
import { HeroRegistry } from "../units/heroes";
import { SkillRegistry } from "../skills/SkillRegistry";
import { CardType } from "../skills/SkillTypes";
import { CardConfig } from "../ui/Card";

export interface CardOption extends CardData {
  weight?: number;
}

export class CardDrawManager {
  /**
   * Generate random card options from available heroes and skills
   * @param count Number of cards to generate
   * @returns Array of card options
   */
  static generateCardOptions(count: number = 3): CardOption[] {
    const cardPool: CardOption[] = [];

    // Add all heroes to pool
    const heroSpecs = HeroRegistry.getAllSpecs();
    heroSpecs.forEach((spec) => {
      cardPool.push({
        cardType: CardType.UNIT,
        type: spec.id,
        cost: spec.cost,
        name: spec.name,
        id: `temp_${spec.id}`,
        weight: 1,
      });
    });

    // Add all skills to pool
    const skillSpecs = SkillRegistry.getAllSpecs();
    skillSpecs.forEach((spec) => {
      cardPool.push({
        cardType: CardType.SKILL,
        type: spec.id,
        cost: spec.cost,
        name: spec.name,
        id: `temp_${spec.id}`,
        weight: 1,
      });
    });

    // Shuffle and select
    const shuffled = [...cardPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Convert CardData to CardConfig for Card component
   * @param cardData Card data to convert
   * @returns CardConfig for Card component
   */
  static cardDataToConfig(cardData: CardData): CardConfig {
    return {
      cardType: cardData.cardType,
      id: cardData.id,
      type: cardData.type,
    };
  }
}
