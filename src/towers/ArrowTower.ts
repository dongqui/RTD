import { BaseTower } from "../BaseTower";
import { Arrow } from "../Arrow";
import { BaseMonster } from "../monsters/BaseMonster";

export class ArrowTower extends BaseTower {
  private static readonly IDLE_ANIM_KEY = "archer_idle";
  private static readonly ATTACK_ANIM_KEY = "archer_attack";

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      "archer_idle", // 초기 텍스처
      25, // damage
      150, // range
      1000, // attackSpeed (ms)
      50, // cost
      1, // width
      1 // height
    );

    this.setupAnimations();
  }

  protected setupAnimations(): void {
    // Idle 애니메이션 (한 번만 생성)
    if (!this.scene.anims.exists(ArrowTower.IDLE_ANIM_KEY)) {
      this.scene.anims.create({
        key: ArrowTower.IDLE_ANIM_KEY,
        frames: this.scene.anims.generateFrameNumbers("archer_idle", {
          start: 0,
          end: 5,
        }),
        frameRate: 1,
        repeat: -1,
      });
    }

    // Attack 애니메이션 (한 번만 생성)
    if (!this.scene.anims.exists(ArrowTower.ATTACK_ANIM_KEY)) {
      this.scene.anims.create({
        key: ArrowTower.ATTACK_ANIM_KEY,
        frames: [{ key: "archer_attack", frame: 8 }],
        frameRate: 5,
        repeat: 0,
      });
    }

    // 초기 idle 애니메이션 재생
    console.log(this.scene.anims.exists(ArrowTower.IDLE_ANIM_KEY), this.sprite);
    if (this.scene.anims.exists(ArrowTower.IDLE_ANIM_KEY)) {
      this.sprite.play(ArrowTower.IDLE_ANIM_KEY);
    }
  }

  protected playAttackAnimation(): void {
    if (this.isAttacking) return;

    this.isAttacking = true;

    // Attack 애니메이션 재생
    if (this.scene.anims.exists(ArrowTower.ATTACK_ANIM_KEY)) {
      this.sprite.play(ArrowTower.ATTACK_ANIM_KEY);

      // 애니메이션 완료 후 idle로 복귀
      this.sprite.once("animationcomplete", () => {
        if (this.scene.anims.exists(ArrowTower.IDLE_ANIM_KEY)) {
          this.sprite.play(ArrowTower.IDLE_ANIM_KEY);
        }
        this.isAttacking = false;
      });
    } else {
      // 애니메이션이 없으면 바로 공격 완료 처리
      this.isAttacking = false;
    }
  }

  protected performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      new Arrow(this.scene, this.sprite.x, this.sprite.y, target, this.damage);
      console.log(
        `Arrow Tower at (${this.gridX}, ${this.gridY}) fires arrow at target`
      );
    }
  }
}
