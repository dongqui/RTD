import PlayerDeck from "../PlayerDeck";
import UnitCard from "../ui/UnitCard";
import { CardType } from "../skills/SkillTypes";
import { CARD_WIDTH, CARD_HEIGHT } from "../constants";

const GLOBAL_HEADER_HEIGHT = 80; // HeaderScene 높이
const DECK_HEADER_HEIGHT = 120; // DeckScene 헤더 높이
const HEADER_HEIGHT = GLOBAL_HEADER_HEIGHT + DECK_HEADER_HEIGHT; // 총 헤더 높이
export default class DeckScene extends Phaser.Scene {
  private cards: UnitCard[] = [];
  private cardsContainer: Phaser.GameObjects.Container;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private scrollY: number = 0;
  private minScrollY: number = 0;
  private maxScrollY: number = 0;

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
    // 그라데이션 배경 생성
    this.createGradientBackground();

    this.createHeader();

    // 스크롤 가능한 카드 컨테이너 생성
    this.cardsContainer = this.add.container(0, 0);

    this.displayDeckCards();
    this.setupScrolling();
  }

  private createGradientBackground(): void {
    const { width, height } = this.scale.gameSize;

    // 그라데이션 텍스처 생성
    const gradient = this.add.graphics();

    // 상단 색상: #3A2D5A (더 진한 보라)
    // 하단 색상: #1A1530 (훨씬 더 어두운 보라)
    const topColor = Phaser.Display.Color.HexStringToColor("#3A2D5A");
    const bottomColor = Phaser.Display.Color.HexStringToColor("#1A1530");

    // 여러 단계로 나눠서 그라데이션 효과 생성
    const steps = 100;
    for (let i = 0; i < steps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        topColor,
        bottomColor,
        steps,
        i
      );

      gradient.fillStyle(
        Phaser.Display.Color.GetColor(color.r, color.g, color.b),
        1
      );
      gradient.fillRect(0, (height / steps) * i, width, height / steps + 1);
    }

    // 그래픽을 텍스처로 변환하여 이미지로 사용
    gradient.generateTexture("gradient-bg", width, height);
    gradient.destroy();

    // 배경 이미지 추가
    this.add.image(0, 0, "gradient-bg").setOrigin(0, 0).setDepth(-1);
  }

  private createHeader(): void {
    const { width } = this.scale.gameSize;
    const headerY = GLOBAL_HEADER_HEIGHT + DECK_HEADER_HEIGHT / 2;

    this.add
      .rectangle(0, GLOBAL_HEADER_HEIGHT, width, DECK_HEADER_HEIGHT, 0x282340)
      .setOrigin(0, 0)
      .setDepth(10);

    this.add.rectangle(0, GLOBAL_HEADER_HEIGHT, width, 10, 0x302a46).setOrigin(0, 0).setDepth(10);

    this.add
      .rectangle(0, GLOBAL_HEADER_HEIGHT + DECK_HEADER_HEIGHT, width, 10, 0x302a46)
      .setOrigin(0, 0)
      .setDepth(10);

    // 카드 카운트 텍스트
    const deck = PlayerDeck.getInstance();
    this.add
      .text(
        40,
        headerY,
        `내 카드 (${deck.getCardCount()}/${deck.getMaxCards()})`,
        {
          fontSize: "32px",
          color: "#FFFFFF",
          fontFamily: "Germania One",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        }
      )
      .setOrigin(0, 0.5)
      .setDepth(10);
  }

  private displayDeckCards(): void {
    const deck = PlayerDeck.getInstance();
    const cards = deck.getCards();

    const { width, height } = this.scale.gameSize;

    // DeckScene에서 사용할 카드 크기 계산
    const sidePadding = 40;
    const cardSpacing = 20;
    const cardsPerRow = 3;

    // 사용 가능한 너비: 720 - 40 - 40 = 640px
    // 카드 3개 + 간격 2개: (640 - 20 - 20) / 3 = 200px
    const availableWidth = width - sidePadding * 2;
    const scaledCardWidth =
      (availableWidth - cardSpacing * (cardsPerRow - 1)) / cardsPerRow;
    const scale = scaledCardWidth / CARD_WIDTH; // 1.33x
    const scaledCardHeight = CARD_HEIGHT * scale;

    // 헤더 바로 아래부터 시작
    const startY = HEADER_HEIGHT + 40 + scaledCardHeight / 2;
    const startX = sidePadding + scaledCardWidth / 2;

    cards.forEach((cardData, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const x = startX + col * (scaledCardWidth + cardSpacing);
      const y = startY + row * (scaledCardHeight + cardSpacing);

      if (cardData.cardType === CardType.UNIT) {
        const card = new UnitCard(this, x, y, {
          type: cardData.type,
          id: cardData.id,
        });

        // 카드 컨테이너 스케일 적용
        const cardContainer = card["container"];
        cardContainer.setScale(scale);

        // 카드를 스크롤 컨테이너에 추가
        this.cardsContainer.add(cardContainer);

        this.cards.push(card);
      }
    });

    // 스크롤 범위 계산
    const totalRows = Math.ceil(cards.length / cardsPerRow);
    const contentHeight = startY + totalRows * (scaledCardHeight + cardSpacing);

    // 콘텐츠가 화면보다 클 때만 스크롤 가능
    // 하단 네비게이션 공간(180px) 제외
    this.maxScrollY = Math.max(0, contentHeight - height + 180);
    this.minScrollY = 0;
  }

  private setupScrolling(): void {
    let lastPointerY = 0;
    let velocity = 0;
    let initialPointerY = 0;
    const dragThreshold = 10; // 드래그로 인식할 최소 이동 거리

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // 헤더 영역은 스크롤 제외
      if (pointer.y < HEADER_HEIGHT) return;

      initialPointerY = pointer.y;
      lastPointerY = pointer.y;
      velocity = 0;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      if (pointer.y < HEADER_HEIGHT && !this.isDragging) return;

      const moveDistance = Math.abs(pointer.y - initialPointerY);

      // 일정 거리 이상 움직이면 드래그로 인식
      if (moveDistance > dragThreshold) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const deltaY = pointer.y - lastPointerY;
        velocity = deltaY;
        this.scrollY = Phaser.Math.Clamp(
          this.scrollY + deltaY,
          -this.maxScrollY,
          this.minScrollY
        );
        this.cardsContainer.y = this.scrollY;
        lastPointerY = pointer.y;
      }
    });

    this.input.on("pointerup", () => {
      this.isDragging = false;
    });

    // 관성 스크롤 업데이트
    this.events.on("update", () => {
      if (!this.isDragging && Math.abs(velocity) > 0.1) {
        velocity *= 0.95; // 감속
        this.scrollY = Phaser.Math.Clamp(
          this.scrollY + velocity,
          -this.maxScrollY,
          this.minScrollY
        );
        this.cardsContainer.y = this.scrollY;
      }
    });
  }
}
