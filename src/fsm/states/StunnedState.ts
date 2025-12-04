import { State } from "../State";
import { BehaviorState } from "../StateTypes";
import { CombatEntity } from "../CombatEntity";

export class StunnedState implements State<CombatEntity> {
  private static stunAnimCreated: boolean = false;
  private stunSprite?: Phaser.GameObjects.Sprite;
  private positionUpdateEvent?: Phaser.Time.TimerEvent;

  enter(entity: CombatEntity): void {
    // Hit 애니메이션 재생 (BaseUnit의 playStunAnimation은 playHitAnimation을 호출)
    entity.playStunAnimation();
    // 스턴 중에는 이동 및 공격 불가
    entity.speedMultiplier = 0;
    entity.attackSpeedMultiplier = 0;

    // 애니메이션 생성 (한 번만)
    if (!StunnedState.stunAnimCreated && entity.getScene().anims) {
      // stun 스프라이트 시트의 프레임 수 확인 필요 (일단 0-10으로 설정)
      entity.getScene().anims.create({
        key: "stun_effect",
        frames: entity.getScene().anims.generateFrameNumbers("stun", {
          start: 0,
          end: 5,
        }),
        frameRate: 12,
        repeat: -1, // 무한 반복
      });
      StunnedState.stunAnimCreated = true;
    }

    // 스턴 스프라이트를 머리 위에 표시
    this.showStunSprite(entity);
  }

  private showStunSprite(entity: CombatEntity): void {
    if (!entity.spineObject) return;

    const entityX = entity.getX();
    const entityY = entity.getY() - 100; // 머리 위쪽

    this.stunSprite = entity.getScene().add.sprite(entityX, entityY, "stun");
    this.stunSprite.setScale(1.0);
    this.stunSprite.setOrigin(0.5, 0.5);
    this.stunSprite.setDepth(entity.spineObject.depth + 10);
    this.stunSprite.setAlpha(0.9);

    // 애니메이션 재생
    if (this.stunSprite.anims) {
      this.stunSprite.play("stun_effect");
    }

    // 위치 업데이트 이벤트
    this.positionUpdateEvent = entity.getScene().time.addEvent({
      delay: 16,
      callback: () => {
        if (entity.spineObject && this.stunSprite && this.stunSprite.active) {
          this.stunSprite.setPosition(entity.getX(), entity.getY() - 80);
        }
      },
      loop: true,
    });
  }

  update(entity: CombatEntity, _delta: number): void {
    // 스턴 상태에서는 아무것도 하지 않음
    if (entity.isDead()) {
      entity.stateMachine.changeState(BehaviorState.DEAD);
    }
  }

  exit(entity: CombatEntity): void {
    // 스턴 해제 시 속도 복원 및 스프라이트 제거
    entity.speedMultiplier = 1;
    entity.attackSpeedMultiplier = 1;

    if (this.positionUpdateEvent) {
      this.positionUpdateEvent.remove();
      this.positionUpdateEvent = undefined;
    }

    if (this.stunSprite) {
      this.stunSprite.destroy();
      this.stunSprite = undefined;
    }
  }
}
