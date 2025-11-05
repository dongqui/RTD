import Phaser from "phaser";

export interface StyledTextConfig {
  text: string;
  fontSize?: string;
  color?: string;
  stroke?: string;
  strokeThickness?: number;
  fontFamily?: string;
  align?: "left" | "center" | "right";
  wordWrap?: { width: number };
}

export class StyledText extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: StyledTextConfig
  ) {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: config.fontFamily || "Germania One",
      fontSize: config.fontSize || "28px",
      color: config.color || "#ffffff",
      stroke: config.stroke || "#000000",
      strokeThickness: config.strokeThickness ?? 4,
      align: config.align || "center",
      wordWrap: config.wordWrap,
    };

    super(scene, x, y, config.text, style);
    this.setOrigin(0.5);
    scene.add.existing(this);
  }
}
