import { BaseTower } from "../BaseTower";
import { BaseMonster } from "../monsters/BaseMonster";

export class CannonTower extends BaseTower {
  private static readonly IDLE_ANIM_KEY = "cannon_idle";
  private static readonly ATTACK_ANIM_KEY = "cannon_attack";

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      "archer_idle", // 임시로 archer 사용
      80, // damage
      120, // range
      2000, // attackSpeed (ms)
      150, // cost
      1, // width
      1 // height
    );

    this.sprite.setTint(0x8b4513); // 갈색 틴트로 구분
  }

  protected setupAnimations(): void {
    // Idle 애니메이션
    if (!this.scene.anims.exists(CannonTower.IDLE_ANIM_KEY)) {
      this.scene.anims.create({
        key: CannonTower.IDLE_ANIM_KEY,
        frames: [{ key: "archer_idle" }],
        frameRate: 1,
        repeat: -1,
      });
    }

    // Attack 애니메이션 (더 느린 공격 속도)
    if (!this.scene.anims.exists(CannonTower.ATTACK_ANIM_KEY)) {
      this.scene.anims.create({
        key: CannonTower.ATTACK_ANIM_KEY,
        frames: [{ key: "archer_attack" }],
        frameRate: 3, // 더 느린 애니메이션
        repeat: 0,
      });
    }

    if (this.scene.anims.exists(CannonTower.IDLE_ANIM_KEY)) {
      this.sprite.play(CannonTower.IDLE_ANIM_KEY);
    }
  }

  protected playAttackAnimation(): void {
    if (this.isAttacking) return;

    this.isAttacking = true;

    // 캐논 발사 효과 (화면 흔들림)
    this.scene.cameras.main.shake(100, 0.01);

    if (this.scene.anims.exists(CannonTower.ATTACK_ANIM_KEY)) {
      this.sprite.play(CannonTower.ATTACK_ANIM_KEY);

      this.sprite.once("animationcomplete", () => {
        if (this.scene.anims.exists(CannonTower.IDLE_ANIM_KEY)) {
          this.sprite.play(CannonTower.IDLE_ANIM_KEY);
        }
        this.isAttacking = false;
      });
    } else {
      this.isAttacking = false;
    }
  }

  protected performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      // 즉시 데미지 (포탄 발사체 없음)
      target.takeDamage(this.damage);

      // 폭발 효과 (간단한 시각적 피드백)
      const explosion = this.scene.add.circle(
        target.x,
        target.y,
        20,
        0xff6600,
        0.7
      );
      this.scene.tweens.add({
        targets: explosion,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => explosion.destroy(),
      });

      console.log(
        `Cannon Tower at (${this.gridX}, ${this.gridY}) attacks target for ${this.damage} damage`
      );
    }
  }
}
