import PlayerDeck from "../PlayerDeck";
import { Button } from "../ui/Button";

export default class SummonScene extends Phaser.Scene {
  constructor() {
    super("SummonScene");
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    this.createBackground();

    this.add
      .text(width / 2, height * 0.3, "RANDOM DEFENSE", {
        fontSize: "64px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const deck = PlayerDeck.getInstance();
    this.add
      .text(
        width / 2,
        height * 0.45,
        `카드: ${deck.getCardCount()}/${deck.getMaxCards()}`,
        {
          fontSize: "28px",
          color: "#cccccc",
        }
      )
      .setOrigin(0.5);

    new Button(this, width / 2, height * 0.6, {
      text: "Red",
      width: 150,
      height: 80,
      onClick: () => console.log("Button clicked!"),
    });
  }

  private createBackground(): void {
    const { width, height } = this.scale.gameSize;

    const background = this.add
      .image(width / 2, height / 2, "bg_cards")
      .setOrigin(0.5)
      .setDepth(-1);

    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);

    background.setScale(scale);
  }
}
