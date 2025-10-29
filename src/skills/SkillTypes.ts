import GameScene from "../scenes/GameScene";
import { UnitManager } from "../UnitManager";
import { MonsterManager } from "../MonsterManager";
import ResourceManager from "../ResourceManager";
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
  unitManager: UnitManager;
  monsterManager: MonsterManager;
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
