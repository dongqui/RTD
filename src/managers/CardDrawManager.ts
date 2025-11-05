import { CardData } from "../PlayerDeck";
import { UnitRegistry } from "../units/UnitRegistry";
import { SkillRegistry } from "../skills/SkillRegistry";
import { CardType } from "../skills/SkillTypes";
import { CardConfig } from "../ui/Card";

export interface CardOption extends CardData {
  weight?: number;
}

export class CardDrawManager {
  /**
   * Generate random card options from available units and skills
   * @param count Number of cards to generate
   * @returns Array of card options
   */
  static generateCardOptions(count: number = 3): CardOption[] {
    const cardPool: CardOption[] = [];

    // Add all units to pool
    const unitSpecs = UnitRegistry.getAllSpecs();
    unitSpecs.forEach((spec) => {
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
    if (cardData.cardType === CardType.UNIT) {
      const spec = UnitRegistry.getSpec(cardData.type);
      return {
        cost: spec.cost,
        name: spec.name,
        imageKey: `unit_portrait_${cardData.type}`,
        attack: spec.stats.attackDamage,
        health: spec.stats.health,
        description: spec.description,
        rate: spec.rate,
      };
    } else {
      const spec = SkillRegistry.getSpec(cardData.type);
      return {
        cost: spec.cost,
        name: spec.name,
        imageKey: `skill_icon_${cardData.type}`,
        attack: 0,
        health: 0,
        description: spec.description,
        rate: spec.rate || 1,
      };
    }
  }
}
