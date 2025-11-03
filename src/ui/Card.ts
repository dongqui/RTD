export interface CardConfig {
  cost: number;
  name: string;
  imageKey: string;
  attack?: number;
  health?: number;
}

class Card extends Phaser.GameObjects.Container {
  private frame: Phaser.GameObjects.NineSlice;
  private costIcon: Phaser.GameObjects.Image;
  private costText: Phaser.GameObjects.Text;
  private cardImage: Phaser.GameObjects.Image | null = null;
  private titleContainer: Phaser.GameObjects.Container;
  private titleText: Phaser.GameObjects.Text;
  private attackIcon: Phaser.GameObjects.Image | null = null;
  private attackText: Phaser.GameObjects.Text | null = null;
  private healthIcon: Phaser.GameObjects.Image | null = null;
  private healthText: Phaser.GameObjects.Text | null = null;
  private cardWidth: number = 200;
  private cardHeight: number = 280;
  private cardConfig: CardConfig;
  constructor(scene: Phaser.Scene, x: number, y: number, config: CardConfig) {
    super(scene, x, y);

    // 이전 버전 호환성 (숫자만 전달된 경우)
    this.cardConfig = config;

    this.createFrame();
    this.createImage(this.cardConfig.imageKey);
    this.createTitleRibbon(this.cardConfig.name);
    this.createCostUI();
    this.createAttackIcon();
    this.createHealthIcon();

    this.scene.add.existing(this);
  }
  private createCostUI() {
    const iconSize = 50;

    const iconOffsetX = this.cardWidth / 2 - iconSize / 2 + 10;
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

  private createAttackIcon(): void {
    const iconSize = 60;
    // 왼쪽 아래 위치 (카드 하단에서 약간 위, 왼쪽에서 살짝 삐져나오도록)
    const iconOffsetX = -this.cardWidth / 2 + iconSize / 2 - 10; // 살짝 삐져나오도록
    const iconOffsetY = this.cardHeight / 2 - iconSize / 2 + 10;

    this.attackIcon = this.scene.add.image(
      iconOffsetX,
      iconOffsetY,
      "icon_swoard2"
    );
    this.attackIcon.setDisplaySize(iconSize, iconSize);
    this.add(this.attackIcon);

    // 공격력 텍스트 (아이콘 중앙에 흰색 숫자)
    this.attackText = this.scene.add.text(
      iconOffsetX,
      iconOffsetY,
      this.cardConfig.attack!.toString(),
      {
        fontSize: "24px",
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
    const iconSize = 60;
    // 오른쪽 아래 위치 (카드 하단에서 약간 위, 오른쪽에서 살짝 삐져나오도록)
    const iconOffsetX = this.cardWidth / 2 - iconSize / 2 + 10; // 살짝 삐져나오도록
    const iconOffsetY = this.cardHeight / 2 - iconSize / 2 + 10;

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

    this.cardImage = this.scene.add.image(0, -50, imageKey);
    this.cardImage.setDisplaySize(imageWidth, imageHeight);
    this.add(this.cardImage);
  }

  // 카드 이름 컨테이너 생성
  private createTitleRibbon(name: string): void {
    // 이미지 위치: 0, -50
    // 이미지 높이: 140
    // 이미지 하단: -50 + 140/2 = 20
    // 이름을 이미지 바로 아래에 배치
    const titleY = 15; // 이미지 하단 + 약간의 여백

    const containerWidth = this.cardWidth - 40;
    const containerHeight = 40;
    const radius = 10; // 모서리 둥글기

    // 배경 박스 생성 (반투명 검은색 배경, 둥근 모서리)
    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 1);
    background.fillRoundedRect(
      -containerWidth / 2,
      -containerHeight / 2,
      containerWidth,
      containerHeight,
      radius
    );

    // 이름 텍스트
    this.titleText = this.scene.add.text(0, 0, name, {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
      wordWrap: { width: containerWidth - 20 },
      align: "center",
    });
    this.titleText.setOrigin(0.5);

    // 컨테이너에 배경과 텍스트 추가
    this.titleContainer = this.scene.add.container(0, titleY);
    this.titleContainer.add([background, this.titleText]);
    this.add(this.titleContainer);
  }

  createFrame(): void {
    // NineSlice로 카드 프레임 생성 (크기 조절 가능)
    this.frame = this.scene.add.nineslice(
      0,
      0,
      "blue_border_gem_card_frame",
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
    // 배경 이미지: 프레임과 동일한 크기로 설정 (프레임이 위에 렌더링되어 테두리가 보임)
    const background = this.scene.add.image(0, 0, "card_frame_bg_blue");
    background.setDisplaySize(this.cardWidth - 20, this.cardHeight - 20);
    background.setOrigin(0.5);
    this.addAt(background, 0);
  }

  // 카드 크기 변경 메서드
  setCardSize(width: number, height: number): void {
    this.cardWidth = width;
    this.cardHeight = height;
    this.frame.setSize(width, height);

    // 아이콘 위치 재조정
    const iconSize = 50;
    const iconOffsetX = width / 2 - iconSize / 2 + 20;
    const iconOffsetY = -height / 2 + iconSize / 2 - 10;

    this.costIcon.setPosition(iconOffsetX, iconOffsetY);
    this.costText.setPosition(iconOffsetX, iconOffsetY);
  }
}

export default Card;
