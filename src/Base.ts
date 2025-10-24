export enum BaseTeam {
  PLAYER = "player",
  ENEMY = "enemy",
}

export default class Base {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private team: BaseTeam;
  private maxHealth: number;
  private currentHealth: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private isDestroyed: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    team: BaseTeam,
    maxHealth: number = 100
  ) {
    this.scene = scene;
    this.team = team;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;

    this.sprite = this.scene.add.sprite(x, y, "castle");
    this.sprite.setScale(0.5);
    this.sprite.setDepth(0);

    if (team === BaseTeam.ENEMY) {
      this.sprite.setFlipX(true);
    }

    this.healthBarBg = this.scene.add.graphics();
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  private updateHealthBar(): void {
    const barWidth = 100;
    const barHeight = 8;
    const barX = this.sprite.x - barWidth / 2;
    const barY = this.sprite.y - this.sprite.displayHeight / 2 - 20;

    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(0x000000, 0.5);
    this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);

    this.healthBar.clear();
    const healthPercent = this.currentHealth / this.maxHealth;
    const currentBarWidth = barWidth * healthPercent;

    const color = this.team === BaseTeam.PLAYER ? 0x00ff00 : 0xff0000;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(barX, barY, currentBarWidth, barHeight);

    this.healthBarBg.setDepth(1000);
    this.healthBar.setDepth(1001);
  }

  takeDamage(damage: number): void {
    if (this.isDestroyed) return;

    this.currentHealth -= damage;
    this.updateHealthBar();

    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite) {
        this.sprite.clearTint();
      }
    });

    if (this.currentHealth <= 0) {
      this.destroy();
    }
  }

  private destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.currentHealth = 0;
    this.updateHealthBar();

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y + 50,
      duration: 1000,
      onComplete: () => {
        if (this.team === BaseTeam.PLAYER) {
          this.scene.events.emit("game-over");
        } else {
          this.scene.events.emit("game-clear");
        }
      },
    });
  }

  getX(): number {
    return this.sprite.x;
  }

  getY(): number {
    return this.sprite.y;
  }

  getTeam(): BaseTeam {
    return this.team;
  }

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  isActive(): boolean {
    return !this.isDestroyed;
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }
}
