import { BaseMonster, MonsterConfig } from "./BaseMonster";

export class TankMonster extends BaseMonster {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: MonsterConfig = {
      health: 300,
      speed: 30,
      reward: 25,
      textureKey: "castle",
      scale: 0.8, // 64px 타일에 맞춰 크기 증가
    };

    super(scene, x, y, config);
    this.sprite.setTint(0x800080);
  }
}
