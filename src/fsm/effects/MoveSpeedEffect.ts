import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

export class MoveSpeedEffect extends StatusEffect {
  private multiplier: number;
  private originalValue: number | null = null;

  constructor(duration: number, multiplier: number) {
    super(EffectType.MOVE_SPEED, duration);
    this.multiplier = multiplier;
  }

  apply(entity: CombatEntity): void {
    this.originalValue = entity.speedMultiplier;
    entity.speedMultiplier *= this.multiplier;
  }

  remove(entity: CombatEntity): void {
    if (this.originalValue !== null) {
      entity.speedMultiplier = this.originalValue;
    }
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
