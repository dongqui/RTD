import { BaseUnit } from "./BaseUnit";
import { WarriorUnit } from "./WarriorUnit";
import { ArcherUnit } from "./ArcherUnit";
import { LightningWizard } from "./LightningWizard";

export type UnitType =
  | "warrior"
  | "archer"
  | "lightning_wizard";

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
}

export class UnitRegistry {
  private static specs: Record<UnitType, UnitSpec> = {
    warrior: {
      id: "warrior",
      name: "전사",
      cost: 2,
      description: "근접 탱커",
      cardColor: 0xff4444,
      stats: {
        health: 300,
        speed: 60,
        attackRange: 50,
        attackDamage: 15,
        attackSpeed: 1000,
      },
      visual: {
        skinColor: "#f5cfb3",
        hairColor: "#f9fd17",
        skinKeys: [
          "boots/boots_f_2",
          "bottom/bottom_f_1",
          "eyes/eyes_f_9",
          "gear_right/gear_right_f_11",
          "gear_left/gear_left_f_11",
          "hair_short/hair_short_f_1",
          "mouth/mouth_f_2",
          "skin/skin_1",
          "top/top_f_56",
        ],
        attackAnimKey: "Attack3",
      },
      unitClass: WarriorUnit,
    },

    archer: {
      id: "archer",
      name: "궁수",
      cost: 3,
      description: "원거리 공격",
      cardColor: 0x44ff44,
      stats: {
        health: 30,
        speed: 50,
        attackRange: 150,
        attackDamage: 10,
        attackSpeed: 800,
      },
      visual: {
        skinColor: "#ffc294",
        hairColor: "#212121",
        skinKeys: [
          "back/back_f_21",
          "boots/boots_f_2",
          "bottom/bottom_f_1",
          "eyes/eyes_f_9",
          "gear_right/gear_right_f_25",
          "hair_short/hair_short_f_1",
          "mouth/mouth_f_2",
          "skin/skin_1",
          "top/top_f_56",
        ],
        attackAnimKey: "Attack_Bow",
      },
      unitClass: ArcherUnit,
    },

    lightning_wizard: {
      id: "lightning_wizard",
      name: "전격 마도사",
      cost: 6,
      description: "공격할수록 공속 증가, 이동 시 초기화",
      cardColor: 0xffff44,
      stats: {
        health: 30,
        speed: 50,
        attackRange: 150,
        attackDamage: 10,
        attackSpeed: 800,
      },
      visual: {
        skinColor: "#f5cfb3",
        hairColor: "#f9fd17",
        skinKeys: [
          "boots/boots_f_12",
          "bottom/bottom_f_29",
          "eyewear/eyewear_f_26",
          "gear_left/gear_left_f_24",
          "gloves/gloves_f_14",
          "hair_short/hair_short_f_15",
          "mouth/mouth_f_9",
          "skin/skin_1",
          "top/top_f_41",
        ],
        attackAnimKey: "Attack3",
      },
      unitClass: LightningWizard,
    },
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
