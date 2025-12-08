import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";
import { StatusEffectIconManager } from "./StatusEffectIconManager";

export class StatusEffectManager {
  private entity: CombatEntity;
  private effects: Map<string, StatusEffect>;
  private speedMultipliers: Map<string, number> = new Map();
  private attackSpeedMultipliers: Map<string, number> = new Map();
  private attackDamageMultipliers: Map<string, number> = new Map();
  private baseSpeedMultiplier: number = 1.0;
  private iconManager: StatusEffectIconManager | null = null;

  constructor(entity: CombatEntity) {
    this.entity = entity;
    this.effects = new Map();
  }

  initialize(scene: Phaser.Scene): void {
    if (!this.iconManager) {
      this.iconManager = new StatusEffectIconManager(this.entity, scene);
    }
  }

  addEffect(effect: StatusEffect): void {
    const effectId = effect.getId();
    const existingEffect = this.effects.get(effectId);

    // 같은 ID의 효과가 이미 있으면 시간만 갱신
    if (existingEffect) {
      existingEffect.refresh(effect.getDuration());
      return;
    }

    // 새로운 효과 적용
    effect.apply(this.entity);
    this.effects.set(effectId, effect);

    // 아이콘 설정이 있으면 아이콘 추가
    const iconConfig = effect.getIconConfig();
    if (iconConfig && this.iconManager) {
      this.iconManager.addIcon(effectId, iconConfig);
    }
  }

  removeEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.remove(this.entity);
      this.effects.delete(id);

      // 아이콘 제거
      if (this.iconManager) {
        this.iconManager.removeIcon(id);
      }
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

    expiredIds.forEach((id) => this.removeEffect(id));
  }

  clear(): void {
    this.effects.forEach((effect) => effect.remove(this.entity));
    this.effects.clear();

    // 아이콘 매니저 정리
    if (this.iconManager) {
      this.iconManager.clear();
      this.iconManager = null;
    }
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

  registerAttackDamageMultiplier(effectId: string, multiplier: number): void {
    this.attackDamageMultipliers.set(effectId, multiplier);
    this.recalculateAttackDamageMultiplier();
  }

  unregisterAttackDamageMultiplier(effectId: string): void {
    this.attackDamageMultipliers.delete(effectId);
    this.recalculateAttackDamageMultiplier();
  }

  private recalculateAttackDamageMultiplier(): void {
    let totalMultiplier = 1.0;

    for (const multiplier of this.attackDamageMultipliers.values()) {
      totalMultiplier *= multiplier;
    }

    this.entity.attackDamageMultiplier = totalMultiplier;
  }
}
