import { BaseTower } from "../BaseTower";
import { Arrow } from "../Arrow";
import { BaseMonster } from "../monsters/BaseMonster";
import { Skin } from "@esotericsoftware/spine-core";

export class ArrowTower extends BaseTower {
  private static readonly IDLE_ANIM_KEY = "Idle_Bow";
  private static readonly ATTACK_ANIM_KEY = "Attack_Bow";
  private static readonly LEVEL_1_SKIN_KEYS = ["back/back_f_21", "boots/boots_f_2", "bottom/bottom_f_1", "eyes/eyes_f_9", "gear_right/gear_right_f_25", 'hair_short/hair_short_f_1', 'mouth/mouth_f_2', 'skin/skin_1', 'top/top_f_56'];

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, level: number = 1) {
    super(
      scene,
      gridX,
      gridY,
      "arrow", // towerType
      25, // damage
      300, // range - 사거리 늘림
      500, // attackSpeed (ms) - 더 빠르게
      50, // cost
      level, // level
      1, // width
      1 // height
    );

    this.setupAnimations();
    this.updateVisualForLevel();
  }

  protected setupAnimations(): void {
    console.log(this.spineObject.skeleton.data.animations.map((anim: any) => anim.name));

    const initSkin = new Skin("arrow_tower");

    ArrowTower.LEVEL_1_SKIN_KEYS.forEach((key) => {
      const skin = this.spineObject.skeleton.data.findSkin(key);
      if (skin) {
          console.log(key)
          initSkin.addSkin(skin);
      }
    });
    this.spineObject.skeleton.setSkin(initSkin);
    this.spineObject.animationState.setAnimation(0, ArrowTower.IDLE_ANIM_KEY, true);    
  }

  protected playAttackAnimation(): void {
    if (this.isAttacking) return;
    this.isAttacking = true;

    this.spineObject.animationState.setAnimation(0, ArrowTower.ATTACK_ANIM_KEY, false);

    const listener = {
      complete: () => {
        this.isAttacking = false;
        this.spineObject.animationState.setAnimation(0, ArrowTower.IDLE_ANIM_KEY, true);
        this.spineObject.animationState.removeListener(listener);
      }
    };

    this.spineObject.animationState.addListener(listener);
  }

  protected performAttack(target: any): void {
    if (target && target.sprite) {
      const dx = target.sprite.x - this.spineObject.x;
      const dy = target.sprite.y - this.spineObject.y;
      const angle = Math.atan2(dy, dx);

      const currentScale = Math.abs(this.spineObject.scaleX);
      this.spineObject.scaleX = dx < 0 ? currentScale : -currentScale;

      const rotationOffset = dx < 0 ? Math.PI : 0;
      this.spineObject.rotation = angle - rotationOffset;

      new Arrow(this.scene, this.spineObject.x, this.spineObject.y, target, this.damage);
      console.log(
        `Arrow Tower Lv.${this.level} at (${this.gridX}, ${this.gridY}) fires arrow at target`
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
