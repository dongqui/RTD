import { BaseSkill } from "../BaseSkill";
import { SkillConfig, SkillContext, SkillEffectType, SkillSpec } from "../SkillTypes";

export class HealAllSkill extends BaseSkill {
  private healAmount: number;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    super(scene, config);
    this.healAmount = 50;
  }

  execute(context: SkillContext): void {
    const units = context.unitManager.getActiveUnits();
    let healedCount = 0;

    units.forEach(unit => {
      if (!unit.isDead()) {
        unit.heal(this.healAmount);
        healedCount++;
      }
    });

    console.log(`Healed ${healedCount} units for ${this.healAmount} HP each`);
  }

  canExecute(context: SkillContext): boolean {
    return context.unitManager.getActiveUnitCount() > 0;
  }
}

export const healAllSkillSpec: SkillSpec = {
  id: "heal_all",
  name: "긴급 치료",
  description: "모든 아군 유닛 체력 50 회복",
  cost: 5,
  consumable: false,
  effectType: SkillEffectType.INSTANT,
  skillClass: HealAllSkill,
};
