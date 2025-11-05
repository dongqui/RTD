import Phaser from "phaser";
import { StyledText } from "./StyledText";

export interface ModalConfig {
  title?: string;
  width?: number;
  height?: number;
  backgroundColor?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export class Modal extends Phaser.GameObjects.Container {
  public scene: Phaser.Scene;
  protected overlay: Phaser.GameObjects.Rectangle;
  protected panel: Phaser.GameObjects.Container;
  protected background: Phaser.GameObjects.Rectangle;
  protected topBorder: Phaser.GameObjects.Rectangle;
  protected bottomBorder: Phaser.GameObjects.Rectangle;
  protected titleText?: Phaser.GameObjects.Text;
  protected contentContainer: Phaser.GameObjects.Container;
  public config: ModalConfig;

  constructor(scene: Phaser.Scene, config: ModalConfig = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.config = {
      width: config.width || 800,
      height: config.height || 500,
      backgroundColor: config.backgroundColor || 0x261c3c,
      showCloseButton: config.showCloseButton ?? false,
      ...config,
    };

    this.setDepth(10000);
    this.createModal();
    this.scene.add.existing(this);
  }

  private createModal(): void {
    const { width: sceneWidth, height: sceneHeight } = this.scene.cameras.main;
    const panelWidth = this.config.width!;
    const panelHeight = this.config.height!;

    // Dim overlay
    this.overlay = this.scene.add
      .rectangle(0, 0, sceneWidth, sceneHeight, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setInteractive();
    this.add(this.overlay);

    // Panel container
    this.panel = this.scene.add.container(sceneWidth / 2, sceneHeight / 2);
    this.add(this.panel);

    // Background
    this.background = this.scene.add
      .rectangle(0, 0, panelWidth, panelHeight, this.config.backgroundColor!)
      .setOrigin(0.5);
    this.panel.add(this.background);

    // Top border (lighter shade)
    const borderColor = 0x3d2f5c;
    const borderHeight = 4;
    this.topBorder = this.scene.add
      .rectangle(
        0,
        -panelHeight / 2 + borderHeight / 2,
        panelWidth,
        borderHeight,
        borderColor
      )
      .setOrigin(0.5);
    this.panel.add(this.topBorder);

    // Bottom border
    this.bottomBorder = this.scene.add
      .rectangle(
        0,
        panelHeight / 2 - borderHeight / 2,
        panelWidth,
        borderHeight,
        borderColor
      )
      .setOrigin(0.5);
    this.panel.add(this.bottomBorder);

    // Title text if title is provided
    if (this.config.title) {
      this.createTitle(this.config.title, panelWidth, panelHeight);
    }

    // Content container for child components to use
    const contentY = this.config.title ? 40 : 0;
    this.contentContainer = this.scene.add.container(0, contentY);
    this.panel.add(this.contentContainer);

    // Close button if requested
    if (this.config.showCloseButton && this.config.onClose) {
      this.createCloseButton(panelWidth, panelHeight);
    }
  }

  private createTitle(title: string, _panelWidth: number, panelHeight: number): void {
    // Simple title text (no ribbon)
    this.titleText = new StyledText(this.scene, 0, -panelHeight / 2 + 40, {
      text: title,
      fontSize: "28px",
    });
    this.panel.add(this.titleText);
  }

  private createCloseButton(panelWidth: number, panelHeight: number): void {
    const closeBtn = this.scene.add
      .text(panelWidth / 2 - 30, -panelHeight / 2 + 30, "✕", {
        fontFamily: "Germania One",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        closeBtn.setColor("#ff5555");
      })
      .on("pointerout", () => {
        closeBtn.setColor("#ffffff");
      })
      .on("pointerdown", () => {
        if (this.config.onClose) {
          this.config.onClose();
        }
      });
    this.panel.add(closeBtn);
  }

  protected getContentContainer(): Phaser.GameObjects.Container {
    return this.contentContainer;
  }

  public show(): void {
    this.setVisible(true);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      ease: "Power2",
    });
  }

  public hide(onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.setVisible(false);
        if (onComplete) onComplete();
      },
    });
  }

  public destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
