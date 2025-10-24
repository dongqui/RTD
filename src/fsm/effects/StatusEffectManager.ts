import { CombatEntity } from "../CombatEntity";

export class StatusEffectManager {
  private entity: CombatEntity;

  constructor(entity: CombatEntity) {
    this.entity = entity;
  }

  update(_delta: number): void {
  }

  clear(): void {
  }
}
