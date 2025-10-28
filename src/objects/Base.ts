export default class Base extends Phaser.GameObjects.Sprite {
  private maxHealth: number = 20;
  private currentHealth: number = 20;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarWidth: number = 100;
  private healthBarHeight: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ""); // 임시로 빈 텍스처

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 베이스 외형 (임시로 원형)
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(0, 0, 40);
    graphics.generateTexture("base-temp", 80, 80);
    graphics.destroy();

    this.setTexture("base-temp");
    this.setScale(1);

    // 물리 바디 설정
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(40);
    body.setImmovable(true);

    // 체력바 배경
    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.5);
    this.healthBarBg.fillRect(
      x - this.healthBarWidth / 2,
      y - 60,
      this.healthBarWidth,
      this.healthBarHeight
    );

    // 체력바
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }

  takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBar();

    // 피격 효과
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.setAlpha(1);
      }
    });

    if (this.currentHealth <= 0) {
      this.onDestroyed();
    }
  }

  private updateHealthBar(): void {
    const healthPercent = this.currentHealth / this.maxHealth;

    this.healthBar.clear();

    // 체력 비율에 따라 색상 변경
    let color = 0x2ecc71; // 녹색
    if (healthPercent < 0.3) {
      color = 0xe74c3c; // 빨강
    } else if (healthPercent < 0.6) {
      color = 0xf39c12; // 주황
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(
      this.x - this.healthBarWidth / 2,
      this.y - 60,
      this.healthBarWidth * healthPercent,
      this.healthBarHeight
    );
  }

  private onDestroyed(): void {
    // 게임 오버 처리
    this.scene.events.emit("baseDestroyed");

    // 파괴 효과
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  destroy(fromScene?: boolean): void {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    if (this.healthBarBg) {
      this.healthBarBg.destroy();
    }
    super.destroy(fromScene);
  }
}
