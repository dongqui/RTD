import Phaser from "phaser";
import Card from "./Card";
import { StyledText } from "./StyledText";

export class CardCelebrationUI extends Phaser.GameObjects.Container {
  private scene: Phaser.Scene;
  private overlay: Phaser.GameObjects.Rectangle;
  private card: Card;
  private effectLight: Phaser.GameObjects.Image;
  private effectGlowCircle: Phaser.GameObjects.Image;
  private continueText: Phaser.GameObjects.Text;
  private onContinueCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setDepth(11000); // Higher than modal (10000)
    this.scene.add.existing(this);
    this.setVisible(false);
  }

  public show(card: Card, onContinue: () => void): void {
    this.onContinueCallback = onContinue;
    this.clearContent();
    this.createContent(card);
    this.setVisible(true);
    this.playEntranceAnimation();
  }

  private clearContent(): void {
    this.removeAll(true);
  }

  private createContent(originalCard: Card): void {
    const { width: sceneWidth, height: sceneHeight } =
      this.scene.cameras.main;

    // Full-screen dim overlay
    this.overlay = this.scene.add
      .rectangle(0, 0, sceneWidth, sceneHeight, 0x000000, 0.9)
      .setOrigin(0, 0)
      .setInteractive();
    this.add(this.overlay);

    // Center position
    const centerX = sceneWidth / 2;
    const centerY = sceneHeight / 2;

    // Halo effect layer 1: effect_light
    this.effectLight = this.scene.add
      .image(centerX, centerY, "effect_light")
      .setOrigin(0.5)
      .setScale(2.5)
      .setTint(0xf2bf18) // RGB(242, 191, 24)
      .setAlpha(0.4); // Alpha 102/255 ≈ 0.4
    this.add(this.effectLight);

    // Halo effect layer 2: effect_glow_circle (overlapped)
    this.effectGlowCircle = this.scene.add
      .image(centerX, centerY, "effect_glow_circle")
      .setOrigin(0.5)
      .setScale(2.0)
      .setTint(0xf2bf18) // RGB(242, 191, 24)
      .setAlpha(0.4);
    this.add(this.effectGlowCircle);

    // Selected card (create new instance with same config)
    this.card = new Card(this.scene, centerX, centerY - 50, originalCard.cardData);
    this.card.setScale(1.5); // Enlarged
    this.add(this.card);

    // Continue text at bottom
    this.continueText = new StyledText(this.scene, centerX, sceneHeight - 100, {
      text: "클릭하여 계속",
      fontSize: "24px",
    });
    this.continueText.setAlpha(0);
    this.add(this.continueText);

    // Make entire overlay clickable to continue
    this.overlay.on("pointerdown", () => {
      this.hide();
    });
  }

  private playEntranceAnimation(): void {
    // Fade in overlay
    this.overlay.setAlpha(0);
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0.9,
      duration: 300,
      ease: "Power2",
    });

    // Scale and fade in card
    this.card.setScale(0);
    this.card.setAlpha(0);
    this.scene.tweens.add({
      targets: this.card,
      scale: 1.5,
      alpha: 1,
      duration: 500,
      delay: 200,
      ease: "Back.easeOut",
    });

    // Fade in and pulse halo effects
    this.effectLight.setAlpha(0);
    this.effectGlowCircle.setAlpha(0);
    this.scene.tweens.add({
      targets: [this.effectLight, this.effectGlowCircle],
      alpha: 0.4,
      duration: 500,
      delay: 200,
      ease: "Power2",
    });

    // Continuous rotation animation for halo
    this.scene.tweens.add({
      targets: this.effectLight,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: "Linear",
    });

    this.scene.tweens.add({
      targets: this.effectGlowCircle,
      angle: -360,
      duration: 10000,
      repeat: -1,
      ease: "Linear",
    });

    // Pulse animation for continue text
    this.scene.tweens.add({
      targets: this.continueText,
      alpha: 1,
      duration: 500,
      delay: 700,
      ease: "Power2",
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.continueText,
          alpha: 0.6,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      },
    });
  }

  private hide(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.setVisible(false);
        this.setAlpha(1);
        if (this.onContinueCallback) {
          this.onContinueCallback();
        }
      },
    });
  }
}
