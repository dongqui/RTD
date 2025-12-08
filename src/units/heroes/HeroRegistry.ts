import { BaseHero } from "./BaseHero";

export type HeroType =
  | "warrior"
  | "archer"
  | "mage"
  | "lightning_wizard"
  | "frozen_wizard"
  | "fire_wizard"
  | "thief"
  | "iron_knight"
  | "rush_knight"
  | "paladin"
  | "barbarian"
  | "barbarian_mercenary"
  | "immortal_hero"
  | "mace_knight"
  | "priest"
  | "ranger"
  | "bomb"
  | "lee"
  | "crossbow"
  | "dark_knight"
  | "crazy_knight"
  | "dark_mage";

export interface HeroStats {
  health: number;
  speed: number;
  attackRange: number;
  attackDamage: number;
  attackSpeed: number;

  aoe?: {
    radius: number;
    maxTargets?: number;
  };

  heal?: {
    amount: number;
    range: number;
    speed: number;
    isAoE?: boolean;
  };

  slow?: {
    duration: number;
    slowRate: number;
  };

  poison?: {
    duration: number;
    damagePerTick: number;
    tickInterval: number;
  };
}

export interface HeroVisual {
  skinColor: string;
  hairColor: string;
  skinKeys: string[];
  idleAnimKey: string;
  attackAnimKey: string;
}

export interface HeroSpec {
  id: HeroType;
  name: string;
  cost: number;
  rate: 1 | 2 | 3;
  description: string;
  cardColor?: number;
  stats: HeroStats;
  visual: HeroVisual;
  heroClass: typeof BaseHero;
  isRanged?: boolean;
}

export class HeroRegistry {
  private static specs: Record<HeroType, HeroSpec> = {} as any;

  static registerSpec(spec: HeroSpec): void {
    this.specs[spec.id] = spec;
  }

  static getSpec(type: HeroType): HeroSpec {
    const spec = this.specs[type];
    if (!spec) {
      throw new Error(`Hero spec not found for type: ${type}`);
    }
    return spec;
  }

  static getAllSpecs(): HeroSpec[] {
    return Object.values(this.specs);
  }

  static hasSpec(type: string): type is HeroType {
    return type in this.specs;
  }
}
