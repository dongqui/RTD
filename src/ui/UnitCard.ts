import { CARD_HEIGHT, CARD_WIDTH } from "../constants";

export interface UnitCardConfig {
  cost: number;
  name: string;
  imageKey: string;
  attack: number;
  health: number;
  description: string;
  rate: 1 | 2 | 3;
}

class UnitCard extends Phaser.GameObjects.Container {
  private frame: Phaser.GameObjects.NineSlice;
  private costIcon: Phaser.GameObjects.Image;
  private costText: Phaser.GameObjects.Text;
  private flipButton: Phaser.GameObjects.Text;
  private cardImage: Phaser.GameObjects.Image | null = null;
  private titleContainer: Phaser.GameObjects.Container;
  private titleText: Phaser.GameObjects.Text;
  private descriptionText: Phaser.GameObjects.Text;
  private attackIcon: Phaser.GameObjects.Image | null = null;
  private attackText: Phaser.GameObjects.Text | null = null;
  private healthIcon: Phaser.GameObjects.Image | null = null;
  private healthText: Phaser.GameObjects.Text | null = null;
  private cardWidth: number = CARD_WIDTH;
  private cardHeight: number = CARD_HEIGHT;
  private cardConfig: UnitCardConfig;
  private isFlipped: boolean = false;
  private onClick: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: UnitCardConfig
  ) {
    super(scene, x, y);

    // 이전 버전 호환성 (숫자만 전달된 경우)
    this.cardConfig = config;

    this.createFrame();
    this.createImage(this.cardConfig.imageKey);
    this.createTitleRibbon(this.cardConfig.name);
    this.createDescription(this.cardConfig.description);
    this.createCostUI();
    this.createFlipButton();
    this.createAttackIcon();
    this.createHealthIcon();

    this.scene.add.existing(this);
  }
  private createCostUI() {
    const iconSize = 50;

    // 왼쪽 위로 변경
    const iconOffsetX = -this.cardWidth / 2 + iconSize / 2 - 10;
    const iconOffsetY = -this.cardHeight / 2 + iconSize / 2 - 10;

    this.costIcon = this.scene.add.image(
      iconOffsetX,
      iconOffsetY,
      "icon_resource"
    );
    this.costIcon.setDisplaySize(iconSize, iconSize);
    this.add(this.costIcon);

    // 비용 텍스트 (아이콘 중앙에 흰색 큰 숫자)
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

  private createFlipButton() {
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

  private createAttackIcon(): void {
    const iconSize = 40;
    // 왼쪽 아래 위치 (카드 하단에서 약간 위, 왼쪽에서 살짝 안쪽으로)
    const iconOffsetX = -this.cardWidth / 2 + iconSize / 2; // 살짝 안쪽으로
    const iconOffsetY = this.cardHeight / 2 - iconSize / 2 + 3;

    this.attackIcon = this.scene.add.image(
      iconOffsetX,
      iconOffsetY,
      "icon_swoard"
    );
    this.attackIcon.setDisplaySize(iconSize, iconSize);
    this.add(this.attackIcon);

    // 공격력 텍스트 (아이콘 중앙에 흰색 숫자)
    this.attackText = this.scene.add.text(
      iconOffsetX,
      iconOffsetY,
      this.cardConfig.attack!.toString(),
      {
        fontFamily: "Germania One",
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    this.attackText.setOrigin(0.5);
    this.add(this.attackText);
  }

  private createHealthIcon(): void {
    const iconSize = 40;
    // 오른쪽 아래 위치 (카드 하단에서 약간 위, 오른쪽에서 살짝 안쪽으로)
    const iconOffsetX = this.cardWidth / 2 - iconSize / 2 - 3; // 살짝 안쪽으로
    const iconOffsetY = this.cardHeight / 2 - iconSize / 2 + 3;

    this.healthIcon = this.scene.add.image(
      iconOffsetX,
      iconOffsetY,
      "icon_health"
    );
    this.healthIcon.setDisplaySize(iconSize, iconSize);
    this.add(this.healthIcon);

    // 체력 텍스트 (아이콘 중앙에 흰색 숫자)
    this.healthText = this.scene.add.text(
      iconOffsetX,
      iconOffsetY,
      this.cardConfig.health!.toString(),
      {
        fontFamily: "Germania One",
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    this.healthText.setOrigin(0.5);
    this.add(this.healthText);
  }

  // 일반 이미지로 카드 생성
  private createImage(imageKey: string): void {
    const imageWidth = 160;
    const imageHeight = 140;

    this.cardImage = this.scene.add.image(0, 25, imageKey);
    this.cardImage.setDisplaySize(imageWidth, imageHeight);
    this.add(this.cardImage);
  }

  // 카드 이름 컨테이너 생성
  private createTitleRibbon(name: string): void {
    // 카드 최상단에 배치
    const titleY = -this.cardHeight / 2 + 60; // 카드 최상단 + 약간의 여백

    const containerWidth = this.cardWidth - 40;

    // 이름 텍스트
    this.titleText = this.scene.add.text(0, 0, name, {
      fontFamily: "Germania One",
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
      wordWrap: { width: containerWidth - 20 },
      align: "center",
    });
    this.titleText.setOrigin(0.5);

    // 컨테이너에 배경과 텍스트 추가
    this.titleContainer = this.scene.add.container(0, titleY);
    this.titleContainer.add([this.titleText]);
    this.add(this.titleContainer);
  }

  // 카드 설명 텍스트 생성
  private createDescription(description: string): void {
    if (!description) return;

    const containerWidth = this.cardWidth - 25; // 더 넓게 설정
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

  createFrame(): void {
    // NineSlice로 카드 프레임 생성 (크기 조절 가능)

    let color;
    switch (this.cardConfig.rate) {
      case 1:
        color = "blue";
        break;
      case 2:
        color = "yellow";
        break;
      case 3:
        color = "yellow";
    }

    this.frame = this.scene.add.nineslice(
      0,
      0,
      `card_frame_${color}_border_gem`,
      undefined,
      this.cardWidth,
      this.cardHeight,
      20, // leftWidth
      20, // rightWidth
      20, // topHeight
      20 // bottomHeight
    );
    this.frame.setOrigin(0.5);
    this.add(this.frame);

    // 배경: Graphics로 밝은 회색 사각형 생성
    // const background = this.scene.add.graphics();
    // background.fillStyle(0xcccccc, 1); // 밝은 회색
    // const bgWidth = this.cardWidth - 20;
    // const bgHeight = this.cardHeight - 20;
    // background.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
    // this.addAt(background, 0);

    // 기존 이미지 방식 (주석처리)
    const background = this.scene.add.image(0, 0, `card_frame_bg_${color}`);
    background.setDisplaySize(this.cardWidth - 20, this.cardHeight - 20);
    background.setOrigin(0.5);

    this.addAt(background, 0);
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
          this.cardImage?.setVisible(false);
          this.titleContainer.setVisible(false);
          this.descriptionText.setVisible(true);
        } else {
          // 앞면 상태: 이미지와 타이틀 표시
          this.cardImage?.setVisible(true);
          this.titleContainer.setVisible(true);
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

  // 카드 크기 변경 메서드
  setCardSize(width: number, height: number): void {
    this.cardWidth = width;
    this.cardHeight = height;
    this.frame.setSize(width, height);

    // 아이콘 위치 재조정 (왼쪽 위로 변경)
    const iconSize = 40;
    const iconOffsetX = -width / 2 + iconSize / 2 - 10;
    const iconOffsetY = -height / 2 + iconSize / 2 - 10;

    this.costIcon.setPosition(iconOffsetX, iconOffsetY);
    this.costText.setPosition(iconOffsetX, iconOffsetY);
  }

  // Getter for card configuration
  public get cardData(): UnitCardConfig {
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

export default UnitCard;
