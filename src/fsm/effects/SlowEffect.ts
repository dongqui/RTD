import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";
import { EffectIconConfig, IconPosition } from "./StatusEffectIconManager";

export class SlowEffect extends StatusEffect {
  private static readonly SLOW_EFFECT_ID = "slow_effect";
  private multiplier: number;

  constructor(duration: number, multiplier: number) {
    super(EffectType.MOVE_SPEED, duration);
    this.multiplier = multiplier;
    // 슬로우 효과는 고정 ID 사용 (중복 방지용)
    this.id = SlowEffect.SLOW_EFFECT_ID;
  }

  apply(entity: CombatEntity): void {
    // 이동 속도와 공격 속도 모두 감소
    entity.statusEffects.registerSpeedMultiplier(this.getId(), this.multiplier);
    entity.statusEffects.registerAttackSpeedMultiplier(this.getId(), this.multiplier);
  }

  remove(entity: CombatEntity): void {
    entity.statusEffects.unregisterSpeedMultiplier(this.getId());
    entity.statusEffects.unregisterAttackSpeedMultiplier(this.getId());
  }

  getIconConfig(): EffectIconConfig {
    return {
      iconKey: "icon_weak",
      position: IconPosition.ABOVE_HEAD,
      scale: 0.5,
      alpha: 0.9,
    };
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
