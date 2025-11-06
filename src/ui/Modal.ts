import Phaser from "phaser";
import { StyledText } from "./StyledText";

export interface ModalConfig {
  title?: string;
  width?: number;
  height?: number;
  backgroundColor?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  message?: string;
}

export class Modal extends Phaser.GameObjects.Container {
  public scene: Phaser.Scene;
  protected overlay: Phaser.GameObjects.Rectangle;
  protected panel: Phaser.GameObjects.Container;
  protected background: Phaser.GameObjects.NineSlice;
  protected border: Phaser.GameObjects.NineSlice;
  protected innerBorder: Phaser.GameObjects.NineSlice;
  protected decoLine?: Phaser.GameObjects.NineSlice;
  protected deco?: Phaser.GameObjects.Image;
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

    this.background = this.scene.add
      .nineslice(
        0,
        0,
        "popup_box_bg",
        undefined,
        panelWidth,
        panelHeight,
        63,
        65,
        65,
        66
      )
      .setOrigin(0.5)
      .setTint(0x2b2242);
    this.panel.add(this.background);

    this.border = this.scene.add
      .nineslice(
        0,
        0,
        "popup_box_border",
        undefined,
        panelWidth,
        panelHeight,
        63,
        65,
        66,
        65
      )
      .setOrigin(0.5)
      .setTint(0x1c112f);
    this.panel.add(this.border);

    this.innerBorder = this.scene.add
      .nineslice(
        0,
        0,
        "popup_box_inner_border",
        undefined,
        panelWidth - 20,
        panelHeight - 20,
        60,
        60,
        59,
        60
      )
      .setOrigin(0.5)
      .setTint(0x42365f);
    this.panel.add(this.innerBorder);

    this.decoLine = this.scene.add
      .nineslice(
        0,
        -panelHeight / 2 + 90,
        "popup_box_deco_line",
        undefined,
        panelWidth - 80,
        40,
        23,
        23,
        0,
        0
      )
      .setOrigin(0.5)
      .setTint(0x514274);
    this.panel.add(this.decoLine);

    if (this.config.title) {
      this.createTitle(this.config.title, panelWidth, panelHeight);
    }

    // Content container for child components to use
    const contentY = 0;
    this.contentContainer = this.scene.add.container(0, contentY);
    this.panel.add(this.contentContainer);

    // Close button if requested
    if (this.config.showCloseButton && this.config.onClose) {
      this.createCloseButton(panelWidth, panelHeight);
    }
  }

  private createTitle(
    title: string,
    _panelWidth: number,
    panelHeight: number
  ): void {
    // Simple title text (no ribbon)
    this.titleText = new StyledText(this.scene, 0, -panelHeight / 2 + 55, {
      text: title,
      fontSize: "28px",
    });
    this.panel.add(this.titleText);
  }

  private createCloseButton(panelWidth: number, panelHeight: number): void {
    const btnX = panelWidth / 2 - 30;
    const btnY = -panelHeight / 2 + 30;

    // Container for button and icon
    const closeBtnContainer = this.scene.add.container(btnX, btnY);

    // Red circle button background
    const closeBtn = this.scene.add
      .image(0, 0, "button_close_red")
      .setOrigin(0.5)
      .setScale(0.8);

    //Close icon in the center
    const closeIcon = this.scene.add
      .image(0, 0, "icon_close")
      .setOrigin(0.5)
      .setScale(0.5);

    closeBtnContainer.add([closeBtn, closeIcon]);
    closeBtnContainer.setSize(closeBtn.width * 0.8, closeBtn.height * 0.8);
    closeBtnContainer
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        closeBtnContainer.setScale(1.05);
      })
      .on("pointerout", () => {
        closeBtnContainer.setScale(1);
      })
      .on("pointerdown", () => {
        closeBtnContainer.setScale(0.95);
      })
      .on("pointerup", () => {
        closeBtnContainer.setScale(1.05);
        if (this.config.onClose) {
          this.config.onClose();
        }
      });

    this.panel.add(closeBtnContainer);
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
