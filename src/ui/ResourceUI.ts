export default class ResourceUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private resourceText: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Graphics;
  private fillBar: Phaser.GameObjects.Graphics;
  private maxResource: number;

  constructor(scene: Phaser.Scene, x: number, y: number, maxResource: number = 10) {
    this.scene = scene;
    this.maxResource = maxResource;

    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRoundedRect(0, 0, 150, 60, 8);
    this.background.lineStyle(2, 0xffd700, 1);
    this.background.strokeRoundedRect(0, 0, 150, 60, 8);

    this.fillBar = this.scene.add.graphics();

    this.resourceText = this.scene.add.text(75, 30, '10 / 10', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    this.resourceText.setOrigin(0.5);

    this.container.add([this.background, this.fillBar, this.resourceText]);
  }

  updateResource(current: number): void {
    this.resourceText.setText(`${current} / ${this.maxResource}`);

    this.fillBar.clear();

    const fillWidth = (current / this.maxResource) * 140;
    const barHeight = 8;
    const barY = 46;

    this.fillBar.fillStyle(0x444444, 1);
    this.fillBar.fillRoundedRect(5, barY, 140, barHeight, 4);

    this.fillBar.fillStyle(0xffd700, 1);
    this.fillBar.fillRoundedRect(5, barY, fillWidth, barHeight, 4);
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
