export class TowerMergeUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private onConfirmCallback: (() => void) | null = null;
  private onCancelCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(
    towerType: string,
    currentLevel: number,
    nextLevel: number,
    onConfirm: () => void,
    onCancel: () => void
  ): void {
    this.onConfirmCallback = onConfirm;
    this.onCancelCallback = onCancel;

    const { width, height } = this.scene.scale.gameSize;
    const isMobile = width < 800 || height < 600;

    const overlay = this.scene.add
      .rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(10000)
      .setInteractive();

    const dialogWidth = isMobile ? width * 0.8 : 400;
    const dialogHeight = isMobile ? height * 0.4 : 250;

    const dialogBg = this.scene.add
      .rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0x2c3e50)
      .setScrollFactor(0)
      .setDepth(10001)
      .setStrokeStyle(4, 0xecf0f1);

    const towerTypeText = this.getTowerTypeKorean(towerType);
    const messageText = this.scene.add
      .text(
        width / 2,
        height / 2 - (isMobile ? 40 : 50),
        `${towerTypeText} 타워를 합치시겠습니까?\nLv.${currentLevel} + Lv.${currentLevel} → Lv.${nextLevel}`,
        {
          fontSize: isMobile ? "20px" : "24px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: dialogWidth - 40 },
        }
      )
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(10002);

    const buttonY = height / 2 + (isMobile ? 50 : 60);
    const buttonSpacing = isMobile ? 100 : 120;
    const buttonWidth = isMobile ? 120 : 140;
    const buttonHeight = isMobile ? 50 : 44;
    const fontSize = isMobile ? "22px" : "20px";

    const confirmButton = this.scene.add
      .rectangle(
        width / 2 - buttonSpacing / 2,
        buttonY,
        buttonWidth,
        buttonHeight,
        0x27ae60
      )
      .setScrollFactor(0)
      .setDepth(10002)
      .setInteractive({ useHandCursor: true });

    const confirmText = this.scene.add
      .text(width / 2 - buttonSpacing / 2, buttonY, "확인", {
        fontSize: fontSize,
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(10003);

    const cancelButton = this.scene.add
      .rectangle(
        width / 2 + buttonSpacing / 2,
        buttonY,
        buttonWidth,
        buttonHeight,
        0xe74c3c
      )
      .setScrollFactor(0)
      .setDepth(10002)
      .setInteractive({ useHandCursor: true });

    const cancelText = this.scene.add
      .text(width / 2 + buttonSpacing / 2, buttonY, "취소", {
        fontSize: fontSize,
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(10003);

    confirmButton.on("pointerover", () => {
      confirmButton.setFillStyle(0x229954);
    });
    confirmButton.on("pointerout", () => {
      confirmButton.setFillStyle(0x27ae60);
    });
    confirmButton.on("pointerdown", () => {
      this.handleConfirm();
    });

    cancelButton.on("pointerover", () => {
      cancelButton.setFillStyle(0xc0392b);
    });
    cancelButton.on("pointerout", () => {
      cancelButton.setFillStyle(0xe74c3c);
    });
    cancelButton.on("pointerdown", () => {
      this.handleCancel();
    });

    this.container = this.scene.add.container(0, 0, [
      overlay,
      dialogBg,
      messageText,
      confirmButton,
      confirmText,
      cancelButton,
      cancelText,
    ]);
  }

  hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.onConfirmCallback = null;
    this.onCancelCallback = null;
  }

  private handleConfirm(): void {
    if (this.onConfirmCallback) {
      this.onConfirmCallback();
    }
    this.hide();
  }

  private handleCancel(): void {
    if (this.onCancelCallback) {
      this.onCancelCallback();
    }
    this.hide();
  }

  private getTowerTypeKorean(towerType: string): string {
    const typeMap: { [key: string]: string } = {
      arrow: "화살",
      cannon: "대포",
      frost: "냉기",
    };
    return typeMap[towerType] || towerType;
  }
}
