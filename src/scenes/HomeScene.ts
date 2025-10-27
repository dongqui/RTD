import PlayerDeck from "../PlayerDeck";
import BottomNavigation from "../ui/BottomNavigation";

export default class HomeScene extends Phaser.Scene {
  private navigation: BottomNavigation;

  constructor() {
    super("HomeScene");
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    this.add
      .rectangle(0, 0, width, height, 0x1a1a2e)
      .setOrigin(0, 0);

    this.add
      .text(width / 2, height * 0.3, "RANDOM DEFENSE", {
        fontSize: "64px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const deck = PlayerDeck.getInstance();
    this.add
      .text(width / 2, height * 0.45, `카드: ${deck.getCardCount()}/${deck.getMaxCards()}`, {
        fontSize: "28px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    this.navigation = new BottomNavigation(this);
  }
}
