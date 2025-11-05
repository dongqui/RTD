export class WaveUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  private waveText!: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;
  private startButtonText!: Phaser.GameObjects.Text;
  private startButtonBg!: Phaser.GameObjects.Rectangle;

  private currentWave: number = 0;
  private totalWaves: number = 15;
  private enemiesRemaining: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(100);

    this.createUI();
  }

  private createUI(): void {
    this.waveText = this.scene.add
      .text(0, 0, "Wave 0 / 15", {
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.enemiesText = this.scene.add
      .text(0, 50, "Enemies: 0", {
        fontSize: "24px",
        color: "#ffcccc",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.startButtonBg = this.scene.add
      .rectangle(0, 120, 200, 60, 0x44aa44)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(4, 0xffffff);

    this.startButtonText = this.scene.add
      .text(0, 120, "Start Wave", {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.startButton = this.scene.add.container(0, 0, [
      this.startButtonBg,
      this.startButtonText,
    ]);

    this.startButtonBg.on("pointerover", () => {
      this.startButtonBg.setFillStyle(0x55cc55);
    });

    this.startButtonBg.on("pointerout", () => {
      this.startButtonBg.setFillStyle(0x44aa44);
    });

    this.startButtonBg.on("pointerdown", () => {
      this.scene.events.emit("wave-start-button-clicked");
    });

    this.container.add([this.waveText, this.enemiesText, this.startButton]);

    this.hideStartButton();
  }

  updateWave(current: number, total: number): void {
    this.currentWave = current;
    this.totalWaves = total;
    this.waveText.setText(`Wave ${current} / ${total}`);
  }

  updateEnemies(remaining: number): void {
    this.enemiesRemaining = remaining;
    this.enemiesText.setText(`Enemies: ${remaining}`);
  }

  showStartButton(): void {
    this.startButton.setVisible(true);
  }

  hideStartButton(): void {
    this.startButton.setVisible(false);
  }

  showWaveStartAnimation(waveNumber: number): void {
    const banner = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        `Wave ${waveNumber}`,
        {
          fontSize: "64px",
          fontStyle: "bold",
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 8,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(200);

    this.scene.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1.2,
      duration: 500,
      ease: "Back.easeOut",
      yoyo: true,
      onComplete: () => {
        banner.destroy();
      },
    });
  }

  showWaveCompletedAnimation(waveNumber: number): void {
    const banner = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        `Wave ${waveNumber} Completed!`,
        {
          fontSize: "48px",
          fontStyle: "bold",
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(200);

    this.scene.tweens.add({
      targets: banner,
      alpha: 1,
      y: this.scene.scale.height / 2 - 50,
      duration: 800,
      ease: "Bounce.easeOut",
      hold: 1000,
      onComplete: () => {
        this.scene.tweens.add({
          targets: banner,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            banner.destroy();
          },
        });
      },
    });
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
