import { BaseTower } from "../BaseTower";
import { BaseMonster } from "../monsters/BaseMonster";

export class FrostTower extends BaseTower {
  private static readonly IDLE_ANIM_KEY = "frost_idle";
  private static readonly ATTACK_ANIM_KEY = "frost_attack";

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      "archer_idle", // 임시로 archer 사용
      15, // damage
      100, // range
      800, // attackSpeed (ms)
      75, // cost
      1, // width
      1 // height
    );

    this.sprite.setTint(0x00bfff); // 파란색 틴트로 구분
  }

  protected setupAnimations(): void {
    // Idle 애니메이션
    if (!this.scene.anims.exists(FrostTower.IDLE_ANIM_KEY)) {
      this.scene.anims.create({
        key: FrostTower.IDLE_ANIM_KEY,
        frames: [{ key: "archer_idle" }],
        frameRate: 1,
        repeat: -1,
      });
    }

    // Attack 애니메이션 (빠른 공격)
    if (!this.scene.anims.exists(FrostTower.ATTACK_ANIM_KEY)) {
      this.scene.anims.create({
        key: FrostTower.ATTACK_ANIM_KEY,
        frames: [{ key: "archer_attack" }],
        frameRate: 8, // 빠른 애니메이션
        repeat: 0,
      });
    }

    if (this.scene.anims.exists(FrostTower.IDLE_ANIM_KEY)) {
      this.sprite.play(FrostTower.IDLE_ANIM_KEY);
    }
  }

  protected playAttackAnimation(): void {
    if (this.isAttacking) return;

    this.isAttacking = true;

    if (this.scene.anims.exists(FrostTower.ATTACK_ANIM_KEY)) {
      this.sprite.play(FrostTower.ATTACK_ANIM_KEY);

      this.sprite.once("animationcomplete", () => {
        if (this.scene.anims.exists(FrostTower.IDLE_ANIM_KEY)) {
          this.sprite.play(FrostTower.IDLE_ANIM_KEY);
        }
        this.isAttacking = false;
      });
    } else {
      this.isAttacking = false;
    }
  }

  protected performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      target.takeDamage(this.damage);

      // 빙결 효과 (파란색 링 이펙트)
      const frostRing = this.scene.add.circle(
        target.x,
        target.y,
        15,
        0x00bfff,
        0.6
      );
      frostRing.setStrokeStyle(3, 0xffffff);

      this.scene.tweens.add({
        targets: frostRing,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 400,
        onComplete: () => frostRing.destroy(),
      });

      // 몬스터에 일시적 파란색 틴트
      const originalTint = target.tintTopLeft;
      target.setTint(0x00bfff);
      this.scene.time.delayedCall(300, () => {
        if (target.active) {
          target.setTint(originalTint);
        }
      });

      console.log(
        `Frost Tower at (${this.gridX}, ${this.gridY}) attacks target for ${this.damage} damage`
      );
    }
  }
}
