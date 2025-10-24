export class HealthBar {
  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private bar: Phaser.GameObjects.Graphics;
  private width: number;
  private height: number;
  private x: number;
  private y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number = 60, height: number = 6) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.background = scene.add.graphics();
    this.bar = scene.add.graphics();

    this.draw(1);
  }

  private draw(percentage: number): void {
    this.background.clear();
    this.bar.clear();

    this.background.fillStyle(0x000000, 0.6);
    this.background.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    const barColor = this.getColorByPercentage(percentage);
    this.bar.fillStyle(barColor);
    const barWidth = Math.max(0, this.width * percentage);
    this.bar.fillRect(this.x - this.width / 2, this.y - this.height / 2, barWidth, this.height);
  }

  private getColorByPercentage(percentage: number): number {
    if (percentage > 0.6) {
      return 0x00ff00;
    } else if (percentage > 0.3) {
      return 0xffaa00;
    } else {
      return 0xff0000;
    }
  }

  update(currentHealth: number, maxHealth: number, x: number, y: number): void {
    const percentage = Math.max(0, Math.min(1, currentHealth / maxHealth));
    this.x = x;
    this.y = y;
    this.draw(percentage);
  }

  setVisible(visible: boolean): void {
    this.background.setVisible(visible);
    this.bar.setVisible(visible);
  }

  destroy(): void {
    this.background.destroy();
    this.bar.destroy();
  }
}
