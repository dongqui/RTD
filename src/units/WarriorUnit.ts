import { Skin } from "@esotericsoftware/spine-core";
import { BaseUnit } from "./BaseUnit";

export class WarriorUnit extends BaseUnit {
  private static readonly ATTACK_ANIM_KEY = "Attack3";
  private static readonly LEVEL_1_SKIN_KEYS = [
    "boots/boots_f_2",
    "bottom/bottom_f_1",
    "eyes/eyes_f_9",
    "gear_right/gear_right_f_11",
    "gear_left/gear_left_f_11",
    "hair_short/hair_short_f_1",
    "mouth/mouth_f_2",
    "skin/skin_1",
    "top/top_f_56",
  ];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      health: 300,
      speed: 60,
      cost: 50,
      attackRange: 50,
      attackDamage: 15,
      attackSpeed: 1000,
    });
  }

  protected setupAnimations(): void {
    console.log("=== Available Archer Animations ===");
    console.log(
      this.spineObject.skeleton.data.animations.map((anim: any) => anim.name)
    );
    console.log("===================================");

    const initSkin = new Skin("warrior");

    WarriorUnit.LEVEL_1_SKIN_KEYS.forEach((key) => {
      const skin = this.spineObject.skeleton.data.findSkin(key);
      if (skin) {
        initSkin.addSkin(skin);
      }
    });
    this.spineObject.skeleton.setSkin(initSkin);

    this.spineObject.setScale(-0.25, 0.25);

    this.playRunAnimation();
  }

  playAttackAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      WarriorUnit.ATTACK_ANIM_KEY,
      false
    );

    const listener = {
      complete: () => {
        this.playRunAnimation();
        this.spineObject.animationState.removeListener(listener);
      },
    };

    this.spineObject.animationState.addListener(listener);
  }
}
