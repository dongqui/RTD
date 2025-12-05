import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { SoundManager } from "../../managers/SoundManager";

export class PriestHero extends BaseHero {
  private static healAnimCreated: boolean = false;
  private lastHealTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "priest", cardId);

    if (!PriestHero.healAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "heal_effect",
        frames: this.scene.anims.generateFrameNumbers("heal", {
          start: 0,
          end: 10,
        }),
        frameRate: 15,
        repeat: 0,
      });
      PriestHero.healAnimCreated = true;
    }
  }

  protected performAttack(_target: CombatEntity | Base): void {
    // 공격 대신 아군 유닛 체력 회복
    this.healAllies();
  }

  private healAllies(): void {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastHealTime < this.getAttackSpeed()) {
      return;
    }
    this.lastHealTime = currentTime;

    const heroes = (this.scene.data.get("heroes") as BaseHero[]) || [];
    const healAmount = priestSpec.stats.heal?.amount || 20;
    const healRange = priestSpec.stats.heal?.range || 200;

    let healedCount = 0;
    for (const hero of heroes) {
      if (hero === this || hero.isDead()) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        hero.getX(),
        hero.getY()
      );

      if (distance <= healRange) {
        hero.heal(healAmount);
        this.showHealEffect(hero);
        healedCount++;
      }
    }
  }

  private showHealEffect(hero: BaseHero): void {
    const heroX = hero.getX();
    const heroY = hero.getY() - 50; // 히어로 머리 위쪽에 표시

    const healSprite = this.scene.add.sprite(heroX, heroY, "heal");
    healSprite.setScale(1.5);
    healSprite.setOrigin(0.5, 0.5);
    healSprite.setDepth(hero.spineObject.depth + 1);
    healSprite.setBlendMode(Phaser.BlendModes.ADD);

    // 위로 올라가면서 페이드 아웃
    this.scene.tweens.add({
      targets: healSprite,
      y: heroY - 80,
      alpha: 0,
      duration: 800,
      ease: "Power2",
    });

    // 애니메이션 재생
    healSprite.play("heal_effect");

    // 애니메이션 완료 시 제거
    healSprite.on("animationcomplete", () => {
      healSprite.destroy();
    });
  }

  protected onAttack(_target: CombatEntity | Base): void {
    // 힐 사운드 재생
    SoundManager.getInstance().play("heal", { volume: 0.4 });
  }
}

export const priestSpec: HeroSpec = {
  id: "priest",
  name: "프리스트",
  cost: 3,
  rate: 2,
  description: "공격 대신 아군 유닛 체력을 회복합니다",
  cardColor: 0xffffff,
  stats: {
    health: 200,
    speed: 50,
    attackRange: 200,
    attackDamage: 0,
    attackSpeed: 1200,
    heal: {
      amount: 20,
      range: 200,
      speed: 1200,
    },
  },
  visual: {
    skinColor: "#ffba85",
    hairColor: "#343e55",
    skinKeys: [
      "boots/boots_f_28",
      "bottom/bottom_f_15",
      "eyes/eyes_f_11",
      "gear_left/gear_left_f_24",
      "gear_left/gear_left_f_39",
      "hair_short/hair_short_f_13",
      "helmet/helmet_f_26",
      "mouth/mouth_f_1",
      "skin/skin_1",
      "top/top_f_45",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: PriestHero,
};

// Register the hero spec
HeroRegistry.registerSpec(priestSpec);
