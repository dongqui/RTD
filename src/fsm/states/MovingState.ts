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
      // For melee units (small attack range), use horizontal distance only
      // For ranged units (large attack range), use full distance
      const attackRange = entity.getAttackRange();
      const isMeleeUnit = attackRange <= 100; // Threshold to determine melee vs ranged

      let distance: number;
      if (isMeleeUnit) {
        // Use only horizontal distance for melee units
        distance = Math.abs(entity.getX() - target.getX());
      } else {
        // Use full diagonal distance for ranged units
        distance = Phaser.Math.Distance.Between(
          entity.getX(),
          entity.getY(),
          target.getX(),
          target.getY()
        );
      }

      if (distance <= attackRange) {
        entity.stateMachine.changeState(BehaviorState.ATTACKING);
        return;
      }

      entity.moveTowards(target.getX(), target.getY(), delta);
    } else {
      entity.move(delta);
    }
  }

  exit(_entity: CombatEntity): void {}
}
