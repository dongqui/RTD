import PlayerDeck from "../PlayerDeck";
import DeckViewUI from "../ui/DeckViewUI";
import CardDrawUI from "../ui/CardDrawUI";

export default class HomeScene extends Phaser.Scene {
  private deckViewUI: DeckViewUI | null = null;
  private cardDrawUI: CardDrawUI | null = null;

  constructor() {
    super("HomeScene");
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    this.add
      .rectangle(0, 0, width, height, 0x1a1a2e)
      .setOrigin(0, 0);

    this.add
      .text(width / 2, height * 0.25, "RANDOM DEFENSE", {
        fontSize: "64px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const buttonY = height * 0.5;
    const buttonSpacing = 80;

    this.createButton(width / 2, buttonY - buttonSpacing, "게임 시작", () => {
      this.scene.start("GameScene");
    });

    this.createButton(width / 2, buttonY, "덱 관리", () => {
      this.showDeckView();
    });

    this.createButton(width / 2, buttonY + buttonSpacing, "카드 뽑기", () => {
      this.showCardDraw();
    });

    const deck = PlayerDeck.getInstance();
    this.add
      .text(width / 2, height * 0.85, `카드: ${deck.getCardCount()}/${deck.getMaxCards()}`, {
        fontSize: "24px",
        color: "#cccccc",
      })
      .setOrigin(0.5);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): void {
    const buttonWidth = 300;
    const buttonHeight = 60;

    const bg = this.add
      .rectangle(x, y, buttonWidth, buttonHeight, 0x4a4a8a)
      .setInteractive()
      .setStrokeStyle(2, 0x6a6aaa);

    const label = this.add
      .text(x, y, text, {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => {
      bg.setFillStyle(0x5a5a9a);
      this.input.setDefaultCursor("pointer");
    });

    bg.on("pointerout", () => {
      bg.setFillStyle(0x4a4a8a);
      this.input.setDefaultCursor("default");
    });

    bg.on("pointerdown", () => {
      bg.setFillStyle(0x3a3a7a);
    });

    bg.on("pointerup", () => {
      bg.setFillStyle(0x5a5a9a);
      onClick();
    });
  }

  private showDeckView(): void {
    if (this.deckViewUI) {
      this.deckViewUI.destroy();
    }

    this.deckViewUI = new DeckViewUI(this, () => {
      this.deckViewUI = null;
      this.scene.restart();
    });
  }

  private showCardDraw(): void {
    if (this.cardDrawUI) {
      this.cardDrawUI.destroy();
    }

    this.cardDrawUI = new CardDrawUI(this, () => {
      this.cardDrawUI = null;
      this.scene.restart();
    });
  }
}
