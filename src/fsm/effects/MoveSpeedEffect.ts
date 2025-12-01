import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

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

  getMultiplier(): number {
    return this.multiplier;
  }
}
