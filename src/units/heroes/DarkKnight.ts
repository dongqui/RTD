import { BaseHero } from "./BaseHero";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";

export class DarkKnight extends BaseHero {
  private static slashDarkAnimCreated: boolean = false;
  private aoeRadius: number = 80; // 근거리 범위 공격 반경

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "dark_knight", cardId);

    // slash_dark 애니메이션 생성
    if (!DarkKnight.slashDarkAnimCreated && this.scene.anims) {
      try {
        this.scene.anims.create({
          key: "slash_dark",
          frames: this.scene.anims.generateFrameNumbers("slash_dark", {
            start: 0,
            end: 10,
          }),
          frameRate: 20,
          repeat: 0,
        });
        DarkKnight.slashDarkAnimCreated = true;
      } catch (e) {
        console.warn("Failed to create slash_dark animation:", e);
      }
    }
  }

  protected performAttack(target: CombatEntity | Base): void {
    // slash_dark 이펙트 표시
    this.showSlashEffect(target);
    // 범위 공격 데미지 적용
    this.dealAoeDamage(target);
  }

  private showSlashEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();

    // 공격 위치에 slash_dark 이펙트 표시
    const slashSprite = this.scene.add.sprite(targetX, targetY, "slash_dark");
    slashSprite.setScale(1.5);
    slashSprite.setOrigin(0.5, 0.5);
    slashSprite.setDepth(100);

    // slash_dark 애니메이션 재생
    if (this.scene.anims.exists("slash_dark")) {
      slashSprite.play("slash_dark");
    }

    // 애니메이션 완료 후 제거
    slashSprite.once("animationcomplete", () => {
      if (slashSprite && slashSprite.active) {
        slashSprite.destroy();
      }
    });
  }

  private dealAoeDamage(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();
    const enemies = this.scene.data.get("enemies") || [];

    // target이 Base인 경우 Base에도 데미지 적용
    const isTargetBase =
      (target as any).isActive !== undefined &&
      (target as any).getTeam !== undefined;
    if (isTargetBase && (target as Base).isActive()) {
      target.takeDamage(this.getAttackDamage());
    }

    // 범위 내의 모든 적에게 데미지 적용
    for (const enemy of enemies) {
      if (enemy.isDead && enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        targetX,
        targetY,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      if (distance <= this.aoeRadius) {
        enemy.takeDamage(this.getAttackDamage());
      }
    }
  }
}

export const darkKnightSpec: HeroSpec = {
  id: "dark_knight",
  name: "다크나이트",
  cost: 5,
  rate: 2,
  description: "빠르고 강한 근점 범위 공격",
  cardColor: 0x4a148c,
  stats: {
    health: 350,
    speed: 70,
    attackRange: 60,
    attackDamage: 35,
    attackSpeed: 600, // 빠른 공격 속도
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#fff5f5",
    skinKeys: [
      "boots/boots_f_2",
      "bottom/bottom_f_8",
      "eyes/eyes_f_19",
      "gear_left/gear_left_f_18",
      "gear_right/gear_right_f_14",
      "gloves/gloves_f_9",
      "hair_short/hair_short_f_18",
      "mouth/mouth_f_9",
      "skin/skin_1",
      "top/top_f_13",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: DarkKnight,
};

// Register the hero spec
HeroRegistry.registerSpec(darkKnightSpec);
