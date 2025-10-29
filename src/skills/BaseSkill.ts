import { SkillConfig, SkillContext, SkillEffectType } from "./SkillTypes";

export abstract class BaseSkill {
  protected scene: Phaser.Scene;
  protected config: SkillConfig;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    this.scene = scene;
    this.config = config;
  }

  abstract execute(context: SkillContext): void;

  canExecute(context: SkillContext): boolean {
    return true;
  }

  isConsumable(): boolean {
    return this.config.consumable;
  }

  getEffectType(): SkillEffectType {
    return this.config.effectType;
  }

  getId(): string {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getDescription(): string {
    return this.config.description;
  }

  getCost(): number {
    return this.config.cost;
  }

  getIcon(): string | undefined {
    return this.config.icon;
  }
}
