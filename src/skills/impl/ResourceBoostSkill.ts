import { BaseSkill } from "../BaseSkill";
import { SkillConfig, SkillContext, SkillEffectType, SkillSpec } from "../SkillTypes";

export class ResourceBoostSkill extends BaseSkill {
  private amount: number;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    super(scene, config);
    this.amount = 5;
  }

  execute(context: SkillContext): void {
    context.resourceManager.addResource(this.amount);
    console.log(`Resource boosted by ${this.amount}`);
  }

  canExecute(context: SkillContext): boolean {
    return context.resourceManager.getCurrentResource() < context.resourceManager.getMaxResource();
  }
}

export const resourceBoostSkillSpec: SkillSpec = {
  id: "resource_boost",
  name: "마나 폭발",
  description: `즉시 리소스 5 회복`,
  cost: 2,
  consumable: false,
  effectType: SkillEffectType.INSTANT,
  skillClass: ResourceBoostSkill,
};
