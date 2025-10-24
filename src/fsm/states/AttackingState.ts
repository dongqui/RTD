import { State } from "../State";
import { BehaviorState } from "../StateTypes";
import { CombatEntity } from "../CombatEntity";

export class AttackingState implements State<CombatEntity> {
  enter(_entity: CombatEntity): void {
  }

  update(entity: CombatEntity, _delta: number): void {
    if (entity.isDead()) {
      entity.stateMachine.changeState(BehaviorState.DEAD);
      return;
    }

    const target = entity.findTarget();

    if (!target) {
      entity.stateMachine.changeState(BehaviorState.MOVING);
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      entity.getX(),
      entity.getY(),
      target.getX(),
      target.getY()
    );

    if (distance > entity.getAttackRange()) {
      entity.stateMachine.changeState(BehaviorState.MOVING);
      return;
    }

    entity.attack(target);
  }

  exit(_entity: CombatEntity): void {
  }
}
