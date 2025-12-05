import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { BehaviorState } from "../../fsm/StateTypes";

export class MaceHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "mace_knight", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    super.performAttack(target);

    // 30% 확률로 스턴 적용 (Base는 스턴 불가)
    if (Math.random() < 0.3 && !(target instanceof Base)) {
      this.applyStun(target as CombatEntity);
    }
  }

  private applyStun(target: CombatEntity): void {
    // 스턴 상태로 변경 (1초 동안)
    // StunnedState.enter()에서 자동으로 애니메이션 재생
    const previousState = target.stateMachine.getCurrentStateType();
    if (previousState) {
      target.stateMachine.changeState(BehaviorState.STUNNED);

      // 1초 후 이전 상태로 복귀
      this.scene.time.delayedCall(2000, () => {
        if (
          !target.isDead() &&
          target.stateMachine.getCurrentStateType() === BehaviorState.STUNNED
        ) {
          target.stateMachine.changeState(previousState);
        }
      });
    }
  }
}

export const maceSpec: HeroSpec = {
  id: "mace_knight",
  name: "철퇴병",
  cost: 3,
  rate: 1,
  description: "공격 시 30% 확률로 대상을 기절시킵니다",
  cardColor: 0x8b7355,
  stats: {
    health: 250,
    speed: 60,
    attackRange: 60,
    attackDamage: 25,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "beard/beard_f_1",
      "boots/boots_f_6",
      "bottom/bottom_f_41",
      "bottom/bottom_f_7",
      "brow/brow_f_5",
      "eyes/eyes_f_14",
      "gear_left/gear_left_f_11",
      "gear_right/gear_right_f_8",
      "helmet/helmet_f_4",
      "skin/skin_1",
      "top/top_f_4",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: MaceHero,
};

// Register the hero spec
HeroRegistry.registerSpec(maceSpec);
