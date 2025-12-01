import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

export class StatusEffectManager {
  private entity: CombatEntity;
  private effects: Map<string, StatusEffect>;
  private speedMultipliers: Map<string, number> = new Map();
  private attackSpeedMultipliers: Map<string, number> = new Map();
  private baseSpeedMultiplier: number = 1.0;

  constructor(entity: CombatEntity) {
    this.entity = entity;
    this.effects = new Map();
  }

  addEffect(effect: StatusEffect): void {
    effect.apply(this.entity);
    this.effects.set(effect.getId(), effect);
  }

  removeEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.remove(this.entity);
      this.effects.delete(id);
    }
  }

  hasEffectType(type: EffectType): boolean {
    for (const effect of this.effects.values()) {
      if (effect.getType() === type) {
        return true;
      }
    }
    return false;
  }

  getEffectsByType(type: EffectType): StatusEffect[] {
    const results: StatusEffect[] = [];
    for (const effect of this.effects.values()) {
      if (effect.getType() === type) {
        results.push(effect);
      }
    }
    return results;
  }

  update(delta: number): void {
    const expiredIds: string[] = [];

    this.effects.forEach((effect, id) => {
      effect.update(delta);

      if (effect.isExpired()) {
        expiredIds.push(id);
      }
    });

    expiredIds.forEach(id => this.removeEffect(id));
  }

  clear(): void {
    this.effects.forEach(effect => effect.remove(this.entity));
    this.effects.clear();
  }

  getEffectCount(): number {
    return this.effects.size;
  }

  registerSpeedMultiplier(effectId: string, multiplier: number): void {
    this.speedMultipliers.set(effectId, multiplier);
    this.recalculateSpeedMultiplier();
  }

  unregisterSpeedMultiplier(effectId: string): void {
    this.speedMultipliers.delete(effectId);
    this.recalculateSpeedMultiplier();
  }

  private recalculateSpeedMultiplier(): void {
    let totalMultiplier = this.baseSpeedMultiplier;

    // Multiply all active speed multipliers
    for (const multiplier of this.speedMultipliers.values()) {
      totalMultiplier *= multiplier;
    }

    // Apply to movement speed
    this.entity.speedMultiplier = totalMultiplier;

    // Synchronize animation speed (with null check)
    if (this.entity.spineObject?.animationState) {
      this.entity.spineObject.animationState.timeScale = totalMultiplier;
    }
  }

  registerAttackSpeedMultiplier(effectId: string, multiplier: number): void {
    this.attackSpeedMultipliers.set(effectId, multiplier);
    this.recalculateAttackSpeedMultiplier();
  }

  unregisterAttackSpeedMultiplier(effectId: string): void {
    this.attackSpeedMultipliers.delete(effectId);
    this.recalculateAttackSpeedMultiplier();
  }

  private recalculateAttackSpeedMultiplier(): void {
    let totalMultiplier = 1.0;

    for (const multiplier of this.attackSpeedMultipliers.values()) {
      totalMultiplier *= multiplier;
    }

    this.entity.attackSpeedMultiplier = totalMultiplier;
  }
}
