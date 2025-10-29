export interface CardConfig {
  id: string;
  cost: number;
  name: string;
  description?: string;
  icon?: string;
}

export abstract class BaseCard {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected background: Phaser.GameObjects.Graphics;
  protected config: CardConfig;
  protected isEnabled: boolean = true;
  protected onClick: (() => void) | null = null;

  protected nameText!: Phaser.GameObjects.Text;
  protected descText!: Phaser.GameObjects.Text;
  protected costText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CardConfig) {
    this.scene = scene;
    this.config = config;

    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);
    this.container.setSize(112, 168);
    this.container.setScale(0.7);

    this.background = this.scene.add.graphics();

    this.setupInteraction();
  }

  protected abstract renderCard(): void;
  protected abstract getCardColor(): number;

  protected setupInteraction(): void {
    const hitArea = new Phaser.Geom.Rectangle(0, 0, 160, 240);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.container.on(
      "pointerdown",
      (
        _pointer: any,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        if (this.isEnabled && this.onClick) {
          this.onClick();
        }
      }
    );

    this.container.on(
      "pointerup",
      (
        _pointer: any,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
      }
    );

    this.container.on("pointerover", () => {
      if (this.isEnabled) {
        this.scene.input.setDefaultCursor("pointer");
        this.drawCardBackground(true, true);
      }
    });

    this.container.on("pointerout", () => {
      this.scene.input.setDefaultCursor("default");
      this.drawCardBackground(this.isEnabled);
    });
  }

  protected drawCardBackground(enabled: boolean, hover: boolean = false): void {
    this.background.clear();

    const alpha = enabled ? 1 : 0.5;
    const borderColor = hover ? 0xffff44 : 0xffffff;
    const scale = hover ? 0.75 : 0.7;

    this.container.setScale(scale);

    this.background.lineStyle(6, 0x8b6f47, alpha);
    this.background.strokeRoundedRect(0, 0, 160, 240, 20);

    if (hover) {
      this.background.lineStyle(6, borderColor, alpha);
      this.background.strokeRoundedRect(0, 0, 160, 240, 20);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.drawCardBackground(enabled);
    if (this.nameText) this.nameText.setAlpha(enabled ? 1 : 0.5);
    if (this.descText) this.descText.setAlpha(enabled ? 1 : 0.5);
    if (this.costText) this.costText.setAlpha(enabled ? 1 : 0.5);
  }

  setOnClick(callback: () => void): void {
    this.onClick = callback;
  }

  getCardId(): string {
    return this.config.id;
  }

  getCost(): number {
    return this.config.cost;
  }

  getName(): string {
    return this.config.name;
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
