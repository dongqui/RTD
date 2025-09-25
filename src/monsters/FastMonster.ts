import { BaseMonster, MonsterConfig } from "./BaseMonster";

export class FastMonster extends BaseMonster {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: MonsterConfig = {
      health: 60,
      speed: 90,
      reward: 15,
      textureKey: "castle",
      scale: 0.5, // 64px 타일에 맞춰 크기 증가
    };

    super(scene, x, y, config);
    this.sprite.setTint(0x00ff00);
  }
}
