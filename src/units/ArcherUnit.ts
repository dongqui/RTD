import { Skin } from "@esotericsoftware/spine-core";

import { BaseUnit } from "./BaseUnit";

export class ArcherUnit extends BaseUnit {
  private static readonly IDLE_ANIM_KEY = "Idle_Bow";
  private static readonly ATTACK_ANIM_KEY = "Attack_Bow";
  private static readonly RUN_ANIM_KEY = "Run";
  private static readonly LEVEL_1_SKIN_KEYS = [
    "back/back_f_21",
    "boots/boots_f_2",
    "bottom/bottom_f_1",
    "eyes/eyes_f_9",
    "gear_right/gear_right_f_25",
    "hair_short/hair_short_f_1",
    "mouth/mouth_f_2",
    "skin/skin_1",
    "top/top_f_56",
  ];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      health: 30,
      speed: 50,
      cost: 40,
      scale: 0.25,
      attackRange: 150,
      attackDamage: 10,
      attackSpeed: 800,
    });
  }

  protected setupAnimations(): void {
    console.log("=== Available Archer Animations ===");
    console.log(
      this.spineObject.skeleton.data.animations.map((anim: any) => anim.name)
    );
    console.log("===================================");

    const initSkin = new Skin("archer");

    ArcherUnit.LEVEL_1_SKIN_KEYS.forEach((key) => {
      const skin = this.spineObject.skeleton.data.findSkin(key);
      if (skin) {
        initSkin.addSkin(skin);
      }
    });
    this.spineObject.skeleton.setSkin(initSkin);

    this.spineObject.setScale(-0.25, 0.25);

    this.spineObject.animationState.setAnimation(
      0,
      ArcherUnit.RUN_ANIM_KEY,
      true
    );
  }

  public playAttackAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      ArcherUnit.ATTACK_ANIM_KEY,
      false
    );

    const listener = {
      complete: () => {
        this.spineObject.animationState.setAnimation(
          0,
          ArcherUnit.RUN_ANIM_KEY,
          true
        );
        this.spineObject.animationState.removeListener(listener);
      },
    };

    this.spineObject.animationState.addListener(listener);
  }

  public playRunAnimation(): void {
    const currentAnim = this.spineObject.animationState.getCurrent(0);
    if (
      currentAnim &&
      currentAnim.animation?.name === ArcherUnit.RUN_ANIM_KEY
    ) {
      return;
    }
    this.spineObject.animationState.setAnimation(
      0,
      ArcherUnit.RUN_ANIM_KEY,
      true
    );
  }
}
