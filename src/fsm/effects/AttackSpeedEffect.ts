import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

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

  getMultiplier(): number {
    return this.multiplier;
  }
}
