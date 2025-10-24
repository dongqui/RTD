import { State } from "../State";
import { BehaviorState } from "../StateTypes";
import { CombatEntity } from "../CombatEntity";

export class MovingState implements State<CombatEntity> {
  enter(entity: CombatEntity): void {
    entity.playMoveAnimation();
  }

  update(entity: CombatEntity, delta: number): void {
    if (entity.isDead()) {
      entity.stateMachine.changeState(BehaviorState.DEAD);
      return;
    }

    const target = entity.findTarget();

    if (target) {
      const distance = Phaser.Math.Distance.Between(
        entity.getX(),
        entity.getY(),
        target.getX(),
        target.getY()
      );

      if (distance <= entity.getAttackRange()) {
        entity.stateMachine.changeState(BehaviorState.ATTACKING);
        return;
      }
    }

    entity.move(delta);
  }

  exit(_entity: CombatEntity): void {
  }
}
