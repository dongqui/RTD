import { BaseSkill } from "../BaseSkill";
import { SkillConfig, SkillContext, SkillEffectType, SkillSpec } from "../SkillTypes";
import { MoveSpeedEffect } from "../../fsm/effects/MoveSpeedEffect";

export class SlowMonsterSkill extends BaseSkill {
  private duration: number;
  private multiplier: number;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    super(scene, config);
    this.duration = 5000;
    this.multiplier = 0.2;
  }

  execute(context: SkillContext): void {
    const monsters = context.monsterManager.getActiveMonsters();

    if (monsters.length === 0) {
      console.log("No monsters to slow");
      return;
    }

    monsters.forEach(monster => {
      const effect = new MoveSpeedEffect(this.duration, this.multiplier);
      monster.statusEffects.addEffect(effect);
    });

    console.log(`Applied slow debuff to ${monsters.length} monsters`);
  }

  canExecute(context: SkillContext): boolean {
    return context.monsterManager.getActiveMonsterCount() > 0;
  }
}

export const slowMonsterSkillSpec: SkillSpec = {
  id: "slow_monster",
  name: "빙결",
  description: "5초간 모든 적 이동 속도 -80%",
  cost: 6,
  consumable: true,
  effectType: SkillEffectType.DURATION,
  skillClass: SlowMonsterSkill,
};
