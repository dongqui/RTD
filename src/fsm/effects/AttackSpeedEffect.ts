import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

export class AttackSpeedEffect extends StatusEffect {
  private multiplier: number;
  private originalValue: number | null = null;

  constructor(duration: number, multiplier: number) {
    super(EffectType.ATTACK_SPEED, duration);
    this.multiplier = multiplier;
  }

  apply(entity: CombatEntity): void {
    this.originalValue = entity.attackSpeedMultiplier;
    entity.attackSpeedMultiplier *= this.multiplier;
  }

  remove(entity: CombatEntity): void {
    if (this.originalValue !== null) {
      entity.attackSpeedMultiplier = this.originalValue;
    }
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
