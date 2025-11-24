import { CARD_HEIGHT, CARD_WIDTH } from "../constants";

export interface SkillCardConfig {
  cost: number;
  name: string;
  description: string;
  iconKey?: string;
}

class SkillCard extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Image;
  private frame: Phaser.GameObjects.Image;
  private costIcon: Phaser.GameObjects.Image;
  private costText: Phaser.GameObjects.Text;
  private skillIcon: Phaser.GameObjects.Image;
  private titleText: Phaser.GameObjects.Text;
  private descriptionText: Phaser.GameObjects.Text;
  private cardWidth: number = CARD_WIDTH;
  private cardHeight: number = CARD_HEIGHT;
  private cardConfig: SkillCardConfig;
  private onClick: (() => void) | null = null;
  private isFlipped: boolean = false;
  private flipButton: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: SkillCardConfig
  ) {
    super(scene, x, y);

    this.cardConfig = config;

    this.createFrame();
    this.createCostUI();
    this.createTitle(this.cardConfig.name);
    this.createSkillIcon(this.cardConfig.iconKey || "icon_book");
    this.createDescription(this.cardConfig.description);
    this.createFlipButton();

    this.scene.add.existing(this);
  }

  private createFrame(): void {
    // 배경 (Purple Background)
    this.background = this.scene.add.image(
      0,
      0,
      "card_frame_hexagon_purple_bg"
    );
    this.background.setDisplaySize(this.cardWidth - 20, this.cardHeight - 25);
    this.background.setOrigin(0.5);
    this.add(this.background);

    // 테두리 (Purple Border)
    this.frame = this.scene.add.image(0, 0, "card_frame_hexagon_purple_border");
    this.frame.setDisplaySize(this.cardWidth, this.cardHeight);
    this.frame.setOrigin(0.5);
    this.add(this.frame);
  }

  private createCostUI(): void {
    const iconSize = 50;

    // 왼쪽 위 위치 - 모서리에 걸치도록 살짝 아래로
    const iconOffsetX = -this.cardWidth / 2 + iconSize / 2 - 10;
    const iconOffsetY = -this.cardHeight / 2 + iconSize / 2 - 5;

    // Cost icon (rune icon - icon_resource 사용)
    this.costIcon = this.scene.add.image(
      iconOffsetX,
      iconOffsetY,
      "icon_resource"
    );
    this.costIcon.setDisplaySize(iconSize, iconSize);
    this.add(this.costIcon);

    // 비용 텍스트
    this.costText = this.scene.add.text(
      iconOffsetX,
      iconOffsetY,
      this.cardConfig.cost.toString(),
      {
        fontFamily: "Germania One",
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    this.costText.setOrigin(0.5);
    this.add(this.costText);
  }

  private createTitle(name: string): void {
    // 타이틀을 상단에 배치
    const titleY = -this.cardHeight / 2 + 70;
    const containerWidth = this.cardWidth - 40;

    this.titleText = this.scene.add.text(0, titleY, name, {
      fontFamily: "Germania One",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
      wordWrap: { width: containerWidth },
      align: "center",
    });
    this.titleText.setOrigin(0.5);
    this.add(this.titleText);
  }

  private createSkillIcon(iconKey: string): void {
    const iconSize = 90; // 조금 더 크게

    // 타이틀 아래에 스킬 아이콘 배치 - 살짝 더 아래로
    const iconOffsetY = -this.cardHeight / 2 + 140;

    this.skillIcon = this.scene.add.image(0, iconOffsetY, iconKey);
    this.skillIcon.setDisplaySize(iconSize, iconSize);
    this.add(this.skillIcon);
  }

  private createDescription(description: string): void {
    if (!description) return;

    const containerWidth = this.cardWidth - 30;
    const fontSize = 16;

    this.descriptionText = this.scene.add.text(0, 0, description, {
      fontFamily: "Germania One",
      fontSize: `${fontSize}px`,
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
      wordWrap: { width: containerWidth },
      align: "center",
    });
    this.descriptionText.setOrigin(0.5, 0.5);
    // 초기에는 description 숨김
    this.descriptionText.setVisible(false);
    this.add(this.descriptionText);
  }

  private createFlipButton(): void {
    if (!this.cardConfig.description) return;

    const iconSize = 50;

    // 오른쪽 위 위치
    const iconOffsetX = this.cardWidth / 2 - iconSize / 2 + 10;
    const iconOffsetY = -this.cardHeight / 2 + iconSize / 2 - 10;

    this.flipButton = this.scene.add.text(iconOffsetX, iconOffsetY, "↻", {
      fontFamily: "Arial",
      fontSize: "60px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.flipButton.setOrigin(0.5);
    this.flipButton.setAngle(90); // 90도 회전
    this.flipButton.setInteractive({ useHandCursor: true });

    // 클릭 이벤트로 카드 뒤집기
    this.flipButton.on("pointerdown", () => {
      this.flip();
    });

    this.add(this.flipButton);
  }

  // 카드 뒤집기 메서드
  private flip(): void {
    // 애니메이션 중복 방지
    if (this.scene.tweens.isTweening(this)) return;

    this.isFlipped = !this.isFlipped;

    // Y축 회전 애니메이션
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 150,
      ease: "Power2",
      onComplete: () => {
        // 90도에서 이미지/description 전환
        if (this.isFlipped) {
          // 뒤집힌 상태: description만 표시
          this.skillIcon.setVisible(false);
          this.titleText.setVisible(false);
          this.descriptionText.setVisible(true);
        } else {
          // 앞면 상태: 아이콘과 타이틀 표시
          this.skillIcon.setVisible(true);
          this.titleText.setVisible(true);
          this.descriptionText.setVisible(false);
        }

        // 다시 펼치기
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 150,
          ease: "Power2",
        });
      },
    });
  }

  // Getter for card configuration
  public get cardData(): SkillCardConfig {
    return this.cardConfig;
  }

  // Set onClick callback
  setOnClick(callback: () => void): void {
    this.onClick = callback;
    this.setInteractive({ useHandCursor: true });
    this.on("pointerdown", () => {
      if (this.onClick) {
        this.onClick();
      }
    });
  }
}

export default SkillCard;
