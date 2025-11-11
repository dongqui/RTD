import GameScene from "../scenes/GameScene";
import { HeroManager } from "../managers/HeroManager";
import { EnemyManager } from "../managers/EnemyManager";
import ResourceManager from "../managers/ResourceManager";
import Base from "../Base";

export enum CardType {
  UNIT = "unit",
  SKILL = "skill"
}

export enum SkillEffectType {
  INSTANT = "instant",
  DURATION = "duration"
}

export interface SkillContext {
  scene: GameScene;
  heroManager: HeroManager;
  enemyManager: EnemyManager;
  resourceManager: ResourceManager;
  playerBase: Base;
  enemyBase: Base;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon?: string;
  consumable: boolean;
  effectType: SkillEffectType;
}

export interface SkillSpec {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon?: string;
  consumable: boolean;
  effectType: SkillEffectType;
  skillClass: new (scene: Phaser.Scene, config: SkillConfig) => any;
}
