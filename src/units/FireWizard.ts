import { BaseUnit } from "./BaseUnit";
import { CombatEntity } from "../fsm/CombatEntity";
import Base from "../Base";
import { UnitSpec } from "./UnitRegistry";

export class FireWizard extends BaseUnit {
  private static fireAnimCreated: boolean = false;
  private aoeRadius: number = 100;
  private burnDuration: number = 3000;
  private burnDamagePerTick: number = 2;
  private burnTickInterval: number = 500;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "fire_wizard", cardId);

    if (!FireWizard.fireAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "fire_attack",
        frames: this.scene.anims.generateFrameNumbers("fire", {
          start: 0,
          end: 10,
        }),
        frameRate: 15,
        repeat: 0,
      });
      FireWizard.fireAnimCreated = true;
    }
  }

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;
    const attackSpeed = this.getAttackSpeed();

    if (currentTime - this.getLastAttackTime() >= attackSpeed) {
      this.setLastAttackTime(currentTime);
      this.playAttackAnimation();

      this.showFireEffect(target);
      this.dealAoeDamage(target);
    }
  }

  private showFireEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();

    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.aoeRadius;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        const finalX = targetX + offsetX;
        const finalY = targetY + offsetY;
        const startY = finalY - 100;

        const fire = this.scene.add.sprite(finalX, startY, "fire");
        fire.setScale(2.2);
        fire.setAlpha(0.9);
        fire.setBlendMode(Phaser.BlendModes.ADD);
        fire.setOrigin(0.5, 0.5);

        this.scene.tweens.add({
          targets: fire,
          y: finalY,
          duration: 300,
          ease: "Cubic.easeIn",
        });

        fire.play("fire_attack");

        fire.on("animationcomplete", () => {
          fire.destroy();
        });
      });
    }
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
        this.applyBurnEffect(monster);
      }
    }
  }

  private applyBurnEffect(target: any): void {
    if (!target.sprite) return;

    // 이미 화상 효과가 있으면 중복 적용하지 않음 (또는 지속시간 갱신)
    if (target.burnEffect) {
      target.burnEffect.endTime = this.scene.time.now + this.burnDuration;
      return;
    }

    const startTime = this.scene.time.now;
    let lastTickTime = startTime;

    const burnEffect = {
      startTime: startTime,
      endTime: startTime + this.burnDuration,
      lastTickTime: lastTickTime,
      tickInterval: this.burnTickInterval,
      damagePerTick: this.burnDamagePerTick,
    };

    target.burnEffect = burnEffect;

    // 화상 이펙트 스프라이트 생성
    const burnSprite = this.scene.add.sprite(
      target.sprite.x,
      target.sprite.y,
      "fire"
    );
    burnSprite.setScale(0.5);
    burnSprite.setAlpha(0.6);
    burnSprite.setBlendMode(Phaser.BlendModes.ADD);
    burnSprite.setOrigin(0.5, 0.5);
    burnSprite.setDepth(target.sprite.depth + 1);
    burnSprite.setTint(0xff4444);

    const updateBurnEffect = () => {
      const currentTime = this.scene.time.now;

      if (
        !target.sprite ||
        !target.burnEffect ||
        currentTime >= burnEffect.endTime
      ) {
        if (burnSprite && burnSprite.active) {
          burnSprite.destroy();
        }
        if (target.burnEffect) {
          delete target.burnEffect;
        }
        return;
      }

      // 화상 스프라이트 위치 업데이트
      if (burnSprite && burnSprite.active && target.sprite) {
        burnSprite.setPosition(target.sprite.x, target.sprite.y);
      }

      // 틱 데미지 적용
      if (currentTime - lastTickTime >= burnEffect.tickInterval) {
        if (target.takeDamage && !target.isDead()) {
          target.takeDamage(burnEffect.damagePerTick);
          lastTickTime = currentTime;
        }
      }
    };

    const updateEvent = this.scene.time.addEvent({
      delay: 100,
      callback: updateBurnEffect,
      loop: true,
    });

    this.scene.time.delayedCall(this.burnDuration, () => {
      updateEvent.remove();
      if (burnSprite && burnSprite.active) {
        burnSprite.destroy();
      }
      if (target.burnEffect) {
        delete target.burnEffect;
      }
    });
  }
}

export const fireWizardSpec: UnitSpec = {
  id: "fire_wizard",
  name: "화염 마도사",
  cost: 6,
  rate: 2,
  description: "강력한 범위 공격",
  cardColor: 0xff4444,
  stats: {
    health: 30,
    speed: 50,
    attackRange: 300,
    attackDamage: 10,
    attackSpeed: 2000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#f5cd05",
    skinKeys: [
      "back/back_f_15",
      "boots/boots_f_11",
      "bottom/bottom_f_51",
      "eyes/eyes_f_19",
      "gear_right/gear_right_f_32",
      "gloves/gloves_f_12",
      "hair_hat/hair_hat_f_8",
      "helmet/helmet_f_28",
      "mouth/mouth_f_9",
      "skin/skin_1",
      "top/top_f_12",
    ],
    attackAnimKey: "Attack_Magic",
    idleAnimKey: "Idle",
  },
  unitClass: FireWizard,
  isRanged: true,
};
