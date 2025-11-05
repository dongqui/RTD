export type ButtonColor = "red" | "sky" | "yellow";

export interface ButtonConfig {
  text?: string;
  width?: number;
  height?: number;
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  paddingX?: number;
  paddingY?: number;
  onClick?: () => void;
  color?: ButtonColor;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.NineSlice;
  private label: Phaser.GameObjects.Text;
  private paddingX: number;
  private paddingY: number;
  private config: ButtonConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ButtonConfig = {}
  ) {
    super(scene, x, y);

    this.config = config;
    this.paddingX = config.paddingX ?? 40;
    this.paddingY = config.paddingY ?? 20;

    const text = config.text ?? "Button";
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center",
    };

    this.label = scene.add
      .text(0, 0, text, {
        ...defaultStyle,
        ...config.textStyle,
      })
      .setOrigin(0.5, 0.75);

    const textWidth = this.label.width;
    const textHeight = this.label.height;
    const buttonWidth = config.width ?? textWidth + this.paddingX * 2;
    const buttonHeight = config.height ?? textHeight + this.paddingY * 2;

    // Get button texture key based on color
    const buttonColor = config.color ?? "red";
    const buttonTextureKey = `button_${buttonColor}`;

    this.bg = scene.add
      .nineslice(
        0,
        0,
        buttonTextureKey,
        undefined,
        buttonWidth,
        buttonHeight,
        23,
        23,
        26,
        36
      )
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(buttonWidth, buttonHeight);

    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    this.setupInteractions();

    scene.add.existing(this);
  }

  private setupInteractions(): void {
    this.setInteractive({ useHandCursor: true });

    this.on("pointerover", () => {
      this.bg.setTint(0xdddddd);
      this.label.setScale(1.05);
    });

    this.on("pointerout", () => {
      this.bg.clearTint();
      this.label.setScale(1);
    });

    this.on("pointerdown", () => {
      this.bg.setTint(0xaaaaaa);
      this.label.setScale(0.95);
    });

    this.on("pointerup", () => {
      this.bg.clearTint();
      this.label.setScale(1);
      if (this.config.onClick) {
        this.config.onClick();
      }
    });
  }

  setText(text: string): void {
    this.label.setText(text);
    this.updateSize();
  }

  getText(): string {
    return this.label.text;
  }

  setButtonSize(width: number, height: number): void {
    this.bg.setSize(width, height);
    this.setSize(width, height);

    if (this.input) {
      this.input.hitArea.setTo(-width / 2, -height / 2, width, height);
    }
  }

  private updateSize(): void {
    const textWidth = this.label.width;
    const textHeight = this.label.height;
    const newWidth = this.config.width ?? textWidth + this.paddingX * 2;
    const newHeight = this.config.height ?? textHeight + this.paddingY * 2;

    this.setButtonSize(newWidth, newHeight);
  }

  setEnabled(enabled: boolean): void {
    this.setAlpha(enabled ? 1 : 0.5);
    if (enabled) {
      this.setInteractive();
    } else {
      this.disableInteractive();
    }
  }
}
