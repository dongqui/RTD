import { BaseSkill } from "../BaseSkill";
import {
  SkillConfig,
  SkillContext,
  SkillEffectType,
  SkillSpec,
} from "../SkillTypes";
import { MoveSpeedEffect } from "../../fsm/effects/MoveSpeedEffect";

export class SlowEnemySkill extends BaseSkill {
  private duration: number;
  private multiplier: number;

  constructor(scene: Phaser.Scene, config: SkillConfig) {
    super(scene, config);
    this.duration = 5000;
    this.multiplier = 0.2;
  }

  execute(context: SkillContext): void {
    const enemies = context.enemyManager.getActiveEnemies();

    if (enemies.length === 0) {
      return;
    }

    enemies.forEach((enemy) => {
      const effect = new MoveSpeedEffect(this.duration, this.multiplier);
      enemy.statusEffects.addEffect(effect);
    });
  }

  canExecute(context: SkillContext): boolean {
    return context.enemyManager.getActiveEnemyCount() > 0;
  }
}

export const slowEnemySkillSpec: SkillSpec = {
  id: "slow_enemy",
  name: "빙결",
  description: "5초간 모든 적 이동 속도 -80%",
  cost: 6,
  consumable: true,
  effectType: SkillEffectType.DURATION,
  skillClass: SlowEnemySkill,
};
