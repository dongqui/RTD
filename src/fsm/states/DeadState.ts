import { State } from "../State";
import { BehaviorState } from "../StateTypes";
import { CombatEntity } from "../CombatEntity";

export class DeadState implements State<CombatEntity> {
  enter(entity: CombatEntity): void {
    entity.playDeadAnimation();
  }

  update(_entity: CombatEntity, _delta: number): void {
  }

  exit(_entity: CombatEntity): void {
  }

  canTransitionTo(_state: BehaviorState): boolean {
    return false;
  }
}
