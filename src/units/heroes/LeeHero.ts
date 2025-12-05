import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { SoundManager } from "../../managers/SoundManager";
import { BehaviorState } from "../../fsm/StateTypes";

interface FireboltProjectile {
  sprite: Phaser.GameObjects.Sprite;
  target: CombatEntity;
  damage: number;
  speed: number;
  active: boolean;
  exploded: boolean;
}

export class LeeHero extends BaseHero {
  private static fireboltFlyAnimCreated: boolean = false;
  private static fireboltExplodeAnimCreated: boolean = false;
  private firebolts: FireboltProjectile[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "lee", cardId);

    // firebolt 날아가는 애니메이션 생성 (프레임 1-4)
    if (!LeeHero.fireboltFlyAnimCreated && this.scene.anims) {
      try {
        this.scene.anims.create({
          key: "firebolt_fly",
          frames: this.scene.anims.generateFrameNumbers("firebolt", {
            start: 0,
            end: 3,
          }),
          frameRate: 15,
          repeat: -1,
        });
        LeeHero.fireboltFlyAnimCreated = true;
      } catch (e) {
        console.warn("Failed to create firebolt_fly animation:", e);
      }
    }

    // firebolt 폭발 애니메이션 생성 (프레임 6-11)
    if (!LeeHero.fireboltExplodeAnimCreated && this.scene.anims) {
      try {
        this.scene.anims.create({
          key: "firebolt_explode",
          frames: this.scene.anims.generateFrameNumbers("firebolt", {
            start: 5,
            end: 10,
          }),
          frameRate: 15,
          repeat: 0,
        });
        LeeHero.fireboltExplodeAnimCreated = true;
      } catch (e) {
        console.warn("Failed to create firebolt_explode animation:", e);
      }
    }
  }

  protected performAttack(target: CombatEntity): void {
    const startX = this.spineObject.x + 25;
    const startY = this.spineObject.y - 52;

    const fireboltSprite = this.scene.add.sprite(startX, startY, "firebolt");
    fireboltSprite.setScale(1.5);
    fireboltSprite.setOrigin(0.5, 0.5);
    fireboltSprite.setDepth(100);

    // 날아가는 애니메이션 재생
    if (this.scene.anims.exists("firebolt_fly")) {
      fireboltSprite.play("firebolt_fly");
    }

    const firebolt: FireboltProjectile = {
      sprite: fireboltSprite,
      target: target,
      damage: this.getAttackDamage(),
      speed: 600,
      active: true,
      exploded: false,
    };

    this.firebolts.push(firebolt);
  }

  findTarget(): CombatEntity | Base | null {
    // 사거리 관계 없이 랜덤으로 적 선택
    const enemies = this.scene.data.get("enemies") || [];

    // 살아있는 적만 필터링
    const aliveEnemies = enemies.filter((enemy: any) => {
      if (enemy.isDead && enemy.isDead()) return false;
      // 부활 중인 유닛 제외
      if (
        enemy.stateMachine &&
        enemy.stateMachine.getCurrentStateType() === BehaviorState.REVIVING
      )
        return false;
      return true;
    });

    // 살아있는 적이 있으면 랜덤 선택
    if (aliveEnemies.length > 0) {
      const randomIndex = Math.floor(Math.random() * aliveEnemies.length);
      return aliveEnemies[randomIndex];
    }

    return null;
  }

  protected onAttack(_target: CombatEntity | Base): void {
    // Play arrow sound immediately when shooting
    SoundManager.getInstance().play("sound_hit_arrow", { volume: 0.4 });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // firebolt 업데이트
    for (let i = this.firebolts.length - 1; i >= 0; i--) {
      const firebolt = this.firebolts[i];

      if (!firebolt.active) {
        this.firebolts.splice(i, 1);
        continue;
      }

      if (firebolt.exploded) {
        // 폭발 애니메이션이 완료되면 제거
        firebolt.sprite.destroy();
        this.firebolts.splice(i, 1);
        continue;
      }

      // 적의 상단(몸통/머리) 부분을 타겟으로 설정
      let targetX = firebolt.target.getX();
      let targetY = firebolt.target.getY();

      // 타겟이 적인 경우 Y 좌표를 위로 조정 (상단에 맞추기)
      if (firebolt.target.spineObject) {
        targetY = firebolt.target.spineObject.y - 80; // 상단으로 80픽셀 올림
      } else if (firebolt.target.getY) {
        targetY = firebolt.target.getY() - 80;
      }

      const distance = Phaser.Math.Distance.Between(
        firebolt.sprite.x,
        firebolt.sprite.y,
        targetX,
        targetY
      );

      // 타겟에 도달했을 때
      if (distance < 20) {
        // 데미지 적용
        firebolt.target.takeDamage(firebolt.damage);

        // 폭발 애니메이션 재생 (타겟 상단 위치에서)
        if (this.scene.anims.exists("firebolt_explode")) {
          firebolt.sprite.play("firebolt_explode");
          firebolt.exploded = true;

          // 폭발 애니메이션 완료 시 제거
          firebolt.sprite.once("animationcomplete", () => {
            if (firebolt.sprite && firebolt.sprite.active) {
              firebolt.sprite.destroy();
            }
          });
        } else {
          // 애니메이션이 없으면 바로 제거
          firebolt.sprite.destroy();
          this.firebolts.splice(i, 1);
        }
        continue;
      }

      // 타겟으로 이동
      const moveDistance = (firebolt.speed * delta) / 1000;

      if (moveDistance >= distance) {
        firebolt.sprite.x = targetX;
        firebolt.sprite.y = targetY;
      } else {
        const angle = Phaser.Math.Angle.Between(
          firebolt.sprite.x,
          firebolt.sprite.y,
          targetX,
          targetY
        );

        firebolt.sprite.x += Math.cos(angle) * moveDistance;
        firebolt.sprite.y += Math.sin(angle) * moveDistance;
        firebolt.sprite.setRotation(angle);
      }
    }
  }

  destroy(): void {
    // 모든 firebolt 정리
    this.firebolts.forEach((firebolt) => {
      if (firebolt.sprite) {
        firebolt.sprite.destroy();
      }
    });
    this.firebolts = [];

    super.destroy();
  }
}

export const leeSpec: HeroSpec = {
  id: "lee",
  name: "불멸의 영웅",
  cost: 5,
  rate: 2,
  description: "강력한 원거리 공격",
  cardColor: 0xffd700,
  stats: {
    health: 150,
    speed: 50,
    attackRange: 99999, // 사거리 무제한 (실제로는 랜덤 타겟 선택)
    attackDamage: 40,
    attackSpeed: 400,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_21",
      "beard/beard_f_6",
      "bottom/bottom_f_13",
      "eyes/eyes_f_3",
      "gear_right/gear_right_f_23",
      "gloves/gloves_f_15",
      "helmet/helmet_f_19",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_13",
    ],
    idleAnimKey: "Idle_Bow",
    attackAnimKey: "Attack_Bow",
  },
  heroClass: LeeHero,
  isRanged: true,
};

// Register the hero spec
HeroRegistry.registerSpec(leeSpec);
