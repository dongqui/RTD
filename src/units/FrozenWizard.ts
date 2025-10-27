import { BaseUnit } from "./BaseUnit";
import { CombatEntity } from "../fsm/CombatEntity";
import Base from "../Base";
import { UnitSpec } from "./UnitRegistry";

export class FrozenWizard extends BaseUnit {
  private static frozenAnimCreated: boolean = false;
  private static freezedAnimCreated: boolean = false;
  private aoeRadius: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "frozen_wizard");

    if (!FrozenWizard.frozenAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "frozen_attack",
        frames: this.scene.anims.generateFrameNumbers("frozen", {
          start: 0,
          end: 10,
        }),
        frameRate: 15,
        repeat: 0,
      });
      FrozenWizard.frozenAnimCreated = true;
    }

    if (!FrozenWizard.freezedAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "freezed_effect",
        frames: this.scene.anims.generateFrameNumbers("freezed", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: 0,
        duration: 1000,
      });
      FrozenWizard.freezedAnimCreated = true;
    }
  }

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;
    const attackSpeed = this.getAttackSpeed();

    if (currentTime - this.getLastAttackTime() >= attackSpeed) {
      this.setLastAttackTime(currentTime);
      this.playAttackAnimation();

      this.showFrozenEffect(target);
      this.dealAoeDamage(target);
    }
  }

  private showFrozenEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();

    const frozen = this.scene.add.sprite(targetX, targetY, "frozen");
    frozen.setScale(1.5);
    frozen.setAlpha(0.9);
    frozen.setBlendMode(Phaser.BlendModes.ADD);
    frozen.setOrigin(0.5, 0.5);

    frozen.play("frozen_attack");

    frozen.on("animationcomplete", () => {
      frozen.destroy();
    });
  }

  private dealAoeDamage(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();
    const monsters = this.scene.data.get("monsters") || [];

    for (const monster of monsters) {
      if (monster.getState && monster.getState() === "dead") continue;

      const distance = Phaser.Math.Distance.Between(
        targetX,
        targetY,
        monster.sprite.x,
        monster.sprite.y
      );

      if (distance <= this.aoeRadius) {
        monster.takeDamage(this.getAttackDamage());
        this.applyFreezeEffect(monster);
      }
    }
  }

  private applyFreezeEffect(target: any): void {
    if (!target.sprite) return;

    const originalSpeedMultiplier = target.speedMultiplier || 1;
    target.speedMultiplier = 0;

    const freezedSprite = this.scene.add.sprite(
      target.sprite.x,
      target.sprite.y,
      "freezed"
    );
    freezedSprite.setAlpha(0.8);
    freezedSprite.setBlendMode(Phaser.BlendModes.NORMAL);
    freezedSprite.setOrigin(0.5, 0.5);
    freezedSprite.setDepth(target.sprite.depth + 1);

    freezedSprite.play("freezed_effect");

    freezedSprite.on("animationcomplete", () => {
      freezedSprite.anims.pause();
      freezedSprite.setFrame(10);
    });

    const updateFreezedPosition = () => {
      if (target.sprite && freezedSprite.active) {
        freezedSprite.setPosition(target.sprite.x, target.sprite.y);
      }
    };

    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      callback: updateFreezedPosition,
      loop: true,
    });

    this.scene.time.delayedCall(1000, () => {
      target.speedMultiplier = originalSpeedMultiplier;
      updateEvent.remove();
      freezedSprite.destroy();
    });
  }
}

export const frozenWizardSpec: UnitSpec = {
  id: "frozen_wizard",
  name: "냉기 마도사",
  cost: 6,
  description: "냉기 속성 공격",
  cardColor: 0x44ffff,
  stats: {
    health: 30,
    speed: 50,
    attackRange: 150,
    attackDamage: 10,
    attackSpeed: 800,
  },
  visual: {
    skinColor: "#ffd7b8",
    hairColor: "#fafafa",
    skinKeys: [
      "boots/boots_f_10",
      "bottom/bottom_f_25",
      "brow/brow_f_2",
      "eyes/eyes_f_4",
      "eyewear/eyewear_f_22",
      "gear_left/gear_left_f_32",
      "gloves/gloves_f_32",
      "hair_hat/hair_hat_f_10",
      "helmet/helmet_f_60",
      "mouth/mouth_f_1",
      "skin/skin_1",
      "top/top_f_53",
    ],
    attackAnimKey: "Attack3",
  },
  unitClass: FrozenWizard,
};
