import { CombatEntity } from "../CombatEntity";
import { StatusEffect, EffectType } from "./StatusEffect";

export class AttackDamageEffect extends StatusEffect {
  private multiplier: number;
  private iconSprite: Phaser.GameObjects.Sprite | null = null;
  private updateEvent: Phaser.Time.TimerEvent | null = null;

  constructor(duration: number, multiplier: number) {
    super(EffectType.ATTACK_DAMAGE, duration);
    this.multiplier = multiplier;
  }

  apply(entity: CombatEntity): void {
    entity.statusEffects.registerAttackDamageMultiplier(
      this.getId(),
      this.multiplier
    );

    // 머리 위에 검 아이콘 표시
    if (entity.spineObject) {
      const scene = entity.getScene();
      const x = entity.getX();
      const y = entity.getY() - 80; // 머리 위 위치

      this.iconSprite = scene.add.sprite(x, y, "icon_swoard");
      this.iconSprite.setScale(0.5);
      this.iconSprite.setAlpha(0.9);
      this.iconSprite.setOrigin(0.5, 0.5);
      this.iconSprite.setDepth(entity.spineObject.depth + 10);

      // 위치 업데이트
      const updateIconPosition = () => {
        if (entity.spineObject && this.iconSprite?.active) {
          this.iconSprite.setPosition(entity.getX(), entity.getY() - 80);
        }
      };

      this.updateEvent = scene.time.addEvent({
        delay: 16,
        callback: updateIconPosition,
        loop: true,
      });
    }
  }

  remove(entity: CombatEntity): void {
    entity.statusEffects.unregisterAttackDamageMultiplier(this.getId());

    // 아이콘 제거
    if (this.updateEvent) {
      this.updateEvent.remove();
      this.updateEvent = null;
    }

    if (this.iconSprite) {
      this.iconSprite.destroy();
      this.iconSprite = null;
    }
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
