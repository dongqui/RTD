import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

export class StatusEffectManager {
  private entity: CombatEntity;
  private effects: Map<string, StatusEffect>;

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
}
