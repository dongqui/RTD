import { BaseHero } from "./BaseHero";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { BehaviorState } from "../../fsm/StateTypes";

export class FrostKnight extends BaseHero {
  private static frostKnightAnimCreated: boolean = false;
  private slowDuration: number = 2000; // 슬로우 지속시간 2초
  private slowAmount: number = 0.2; // 20% 슬로우

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "frost_knight", cardId);

    // frost_knight 애니메이션 생성
    if (!FrostKnight.frostKnightAnimCreated && this.scene.anims) {
      try {
        this.scene.anims.create({
          key: "frost_knight_effect",
          frames: this.scene.anims.generateFrameNumbers("frost_knight", {
            start: 0,
            end: 8,
          }),
          frameRate: 18,
          repeat: 0,
        });
        FrostKnight.frostKnightAnimCreated = true;
      } catch (e) {
        console.warn("Failed to create frost_knight animation:", e);
      }
    }
  }

  protected performAttack(target: CombatEntity | Base): void {
    // frost_knight 이펙트 표시
    this.showFrostEffect(target);
    // 기본 데미지 적용
    target.takeDamage(this.getAttackDamage());
  }

  public takeDamage(damage: number): void {
    super.takeDamage(damage);

    // 피격 시 공격자에게 슬로우 적용
    const currentState = this.stateMachine?.getCurrentStateType();
    if (currentState === BehaviorState.DEAD) return;

    // 공격한 적을 찾아서 슬로우 적용
    const attacker = this.findAttacker();
    if (attacker) {
      this.applySlowEffect(attacker);
    }
  }

  private findAttacker(): CombatEntity | null {
    // 가장 가까운 적을 공격자로 간주
    const enemies = this.scene.data.get("enemies") || [];
    let nearestEnemy: CombatEntity | null = null;
    let nearestDistance = Infinity;

    for (const enemy of enemies) {
      if (enemy.isDead && enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      // 공격 범위 내에 있는 적만 대상으로
      if (distance < 100 && distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  private applySlowEffect(target: CombatEntity): void {
    // speedMultiplier를 사용하여 슬로우 적용
    target.speedMultiplier *= 1 - this.slowAmount;

    // 슬로우 이펙트 표시
    this.showSlowEffect(target);

    // 일정 시간 후 원래 속도로 복구
    this.scene.time.delayedCall(this.slowDuration, () => {
      if (target && !target.isDead()) {
        target.speedMultiplier /= 1 - this.slowAmount;
      }
    });
  }

  private showFrostEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();

    // 공격 위치에 frost_knight 이펙트 표시
    const frostSprite = this.scene.add.sprite(targetX, targetY, "frost_knight");
    frostSprite.setScale(1.2);
    frostSprite.setOrigin(0.5, 0.8);
    frostSprite.setDepth(100);

    // frost_knight 애니메이션 재생
    if (this.scene.anims.exists("frost_knight_effect")) {
      frostSprite.play("frost_knight_effect");
    }

    // 애니메이션 완료 후 제거
    frostSprite.once("animationcomplete", () => {
      if (frostSprite && frostSprite.active) {
        frostSprite.destroy();
      }
    });
  }

  private showSlowEffect(target: CombatEntity): void {
    // 슬로우 상태 시각 효과 (파란색 알파값으로 표현)
    if (target.spineObject) {
      const originalAlpha = target.spineObject.alpha;
      target.spineObject.setAlpha(0.7);

      this.scene.time.delayedCall(this.slowDuration, () => {
        if (target.spineObject && target.spineObject.active) {
          target.spineObject.setAlpha(originalAlpha);
        }
      });
    }
  }
}

export const frostKnightSpec: HeroSpec = {
  id: "frost_knight",
  name: "빙결 기사",
  cost: 4,
  rate: 2,
  description: "피격 시 공격자를 20% 느리게 만듦",
  cardColor: 0x4da6ff,
  stats: {
    health: 400,
    speed: 55,
    attackRange: 50,
    attackDamage: 20,
    attackSpeed: 1200,
  },
  visual: {
    skinColor: "#ffd7b8",
    hairColor: "#fffafa",
    skinKeys: [
      "boots/boots_f_9",
      "bottom/bottom_f_10",
      "brow/brow_f_5",
      "eyes/eyes_f_4",
      "gear_right/gear_right_f_17",
      "gloves/gloves_f_16",
      "hair_short/hair_short_f_11",
      "mouth/mouth_f_1",
      "skin/skin_1",
      "top/top_f_22",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: FrostKnight,
};

// Register the hero spec
HeroRegistry.registerSpec(frostKnightSpec);
