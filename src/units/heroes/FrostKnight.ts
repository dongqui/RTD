import { BaseHero } from "./BaseHero";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { BehaviorState } from "../../fsm/StateTypes";
import { SlowEffect } from "../../fsm/effects/SlowEffect";

export class FrostKnight extends BaseHero {
  private static frostKnightAnimCreated: boolean = false;
  private static frostDefenceAnimCreated: boolean = false;
  private slowDuration: number = 2000; // 슬로우 지속시간 2초
  private slowMultiplier: number = 0.5; // 20% 슬로우 (0.8배 속도)

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "frost_knight", cardId);

    // frost_knight 애니메이션 생성
    if (!FrostKnight.frostKnightAnimCreated && this.scene.anims) {
      try {
        this.scene.anims.create({
          key: "frost_knight_effect",
          frames: this.scene.anims.generateFrameNumbers("frost_knight", {
            start: 0,
            end: 6,
          }),
          frameRate: 15,
          repeat: 0,
        });
        FrostKnight.frostKnightAnimCreated = true;
      } catch (e) {
        console.warn("Failed to create frost_knight animation:", e);
      }
    }

    // frost_defence 애니메이션 생성
    if (!FrostKnight.frostDefenceAnimCreated && this.scene.anims) {
      try {
        this.scene.anims.create({
          key: "frost_defence_effect",
          frames: this.scene.anims.generateFrameNumbers("frost_defence", {
            start: 0,
            end: 10,
          }),
          frameRate: 20,
          repeat: 0,
        });
        FrostKnight.frostDefenceAnimCreated = true;
      } catch (e) {
        console.warn("Failed to create frost_defence animation:", e);
      }
    }
  }

  protected performAttack(target: CombatEntity | Base): void {
    // frost_knight 이펙트 표시
    this.showFrostEffect(target);
    // 기본 데미지 적용
    target.takeDamage(this.getAttackDamage());
  }

  public takeDamage(damage: number, attacker?: CombatEntity): void {
    super.takeDamage(damage, attacker);

    // 피격 시 공격자에게 슬로우 적용
    const currentState = this.stateMachine?.getCurrentStateType();
    if (currentState === BehaviorState.DEAD) return;

    // frost_defence 이펙트 표시
    this.showFrostDefenceEffect();

    if (attacker) {
      this.applySlowEffect(attacker);
    }
  }

  private applySlowEffect(target: CombatEntity): void {
    // StatusEffect 시스템을 통해 슬로우 적용
    const slowEffect = new SlowEffect(this.slowDuration, this.slowMultiplier);
    target.statusEffects.addEffect(slowEffect);
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

  private showFrostDefenceEffect(): void {
    // 빙결 기사 위치에 frost_defence 이펙트 표시
    const defenceSprite = this.scene.add.sprite(
      this.spineObject.x,
      this.spineObject.y,
      "frost_defence"
    );
    defenceSprite.setScale(1.5);
    defenceSprite.setAlpha(0.5);
    defenceSprite.setOrigin(0.5, 0.8);
    defenceSprite.setDepth(this.spineObject.depth + 1);

    // frost_defence 애니메이션 재생
    if (this.scene.anims.exists("frost_defence_effect")) {
      defenceSprite.play("frost_defence_effect");
    }

    // 애니메이션 완료 후 제거
    defenceSprite.once("animationcomplete", () => {
      if (defenceSprite && defenceSprite.active) {
        defenceSprite.destroy();
      }
    });
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
