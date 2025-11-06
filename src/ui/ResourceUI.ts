import { SAFE_AREA } from "../main";

export default class ResourceUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private shadowGraphics: Phaser.GameObjects.Graphics;
  private bgGraphics: Phaser.GameObjects.Graphics;
  private fillGraphics: Phaser.GameObjects.Graphics;
  private borderGraphics: Phaser.GameObjects.Graphics;
  private icon: Phaser.GameObjects.Image;
  private resourceText: Phaser.GameObjects.Text;
  private maxResource: number;
  private currentResource: number;
  private sliderHeight: number = 80; // 슬라이더 높이
  private iconSize: number = 100; // 아이콘 크기
  private sliderWidth: number; // 슬라이더 너비 (SAFE_AREA 기준)
  private borderRadius: number = 18; // border radius

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxResource: number = 10
  ) {
    this.scene = scene;
    this.maxResource = maxResource;
    this.currentResource = 0;

    // 슬라이더 너비는 SAFE_AREA 너비에 맞춤
    this.sliderWidth = SAFE_AREA.width;

    this.container = this.scene.add.container(x + this.iconSize / 4, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    // Graphics 객체들 생성
    this.shadowGraphics = this.scene.add.graphics();
    this.bgGraphics = this.scene.add.graphics();
    this.fillGraphics = this.scene.add.graphics();
    this.borderGraphics = this.scene.add.graphics();

    // Rune 아이콘 (왼쪽 끝에 배치)
    const iconX = this.iconSize / 2; // 바의 왼쪽 끝에 맞춤
    this.icon = this.scene.add.image(0, 0, "icon_resource");
    this.icon.setDisplaySize(this.iconSize, this.iconSize);
    this.icon.setOrigin(0.5);

    // 리소스 텍스트 (아이콘 오른쪽에 간격 두고)
    const textX = iconX + this.iconSize / 2 + 15; // 아이콘 오른쪽에 15px 간격
    this.resourceText = this.scene.add.text(textX, 0, "0/10", {
      fontFamily: "Germania One",
      fontSize: "48px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.resourceText.setOrigin(0, 0.5);

    this.container.add([
      this.shadowGraphics,
      this.bgGraphics,
      this.fillGraphics,
      this.borderGraphics,
      this.icon,
      this.resourceText,
    ]);

    // 초기 그리기
    this.draw();
    this.updateResource(0);
  }

  private draw(): void {
    // 배경 (0x292242)
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(0x292242, 1);
    this.bgGraphics.fillRoundedRect(
      0,
      -this.sliderHeight / 2,
      this.sliderWidth,
      this.sliderHeight,
      this.borderRadius
    );

    // 내부 그림자 (바 안에)
    this.shadowGraphics.clear();
    // 위쪽 내부 그림자 (그라데이션 효과)
    this.shadowGraphics.fillStyle(0x000000, 0.2);
    this.shadowGraphics.fillRect(
      2,
      -this.sliderHeight / 2 + 2,
      this.sliderWidth - 4,
      6
    );

    // 아래쪽 내부 그림자 (그라데이션 효과)
    this.shadowGraphics.fillStyle(0x000000, 0.3);
    this.shadowGraphics.fillRect(
      2,
      this.sliderHeight / 2 - 8,
      this.sliderWidth - 4,
      6
    );

    // 테두리 (찐한 퍼플)
    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(2, 0x6a1b9a, 1);
    this.borderGraphics.strokeRoundedRect(
      0,
      -this.sliderHeight / 2,
      this.sliderWidth,
      this.sliderHeight,
      this.borderRadius
    );
  }

  private drawFill(progress: number): void {
    this.fillGraphics.clear();

    if (progress <= 0) return;

    // Fill 색상 (보라색)
    this.fillGraphics.fillStyle(0x9b59b6, 1);

    // 전체 너비에 대해 프로그래스 표시 (아이콘 영역 포함)
    const fillWidth = this.sliderWidth * progress;
    const fillY = -this.sliderHeight / 2;

    // Fill을 그릴 때 왼쪽 모서리는 둥글게, 오른쪽은 직각
    if (fillWidth > this.borderRadius) {
      // 왼쪽 둥근 모서리를 위한 경로
      this.fillGraphics.beginPath();

      // 왼쪽 위 모서리 (원호)
      this.fillGraphics.arc(
        this.borderRadius,
        fillY + this.borderRadius,
        this.borderRadius,
        Math.PI,
        Math.PI * 1.5,
        false
      );

      // 위쪽 직선
      this.fillGraphics.lineTo(fillWidth, fillY);

      // 오른쪽 위 모서리 (직각)
      this.fillGraphics.lineTo(fillWidth, fillY + this.sliderHeight);

      // 아래쪽 직선
      this.fillGraphics.lineTo(this.borderRadius, fillY + this.sliderHeight);

      // 왼쪽 아래 모서리 (원호)
      this.fillGraphics.arc(
        this.borderRadius,
        fillY + this.sliderHeight - this.borderRadius,
        this.borderRadius,
        Math.PI * 0.5,
        Math.PI,
        false
      );

      // 왼쪽 직선
      this.fillGraphics.closePath();
      this.fillGraphics.fillPath();
    } else {
      // 너비가 작으면 그냥 둥근 사각형
      this.fillGraphics.fillRoundedRect(
        0,
        fillY,
        fillWidth,
        this.sliderHeight,
        this.borderRadius
      );
    }
  }

  updateResource(current: number): void {
    this.currentResource = Math.max(0, Math.min(current, this.maxResource));
    const progress = this.currentResource / this.maxResource;

    // 리소스 텍스트 업데이트
    this.resourceText.setText(`${this.currentResource}/${this.maxResource}`);

    // Fill 그리기
    this.drawFill(progress);
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }

  getHeight(): number {
    return this.sliderHeight;
  }
}
