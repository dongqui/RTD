import BottomNavigation from "../ui/BottomNavigation";
import PlayerDeck from "../PlayerDeck";
import UnitCard from "../ui/UnitCard";

export default class DeckScene extends Phaser.Scene {
  private navigation: BottomNavigation;
  private cards: UnitCard[] = [];

  constructor() {
    super("DeckScene");
  }

  preload() {
    this.load.spineJson(
      "fantasy_character",
      "assets/spine/Fantasy Character.json"
    );
    this.load.spineAtlas(
      "fantasy_character-atlas",
      "assets/spine/Fantasy Character.atlas.txt"
    );
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    this.add
      .rectangle(0, 0, width, height, 0x1a1a2e)
      .setOrigin(0, 0);

    this.add
      .text(width / 2, 80, "덱 관리", {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const deck = PlayerDeck.getInstance();
    this.add
      .text(width / 2, 140, `카드: ${deck.getCardCount()}/${deck.getMaxCards()}`, {
        fontSize: "24px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    this.displayDeckCards();

    this.navigation = new BottomNavigation(this);
  }

  private displayDeckCards(): void {
    const deck = PlayerDeck.getInstance();
    const cards = deck.getCards();

    const { width, height } = this.scale.gameSize;
    const cardWidth = 280;
    const cardHeight = 400;
    const padding = 30;
    const startY = 200;
    const cardsPerRow = 3;

    const totalRows = Math.ceil(cards.length / cardsPerRow);
    const scrollableHeight = height - startY - 180;
    const contentHeight = totalRows * (cardHeight + padding);
    const needsScroll = contentHeight > scrollableHeight;

    cards.forEach((cardData, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const totalRowWidth = Math.min(cards.length - row * cardsPerRow, cardsPerRow) * (cardWidth + padding) - padding;
      const startX = (width - totalRowWidth) / 2;

      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);

      const card = new UnitCard(this, x, y, {
        type: cardData.type,
        cost: cardData.cost,
        name: cardData.name,
      });

      this.cards.push(card);
    });

    if (needsScroll) {
      this.add.text(width / 2, height - 170, "스크롤하여 더 보기", {
        fontSize: "24px",
        color: "#888888",
      }).setOrigin(0.5);
    }
  }
}
