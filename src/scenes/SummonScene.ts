import PlayerDeck, { CardData } from "../PlayerDeck";
import { Button } from "../ui/Button";
import { StyledText } from "../ui/StyledText";
import Card from "../ui/Card";
import { CardDrawManager, CardOption } from "../managers/CardDrawManager";
import { ConfirmModal } from "../ui/ConfirmModal";
import { CardCelebrationUI } from "../ui/CardCelebrationUI";

export default class SummonScene extends Phaser.Scene {
  private deck!: PlayerDeck;
  private glitterParticles: Phaser.GameObjects.Image[] = [];
  private glitterContainer!: Phaser.GameObjects.Container;
  private cardOptions: CardOption[] = [];
  private cardInstances: Card[] = [];
  private selectedCard: CardData | null = null;
  private confirmCardModal?: ConfirmModal;
  private confirmSkipModal?: ConfirmModal;
  private celebrationUI?: CardCelebrationUI;
  private cardsContainer?: Phaser.GameObjects.Container;
  private skipButton?: Button;
  private titleText?: StyledText;
  private summonButton?: Button;
  private summonButtonContainer?: Phaser.GameObjects.Container;

  constructor() {
    super("SummonScene");
  }

  create(data: { deck: PlayerDeck }): void {
    this.deck = data.deck;

    this.createBackground();
    this.createTitle();
    this.createGlitterEffect();
    this.createSummonButtons();

    // Create modals
    this.confirmCardModal = new ConfirmModal(this, {
      message: "이 카드를 선택하시겠습니까?",
      onConfirm: () => this.handleCardConfirm(),
      onCancel: () => {},
    });
    this.confirmSkipModal = new ConfirmModal(this, {
      message: "카드 선택을 건너뛰시겠습니까?",
      onConfirm: () => this.handleSkipConfirm(),
      onCancel: () => {},
    });
    this.celebrationUI = new CardCelebrationUI(this);
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

  private createTitle(): void {
    const { width, height } = this.scale.gameSize;

    this.titleText = new StyledText(this, width / 2, height * 0.15, {
      text: "새로운 카드를 획득해 보세요!",
      fontSize: "36px",
      color: "#ffffff",
    });
    this.titleText.setOrigin(0.5);
  }

  private createGlitterEffect(): void {
    const { width, height } = this.scale.gameSize;

    this.glitterContainer = this.add.container(width / 2, height / 2);

    // Create subtle glitter particles
    const glitterKeys = ["glitter_1", "glitter_2", "glitter_3", "glitter_4"];

    for (let i = 0; i < 8; i++) {
      const key = Phaser.Utils.Array.GetRandom(glitterKeys);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 100 + Math.random() * 50;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const glitter = this.add
        .image(x, y, key)
        .setScale(0.3 + Math.random() * 0.2)
        .setAlpha(0);

      this.glitterContainer.add(glitter);
      this.glitterParticles.push(glitter);

      // Subtle idle animation
      this.tweens.add({
        targets: glitter,
        alpha: 0.3 + Math.random() * 0.2,
        scale: glitter.scale * 1.2,
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });

      // Gentle rotation
      this.tweens.add({
        targets: glitter,
        angle: 360,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
      });
    }
  }

  private createSummonButtons(): void {
    const { width, height } = this.scale.gameSize;

    const buttonY = height * 0.8;

    // Create container for button and icons
    this.summonButtonContainer = this.add.container(width / 2, buttonY);

    // Single 100 Diamond - 1 Card Button
    this.summonButton = new Button(this, 0, 0, {
      text: "",
      width: 280,
      height: 90,
      color: "sky",

      onClick: () => this.onSummonClicked(1, 100),
    });

    // Add diamond icon inside button (left side)
    const diamondIcon = this.add.image(-40, -5, "icon_diamond").setScale(0.8);

    // Add cost text next to diamond icon (inside button)
    const costText = new StyledText(this, 5, -5, {
      text: "100개",
      fontSize: "32px",

      color: "#ffffff",
    });
    costText.setOrigin(0, 0.5);

    this.summonButtonContainer.add([this.summonButton, diamondIcon, costText]);
  }

  private onSummonClicked(_count: number, _cost: number): void {
    // TODO: Check if player has enough diamonds
    // For now, proceed with summoning

    // Hide UI elements
    if (this.titleText) {
      this.titleText.setVisible(false);
    }
    if (this.summonButtonContainer) {
      this.summonButtonContainer.setVisible(false);
    }

    // Hide HeaderScene and NavigationScene
    const headerScene = this.scene.get("HeaderScene");
    if (headerScene) {
      headerScene.scene.setVisible(false);
    }
    this.game.events.emit("hideNavigation");

    // Burst glitter effect
    this.burstGlitterEffect();

    // Generate cards (increased delay to 2500ms to wait for animation)
    this.time.delayedCall(2500, () => {
      this.showCards();
    });
  }

  private burstGlitterEffect(): void {
    const { width, height } = this.scale.gameSize;

    // Create many glitter particles for burst effect (increased to 50)
    const glitterKeys = ["glitter_1", "glitter_2", "glitter_3", "glitter_4"];

    for (let i = 0; i < 50; i++) {
      const key = Phaser.Utils.Array.GetRandom(glitterKeys);
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 300; // Increased distance range

      const glitter = this.add
        .image(width / 2, height / 2, key)
        .setScale(0.4 + Math.random() * 0.4)
        .setAlpha(0);

      const targetX = width / 2 + Math.cos(angle) * distance;
      const targetY = height / 2 + Math.sin(angle) * distance;

      this.tweens.add({
        targets: glitter,
        x: targetX,
        y: targetY,
        alpha: 1,
        scale: glitter.scale * 2,
        angle: 360 * (Math.random() > 0.5 ? 1 : -1),
        duration: 2000, // Increased from 800ms to 2000ms
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: glitter,
            alpha: 0,
            scale: 0,
            duration: 800, // Increased fade out from 300ms to 800ms
            onComplete: () => glitter.destroy(),
          });
        },
      });
    }
  }

  private showCards(): void {
    const { width, height } = this.scale.gameSize;

    // Generate card options (but we'll show 3 at a time for selection)
    this.cardOptions = CardDrawManager.generateCardOptions(3);
    this.cardInstances = [];

    // Create cards container
    this.cardsContainer = this.add.container(width / 2, height / 2);

    // Subtitle (improved readability)
    const subtitle = new StyledText(this, 0, -200, {
      text: "카드를 선택하세요 (1장)",
      fontSize: "24px",
      color: "#ffffff",
    });
    this.cardsContainer.add(subtitle);

    // Create Card instances
    const cardSpacing = 40;
    const cardCount = 3;
    const totalWidth = cardCount * 150 + (cardCount - 1) * cardSpacing;
    const startX = -totalWidth / 2 + 75;

    this.cardOptions.forEach((option, index) => {
      const x = startX + index * (150 + cardSpacing);
      const cardConfig = CardDrawManager.cardDataToConfig(option);
      const card = new Card(this, x, 0, cardConfig);

      (card as any).originalCardData = option;

      const hitArea = new Phaser.Geom.Rectangle(-75, -125, 150, 250);
      card.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, true);

      card.on("pointerover", () => {
        this.tweens.add({
          targets: card,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
        });
      });

      card.on("pointerout", () => {
        this.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      });

      card.on("pointerdown", () => {
        this.onCardSelected(option);
      });

      this.cardsContainer!.add(card);
      this.cardInstances.push(card);

      // Entrance animation
      card.setAlpha(0);
      card.setScale(0.5);
      this.tweens.add({
        targets: card,
        alpha: 1,
        scale: 1,
        duration: 300,
        delay: 100 * index,
        ease: "Back.easeOut",
      });
    });

    // Skip button
    this.skipButton = new Button(this, 0, 200, {
      text: "스킵",
      width: 200,
      height: 80,
      color: "yellow",
      textStyle: {
        fontSize: "28px",
        fontFamily: "Germania One",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      },
      onClick: () => {
        this.onSkipClicked();
      },
    });
    this.cardsContainer.add(this.skipButton);
  }

  private onCardSelected(card: CardData): void {
    this.selectedCard = card;
    this.confirmCardModal!.show();
  }

  private onSkipClicked(): void {
    this.selectedCard = null;
    this.confirmSkipModal!.show();
  }

  private handleCardConfirm(): void {
    if (this.selectedCard) {
      const added = this.deck.addCard(this.selectedCard);
      if (added) {
        const selectedCardInstance = this.cardInstances.find(
          (card) => (card as any).originalCardData === this.selectedCard
        );

        if (selectedCardInstance) {
          this.hideCards();
          this.celebrationUI!.show(selectedCardInstance, () => {
            this.returnToMainScene();
          });
        } else {
          console.warn(
            "Selected card instance not found, proceeding without celebration"
          );
          this.hideCards();
          this.returnToMainScene();
        }
      }
    }
  }

  private handleSkipConfirm(): void {
    // Skip - no card selected
    this.hideCards();
    this.returnToMainScene();
  }

  private hideCards(): void {
    if (this.cardsContainer) {
      this.tweens.add({
        targets: this.cardsContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.cardsContainer!.destroy();
        },
      });
    }
  }

  private returnToMainScene(): void {
    // Show HeaderScene and NavigationScene again
    const headerScene = this.scene.get("HeaderScene");
    if (headerScene) {
      headerScene.scene.setVisible(true);
    }
    this.game.events.emit("showNavigation");

    // Return to previous scene or main menu
    this.scene.start("Game");
  }
}
