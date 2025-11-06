import { BaseSkill } from "../BaseSkill";
import { SkillConfig, SkillContext, SkillEffectType, SkillSpec } from "../SkillTypes";

export class HealAllSkill extends BaseSkill {
  private healAmount: number;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    super(scene, config);
    this.healAmount = 50;
  }

  execute(context: SkillContext): void {
    const heroes = context.heroManager.getActiveHeroes();
    let healedCount = 0;

    heroes.forEach(hero => {
      if (!hero.isDead()) {
        hero.heal(this.healAmount);
        healedCount++;
      }
    });

    console.log(`Healed ${healedCount} heroes for ${this.healAmount} HP each`);
  }

  canExecute(context: SkillContext): boolean {
    return context.heroManager.getActiveHeroCount() > 0;
  }
}

export const healAllSkillSpec: SkillSpec = {
  id: "heal_all",
  name: "긴급 치료",
  description: "모든 아군 유닛 체력 50 회복",
  cost: 5,
  consumable: true,
  effectType: SkillEffectType.INSTANT,
  skillClass: HealAllSkill,
};
