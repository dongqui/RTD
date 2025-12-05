import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { BaseEnemy } from "../enemies/BaseEnemy";

export class CrazyKnightHero extends BaseHero {
  private attackStack: number = 0;
  private attackDamagePerStack: number = 5; // 스택당 공격력 증가량
  private detectionRadius: number = 150; // 주변 적 감지 반경
  private swordIcon?: Phaser.GameObjects.Image;
  private attackText?: Phaser.GameObjects.Text;
  private baseAttackDamage: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "crazy_knight", cardId);
    this.baseAttackDamage = this.attackDamage;

    // 적 사망 이벤트 리스너 등록
    this.scene.events.on("enemy-killed", this.onEnemyKilled, this);

    // UI 초기화 (spineObject가 준비된 후)
    if (this.spineObject) {
      this.createAttackStackUI();
    } else {
      // spineObject가 아직 준비되지 않았다면 다음 프레임에 초기화
      this.scene.time.delayedCall(0, () => {
        if (this.spineObject) {
          this.createAttackStackUI();
        }
      });
    }
  }

  private onEnemyKilled(): void {
    // 주변 적이 죽었는지 확인
    this.attackStack++;
    this.updateAttackDamage();
    this.updateAttackStackUI();
  }

  private updateAttackDamage(): void {
    // 기본 공격력 + 스택당 증가량
    this.attackDamage =
      this.baseAttackDamage + this.attackStack * this.attackDamagePerStack;
  }

  private createAttackStackUI(): void {
    if (!this.spineObject) return;

    // 이미 UI가 생성되어 있으면 스킵
    if (this.swordIcon && this.attackText) return;

    const x = this.spineObject.x;
    const y = this.spineObject.y - 100; // 머리 위 위치

    // 칼 아이콘
    this.swordIcon = this.scene.add.image(x, y, "icon_swoard");
    this.swordIcon.setDisplaySize(30, 30);
    this.swordIcon.setDepth(200);
    this.swordIcon.setVisible(this.attackStack > 0);

    // 공격력 텍스트
    this.attackText = this.scene.add.text(x + 20, y, "", {
      fontFamily: "Germania One",
      fontSize: "20px",
      color: "#ffd700",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.attackText.setOrigin(0, 0.5);
    this.attackText.setDepth(200);
    this.attackText.setVisible(this.attackStack > 0);

    this.updateAttackStackUI();
  }

  private updateAttackStackUI(): void {
    if (!this.swordIcon || !this.attackText || !this.spineObject) return;

    const x = this.spineObject.x;
    const y = this.spineObject.y - 100;

    this.swordIcon.setPosition(x - 15, y);
    this.attackText.setPosition(x + 5, y);
    this.attackText.setText(`+${this.attackStack * this.attackDamagePerStack}`);

    const isVisible = this.attackStack > 0;
    this.swordIcon.setVisible(isVisible);
    this.attackText.setVisible(isVisible);
  }

  onDeath(): void {
    // UI 제거
    this.cleanupUI();
    super.onDeath();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // UI가 없으면 생성 시도
    if (this.spineObject && !this.swordIcon) {
      this.createAttackStackUI();
    }

    // UI 위치 업데이트
    if (this.spineObject && this.swordIcon && this.attackText) {
      this.updateAttackStackUI();
    }
  }

  private cleanupUI(): void {
    // UI 제거
    if (this.swordIcon) {
      this.swordIcon.destroy();
      this.swordIcon = undefined;
    }
    if (this.attackText) {
      this.attackText.destroy();
      this.attackText = undefined;
    }
  }

  destroy(): void {
    // 이벤트 리스너 제거
    this.scene.events.off("enemy-killed", this.onEnemyKilled, this);

    // UI 제거
    this.cleanupUI();

    super.destroy();
  }
}

export const crazyKnightSpec: HeroSpec = {
  id: "crazy_knight",
  name: "광전사",
  cost: 4,
  rate: 2,
  description: "주변 적이 죽을 때마다 공격력 증가",
  cardColor: 0xff6b00,
  stats: {
    health: 320,
    speed: 65,
    attackRange: 50,
    attackDamage: 20,
    attackSpeed: 800,
  },
  visual: {
    skinColor: "#c08e68",
    hairColor: "#fff5f5",
    skinKeys: [
      "bottom/bottom_f_30",
      "eyes/eyes_f_12",
      "gear_left/gear_left_f_22",
      "gear_right/gear_right_f_19",
      "hair_hat/hair_hat_f_10",
      "helmet/helmet_f_53",
      "skin/skin_1",
      "top/top_f_18",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: CrazyKnightHero,
};

// Register the hero spec
HeroRegistry.registerSpec(crazyKnightSpec);
