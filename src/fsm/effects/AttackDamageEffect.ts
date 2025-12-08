import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";
import { EffectIconConfig, IconPosition } from "./StatusEffectIconManager";

export class AttackDamageEffect extends StatusEffect {
  private multiplier: number;

  constructor(duration: number, multiplier: number) {
    super(EffectType.ATTACK_DAMAGE, duration);
    this.multiplier = multiplier;
  }

  apply(entity: CombatEntity): void {
    entity.statusEffects.registerAttackDamageMultiplier(
      this.getId(),
      this.multiplier
    );
  }

  remove(entity: CombatEntity): void {
    entity.statusEffects.unregisterAttackDamageMultiplier(this.getId());
  }

  getIconConfig(): EffectIconConfig {
    return {
      iconKey: "icon_swoard",
      position: IconPosition.ABOVE_HEAD,
      scale: 0.5,
      alpha: 0.9,
    };
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
