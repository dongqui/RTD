import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { BaseUnit } from "../BaseUnit";
import { HealthBar } from "../../ui/HealthBar";
import { BehaviorState } from "../../fsm/StateTypes";

export class ImmortalHero extends BaseHero {
  private reviveTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "immortal_hero", cardId);
  }

  onHPZero(): void {
    this.playDeadAnimation();
    this.stateMachine.changeState(BehaviorState.REVIVING);
    this.healthBar.setVisible(false);

    // 유닛을 화면에서 숨김 (부활 준비 중)
    this.scene.time.delayedCall(1000, () => {
      this.spineObject.setVisible(false);
      this.resetStatusAndPosition();

      // 5초 후 기지에서 부활
    });

    this.scene.time.delayedCall(2000, () => {
      this.revive();
    });
  }

  private revive(): void {
    // 체력 회복
    this.currentHealth = this.maxHealth;

    // healthBar 재생성
    this.healthBar = new HealthBar(
      this.scene,
      this.spineObject.x,
      this.spineObject.y
    );
    this.healthBar.setVisible(false);
    // 유닛 다시 표시
    this.spineObject.setVisible(true);
    // REVIVING 상태에서 MOVING 상태로 전환
    this.stateMachine.changeState(BehaviorState.MOVING);
    // 부활 이펙트
    this.scene.events.emit("hero-revived", this);
  }

  resetStatusAndPosition(): void {
    const playerBase = this.scene.data.get("playerBase");
    if (!playerBase) {
      // 기지가 없으면 그냥 현재 위치에서 부활
      console.warn("playerBase not found, reviving at current position");
    } else {
      this.spineObject.x = playerBase.sprite.x;
      this.spineObject.y = playerBase.sprite.y;
    }

    // skeleton 색상 정상으로 복원 (빨간색 hit 상태 제거)
    const skeleton = this.spineObject.skeleton;
    if (skeleton) {
      skeleton.color.r = 1;
      skeleton.color.g = 1;
      skeleton.color.b = 1;
    }
  }

  destroy(): void {
    // 타이머 정리
    if (this.reviveTimer) {
      this.reviveTimer.remove();
    }
    super.destroy();
  }
}

export const immortalHeroSpec: HeroSpec = {
  id: "immortal_hero",
  name: "불사 기사",
  cost: 4,
  rate: 3,
  description: "사망 시 5초 후 기지에서 부활합니다",
  cardColor: 0xff8888,
  stats: {
    health: 300,
    speed: 65,
    attackRange: 50,
    attackDamage: 20,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#b41818",
    skinKeys: [
      "back/back_f_15",
      "beard/beard_f_2",
      "boots/boots_f_11",
      "bottom/bottom_f_13",
      "bottom/bottom_f_20",
      "bottom/bottom_f_44",
      "bottom/bottom_f_48",
      "bottom/bottom_f_51",
      "bottom/bottom_f_57",
      "bottom/bottom_f_59",
      "brow/brow_f_3",
      "eyes/eyes_f_5",
      "gear_left/gear_left_f_3",
      "gear_right/gear_right_f_12",
      "gloves/gloves_f_25",
      "hair_short/hair_short_f_18",
      "hair_short/hair_short_f_30",
      "hair_short/hair_short_f_4",
      "mouth/mouth_f_9",
      "skin/skin_1",
      "top/top_f_60",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: ImmortalHero,
};

// Register the hero spec
HeroRegistry.registerSpec(immortalHeroSpec);
