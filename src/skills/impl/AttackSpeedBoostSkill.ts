import { BaseSkill } from "../BaseSkill";
import {
  SkillConfig,
  SkillContext,
  SkillEffectType,
  SkillSpec,
} from "../SkillTypes";
import { AttackSpeedEffect } from "../../fsm/effects/AttackSpeedEffect";

export class AttackSpeedBoostSkill extends BaseSkill {
  private duration: number;
  private multiplier: number;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    super(scene, config);
    this.duration = 10000;
    this.multiplier = 1.5;
  }

  execute(context: SkillContext): void {
    const units = context.unitManager.getActiveUnits();

    if (units.length === 0) {
      console.log("No units to buff");
      return;
    }

    units.forEach((unit) => {
      const effect = new AttackSpeedEffect(this.duration, this.multiplier);
      unit.statusEffects.addEffect(effect);
    });

    console.log(`Applied attack speed buff to ${units.length} units`);
  }

  canExecute(context: SkillContext): boolean {
    return context.unitManager.getActiveUnitCount() > 0;
  }
}

export const attackSpeedBoostSkillSpec: SkillSpec = {
  id: "attack_speed_boost",
  name: "전투 함성",
  description: "10초간 모든 아군 공격 속도 +50%",
  cost: 4,
  consumable: true,
  effectType: SkillEffectType.DURATION,
  skillClass: AttackSpeedBoostSkill,
};
