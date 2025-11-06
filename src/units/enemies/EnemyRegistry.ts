import { BaseEnemy } from "./BaseEnemy";

export type EnemyType = "enemy_warrior";

export interface EnemyStats {
  health: number;
  speed: number;
  attackRange: number;
  attackDamage: number;
  attackSpeed: number;
}

export interface EnemyVisual {
  skinColor: string;
  hairColor: string;
  skinKeys: string[];
  idleAnimKey: string;
  attackAnimKey: string;
}

export interface EnemyConfig {
  health: number;
  speed: number;
  reward: number;
  textureKey?: string;
  scale?: number;
  attackRange?: number;
  attackDamage?: number;
  attackSpeed?: number;
}

export interface EnemySpec {
  id: EnemyType;
  name: string;
  reward: number;
  stats: EnemyStats;
  visual: EnemyVisual;
  enemyClass: typeof BaseEnemy;
}

export class EnemyRegistry {
  private static specs: Record<EnemyType, EnemySpec> = {} as any;

  static registerSpec(spec: EnemySpec): void {
    this.specs[spec.id] = spec;
  }

  static getSpec(type: EnemyType): EnemySpec {
    const spec = this.specs[type];
    if (!spec) {
      throw new Error(`Enemy spec not found for type: ${type}`);
    }
    return spec;
  }

  static getAllSpecs(): EnemySpec[] {
    return Object.values(this.specs);
  }

  static hasSpec(type: string): type is EnemyType {
    return type in this.specs;
  }
}
