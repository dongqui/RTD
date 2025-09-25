import { BaseMonster, MonsterConfig } from "./BaseMonster";

export class BasicMonster extends BaseMonster {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: MonsterConfig = {
      health: 100,
      speed: 50,
      reward: 10,
      textureKey: "warrior_run",
      scale: 0.4,
    };

    super(scene, x, y, config);
    this.setupAnimation();
  }

  private setupAnimation(): void {
    if (!this.scene.anims.exists("warrior_run")) {
      this.scene.anims.create({
        key: "warrior_run",
        frames: this.scene.anims.generateFrameNumbers("warrior_run", {
          start: 0,
          end: 5,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.sprite.play("warrior_run");
  }
}
