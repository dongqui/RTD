import { BaseTower } from "../BaseTower";
import { BaseMonster } from "../monsters/BaseMonster";
import { Skin } from "@esotericsoftware/spine-core";

export class CannonTower extends BaseTower {
  private static readonly IDLE_ANIM_KEY = "cannon_idle";
  private static readonly ATTACK_ANIM_KEY = "cannon_attack";

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, level: number = 1) {
    super(
      scene,
      gridX,
      gridY,
      "cannon", // towerType
      80, // damage
      120, // range
      2000, // attackSpeed (ms)
      150, // cost
      level, // level
      1, // width
      1 // height
    );

    this.updateVisualForLevel();
  }

  protected setupAnimations(): void {
    const skin = new Skin("cannon_tower");
    const fullskin = this.spineObject.skeleton.data.findSkin("full_skins_f");
    if (fullskin) {
      skin.addSkin(fullskin);
    }
    const boots = this.spineObject.skeleton.data.findSkin("boots/boots_f_1");
    if (boots) {
      skin.addSkin(boots);
    }
    const left = this.spineObject.skeleton.data.findSkin("gear_left/gear_left_f_1");
    if (left) {
      skin.addSkin(left);
    }
    const right = this.spineObject.skeleton.data.findSkin("gear_right/gear_right_f_1");
    if (right) {
      skin.addSkin(right);
    }
    this.spineObject.skeleton.setSkin(skin);

    const animations = this.spineObject.skeleton.data.animations;
    if (animations.length > 0) {
      const randomIndex = Phaser.Math.Between(0, animations.length - 1);
      const animationToPlay = animations[randomIndex].name;
      this.spineObject.animationState.setAnimation(0, animationToPlay, true);
    }
  }

  protected playAttackAnimation(): void {
    if (this.isAttacking) return;
    this.isAttacking = true;

    this.scene.cameras.main.shake(100, 0.01);

    const listener = {
      complete: () => {
        this.isAttacking = false;
      }
    };

    this.spineObject.animationState.addListener(listener);
    this.scene.time.delayedCall(500, () => {
      this.spineObject.animationState.removeListener(listener);
    });
  }

  protected performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      // 즉시 데미지 (포탄 발사체 없음)
      target.takeDamage(this.damage);

   
      console.log(
        `Cannon Tower Lv.${this.level} at (${this.gridX}, ${this.gridY}) attacks target for ${this.damage} damage`
      );
    }
  }

  protected updateVisualForLevel(): void {
    const scaleMultiplier = 1 + (this.level - 1) * 0.15;
    this.spineObject.setScale(scaleMultiplier);

    const alphaValues = [1.0, 0.9, 0.8, 0.7];
    this.spineObject.setAlpha(alphaValues[this.level - 1] || 1.0);
  }
}
