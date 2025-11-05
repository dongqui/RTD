import PlayerDeck, { CardData } from "../PlayerDeck";
import { Modal } from "./Modal";
import Card from "./Card";
import { ConfirmModal } from "./ConfirmModal";
import { CardCelebrationUI } from "./CardCelebrationUI";
import { Button } from "./Button";
import { StyledText } from "./StyledText";
import { CardDrawManager, CardOption } from "../managers/CardDrawManager";

export class RewardCardUI extends Modal {
  private onSelectCallback: ((card: CardData | null) => void) | null = null;
  private cardOptions: CardOption[] = [];
  private deck: PlayerDeck;
  private cardInstances: Card[] = [];
  private confirmModal?: ConfirmModal;
  private celebrationUI?: CardCelebrationUI;
  private selectedCard: CardData | null = null;
  private titleRibbon?: Phaser.GameObjects.NineSlice;

  constructor(scene: Phaser.Scene, deck: PlayerDeck) {
    const { width } = scene.cameras.main;
    super(scene, {
      // No title in base Modal, we'll add custom ribbon
      width: Math.min(width * 0.9, 900),
      height: 550,
      backgroundColor: 0x261c3c,
    });

    this.deck = deck;
    this.createTitleRibbon();
    this.confirmModal = new ConfirmModal(scene, {
      message: "정말 진행하시겠습니까?",
      onConfirm: () => this.handleConfirm(),
      onCancel: () => {},
    });
    this.celebrationUI = new CardCelebrationUI(scene);
    this.setVisible(false);
  }

  private createTitleRibbon(): void {
    const panelWidth = this.config.width!;
    const panelHeight = this.config.height!;

    // Access the panel container from Modal
    const panel = (this as any).panel as Phaser.GameObjects.Container;

    // Nine-slice ribbon background
    this.titleRibbon = this.scene.add
      .nineslice(
        0,
        -panelHeight / 2 + 30,
        "title_ribbon_purple",
        undefined,
        panelWidth - 40,
        60,
        108,
        108,
        0,
        0
      )
      .setOrigin(0.5);
    panel.add(this.titleRibbon);

    // Title text on top of ribbon
    const titleText = new StyledText(this.scene, 0, -panelHeight / 2 + 30, {
      text: "카드 뽑기",
      fontSize: "28px",
    });
    panel.add(titleText);
  }

  private createContent(): void {
    const container = this.getContentContainer();
    this.cardInstances = [];

    // Subtitle
    const subtitle = new StyledText(this.scene, 0, -180, {
      text: "카드를 선택하세요 (1장)",
      fontSize: "20px",
      color: "#cccccc",
    });
    container.add(subtitle);

    // Cards container
    const cardsContainer = this.scene.add.container(0, -20);
    container.add(cardsContainer);

    // Create Card instances
    const cardSpacing = 40;
    const cardCount = 3;
    const totalWidth = cardCount * 150 + (cardCount - 1) * cardSpacing;
    const startX = -totalWidth / 2 + 75; // 75 = half of CARD_WIDTH (150)

    this.cardOptions.forEach((option, index) => {
      const x = startX + index * (150 + cardSpacing);
      const cardConfig = CardDrawManager.cardDataToConfig(option);
      const card = new Card(this.scene, x, 0, cardConfig);

      // Store the original CardData for later reference
      (card as any).originalCardData = option;

      // Make the entire card interactive
      const hitArea = new Phaser.Geom.Rectangle(-75, -125, 150, 250);
      card.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, true);

      card.on("pointerover", () => {
        this.scene.tweens.add({
          targets: card,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
        });
      });

      card.on("pointerout", () => {
        this.scene.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      });

      card.on("pointerdown", () => {
        this.onCardSelected(option);
      });

      cardsContainer.add(card);
      this.cardInstances.push(card);

      // Entrance animation
      card.setAlpha(0);
      card.setScale(0.5);
      this.scene.tweens.add({
        targets: card,
        alpha: 1,
        scale: 1,
        duration: 300,
        delay: 100 * index,
        ease: "Back.easeOut",
      });
    });

    // Skip button
    const skipButton = new Button(this.scene, 0, 200, {
      text: "스킵",
      width: 200,
      height: 50,
      color: "yellow",
      textStyle: {
        fontSize: "24px",
      },
      onClick: () => {
        this.onSkipClicked();
      },
    });
    container.add(skipButton);
  }

  private onCardSelected(card: CardData): void {
    this.selectedCard = card;
    this.confirmModal!.show();
  }

  private onSkipClicked(): void {
    this.selectedCard = null;
    this.confirmModal!.show();
  }

  private handleConfirm(): void {
    if (this.selectedCard) {
      // Add card to deck
      const added = this.deck.addCard(this.selectedCard);
      if (added) {
        // Find the Card instance for celebration
        const selectedCardInstance = this.cardInstances.find(
          (card) => (card as any).originalCardData === this.selectedCard
        );

        if (selectedCardInstance) {
          this.hide();
          this.celebrationUI!.show(selectedCardInstance, () => {
            if (this.onSelectCallback) {
              this.onSelectCallback(this.selectedCard!);
            }
          });
        } else {
          // Fallback if card instance not found
          console.warn(
            "Selected card instance not found, proceeding without celebration"
          );
          this.hide();
          if (this.onSelectCallback) {
            this.onSelectCallback(this.selectedCard);
          }
        }
      }
    } else {
      // Skip - no card selected
      this.hide();
      if (this.onSelectCallback) {
        this.onSelectCallback(null);
      }
    }
  }

  public showRewardSelection(onSelect: (card: CardData | null) => void): void {
    if (this.visible) {
      console.warn("RewardCardUI is already visible, skipping show()");
      return;
    }

    this.onSelectCallback = onSelect;
    this.cardOptions = CardDrawManager.generateCardOptions(3);
    this.cardInstances = [];

    // Clear previous content
    const container = this.getContentContainer();
    container.removeAll(true);

    this.createContent();
    super.show();
  }

  public destroy(fromScene?: boolean): void {
    if (this.confirmModal) {
      this.confirmModal.destroy(fromScene);
    }
    if (this.celebrationUI) {
      this.celebrationUI.destroy(fromScene);
    }
    super.destroy(fromScene);
  }
}
