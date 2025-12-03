import { State } from "../State";
import { BehaviorState } from "../StateTypes";
import { CombatEntity } from "../CombatEntity";

export class RevivingState implements State<CombatEntity> {
  enter(entity: CombatEntity): void {
    // 부활 중 상태 - 아무 애니메이션도 재생하지 않음
    // 유닛이 숨겨진 상태로 유지됨
  }

  update(_entity: CombatEntity, _delta: number): void {
    // 부활 중에는 아무 행동도 하지 않음
  }

  exit(_entity: CombatEntity): void {
    // 부활 완료 후 다른 상태로 전환
  }

  canTransitionTo(state: BehaviorState): boolean {
    // 부활 중에는 MOVING 상태로만 전환 가능
    return state === BehaviorState.MOVING;
  }
}
