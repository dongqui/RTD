import { BaseUnit } from "./BaseUnit";
import { worriorSpec } from "./WarriorUnit";
import { archerSpec } from "./ArcherUnit";
import { lightningWizardSpec } from "./LightningWizard";
import { frozenWizardSpec } from "./FrozenWizard";

export type UnitType =
  | "warrior"
  | "archer"
  | "lightning_wizard"
  | "frozen_wizard";

export interface UnitStats {
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

export interface UnitVisual {
  skinColor: string;
  hairColor: string;
  skinKeys: string[];
  idleAnimKey: string;
  attackAnimKey: string;
}

export interface UnitSpec {
  id: UnitType;
  name: string;
  cost: number;
  description: string;
  cardColor?: number;
  stats: UnitStats;
  visual: UnitVisual;
  unitClass: typeof BaseUnit;
  isRanged?: boolean;
}

export class UnitRegistry {
  private static specs: Record<UnitType, UnitSpec> = {
    warrior: worriorSpec,
    archer: archerSpec,
    lightning_wizard: lightningWizardSpec,
    frozen_wizard: frozenWizardSpec,
  };

  static getSpec(type: UnitType): UnitSpec {
    const spec = this.specs[type];
    if (!spec) {
      throw new Error(`Unit spec not found for type: ${type}`);
    }
    return spec;
  }

  static getAllSpecs(): UnitSpec[] {
    return Object.values(this.specs);
  }

  static hasSpec(type: string): type is UnitType {
    return type in this.specs;
  }
}
