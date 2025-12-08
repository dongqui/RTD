import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";
import { EffectIconConfig, IconPosition } from "./StatusEffectIconManager";

export class AttackSpeedEffect extends StatusEffect {
  private multiplier: number;

  constructor(duration: number, multiplier: number) {
    super(EffectType.ATTACK_SPEED, duration);
    this.multiplier = multiplier;
  }

  apply(entity: CombatEntity): void {
    entity.statusEffects.registerAttackSpeedMultiplier(this.getId(), this.multiplier);
  }

  remove(entity: CombatEntity): void {
    entity.statusEffects.unregisterAttackSpeedMultiplier(this.getId());
  }

  getIconConfig(): EffectIconConfig {
    // 공격속도는 머리 위에 표시 (공격력과 다른 아이콘)
    return {
      iconKey: "icon_attack_speed", // 아이콘 키를 적절히 수정하세요
      position: IconPosition.ABOVE_HEAD,
      scale: 0.5,
      alpha: 0.9,
    };
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
