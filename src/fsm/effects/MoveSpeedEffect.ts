import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";
import { EffectIconConfig, IconPosition } from "./StatusEffectIconManager";

export class MoveSpeedEffect extends StatusEffect {
  private multiplier: number;

  constructor(duration: number, multiplier: number) {
    super(EffectType.MOVE_SPEED, duration);
    this.multiplier = multiplier;
  }

  apply(entity: CombatEntity): void {
    entity.statusEffects.registerSpeedMultiplier(this.getId(), this.multiplier);
  }

  remove(entity: CombatEntity): void {
    entity.statusEffects.unregisterSpeedMultiplier(this.getId());
  }

  getIconConfig(): EffectIconConfig {
    // 이동속도는 발 아래에 표시
    return {
      iconKey: "icon_speed", // 아이콘 키를 적절히 수정하세요
      position: IconPosition.BELOW_FEET,
      scale: 0.5,
      alpha: 0.9,
    };
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
