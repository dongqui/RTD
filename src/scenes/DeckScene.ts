import PlayerDeck from "../PlayerDeck";
import UnitCard from "../ui/UnitCard";
import { CardType } from "../skills/SkillTypes";
import { CARD_WIDTH, CARD_HEIGHT } from "../constants";

const TEXT_Y = 140;
export default class DeckScene extends Phaser.Scene {
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
    const { width } = this.scale.gameSize;

    this.add
      .text(width / 2, 80, "덱 관리", {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const deck = PlayerDeck.getInstance();
    this.add
      .text(
        width / 2,
        TEXT_Y,
        `카드: ${deck.getCardCount()}/${deck.getMaxCards()}`,
        {
          fontSize: "24px",
          color: "#cccccc",
        }
      )
      .setOrigin(0.5);

    this.createBackground();

    this.displayDeckCards();
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

  private displayDeckCards(): void {
    const deck = PlayerDeck.getInstance();
    const cards = deck.getCards();

    const { width } = this.scale.gameSize;
    const cardWidth = CARD_WIDTH;
    const cardHeight = CARD_HEIGHT;
    const padding = 30;
    const startY = TEXT_Y + 200;
    const cardsPerRow = 3;

    cards.forEach((cardData, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const cardsInThisRow = Math.min(
        cards.length - row * cardsPerRow,
        cardsPerRow
      );
      const totalRowWidth =
        cardsInThisRow * cardWidth + (cardsInThisRow - 1) * padding;
      const startX = (width - totalRowWidth) / 2 + cardWidth / 2;

      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      if (cardData.cardType === CardType.UNIT) {
        const card = new UnitCard(this, x, y, {
          type: cardData.type,
          id: cardData.id,
        });
        this.cards.push(card);
      }
    });
  }
}
