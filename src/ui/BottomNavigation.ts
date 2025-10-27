export default class BottomNavigation {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private buttons: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
    this.setupResize();
  }

  private create(): void {
    const { width, height } = this.scene.scale.gameSize;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    this.background = this.scene.add.rectangle(
      width / 2,
      height - 75,
      width,
      150,
      0x2a2a3e,
      0.95
    );
    this.background.setStrokeStyle(2, 0x4a4a6e);
    this.container.add(this.background);

    this.createNavigationButtons();
  }

  private createNavigationButtons(): void {
    const { width, height } = this.scene.scale.gameSize;
    const buttonY = height - 75;

    this.buttonData = [
      { key: "home", icon: "🏠", label: "Home", scene: "HomeScene" },
      { key: "game", icon: "⚔️", label: "Game", scene: "GameScene" },
      { key: "deck", icon: "🃏", label: "Deck", scene: "DeckScene" },
    ];

    const columnWidth = width / this.buttonData.length;

    this.buttonData.forEach((buttonData, index) => {
      const x = columnWidth * index + columnWidth / 2;
      const button = this.createButton(x, buttonY, buttonData);
      this.buttons.set(buttonData.key, button);
      this.container.add(button);
    });
  }

  private buttonData: Array<{ key: string; icon: string; label: string; scene: string }> = [];

  private createButton(
    x: number,
    y: number,
    data: { key: string; icon: string; label: string; scene: string }
  ): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);
    const { width } = this.scene.scale.gameSize;
    const columnWidth = width / 3;

    const buttonBg = this.scene.add.rectangle(
      0,
      0,
      columnWidth,
      150,
      0x5a5a7e,
      1
    );
    buttonBg.setStrokeStyle(1, 0x4a4a6e);

    const iconText = this.scene.add.text(0, -25, data.icon, {
      fontSize: "56px",
    });
    iconText.setOrigin(0.5);

    const labelText = this.scene.add.text(0, 35, data.label, {
      fontSize: "24px",
      color: "#e0e0e0",
      fontFamily: "Arial",
      fontStyle: "bold",
    });
    labelText.setOrigin(0.5);

    buttonContainer.add([buttonBg, iconText, labelText]);

    buttonBg.setInteractive({ useHandCursor: true });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x6a6a8e);
      iconText.setScale(1.1);
      labelText.setScale(1.05);
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x5a5a7e);
      iconText.setScale(1);
      labelText.setScale(1);
    });

    buttonBg.on("pointerdown", () => {
      buttonBg.setFillStyle(0x4a4a6e);
      iconText.setScale(0.95);
      labelText.setScale(0.95);
    });

    buttonBg.on("pointerup", () => {
      buttonBg.setFillStyle(0x6a6a8e);
      iconText.setScale(1.1);
      labelText.setScale(1.05);

      if (this.scene.scene.key !== data.scene) {
        this.scene.scene.start(data.scene);
      }
    });

    return buttonContainer;
  }

  private setupResize(): void {
    this.scene.scale.on("resize", this.handleResize, this);
  }

  private handleResize(): void {
    const { width, height } = this.scene.scale.gameSize;

    this.background.setPosition(width / 2, height - 75);
    this.background.setSize(width, 150);

    const buttonY = height - 75;
    const buttons = Array.from(this.buttons.values());
    const columnWidth = width / buttons.length;

    buttons.forEach((button, index) => {
      const x = columnWidth * index + columnWidth / 2;
      button.setPosition(x, buttonY);

      const buttonBg = button.getAt(0) as Phaser.GameObjects.Rectangle;
      if (buttonBg) {
        buttonBg.setSize(columnWidth, 150);
      }
    });
  }

  hide(): void {
    this.container.setVisible(false);
  }

  show(): void {
    this.container.setVisible(true);
  }

  destroy(): void {
    this.scene.scale.off("resize", this.handleResize, this);
    this.container.destroy();
  }
}
