import type { UnitType } from "../UnitManager";
import { UnitRegistry } from "../units/UnitRegistry";

export interface UnitCardConfig {
  type: UnitType;
  cost: number;
  name: string;
  icon?: string;
}

export default class UnitCard {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private config: UnitCardConfig;
  private isEnabled: boolean = true;
  private onClick: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: UnitCardConfig
  ) {
    this.scene = scene;
    this.config = config;

    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);
    this.container.setSize(120, 160);

    this.background = this.scene.add.graphics();
    this.drawCard(true);

    this.nameText = this.scene.add.text(60, 60, config.name, {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    this.nameText.setOrigin(0.5);

    this.costText = this.scene.add.text(60, 140, `${config.cost}`, {
      fontSize: "28px",
      color: "#ffd700",
      fontStyle: "bold",
    });
    this.costText.setOrigin(0.5);

    const costLabel = this.scene.add.text(60, 115, "COST", {
      fontSize: "12px",
      color: "#aaaaaa",
    });
    costLabel.setOrigin(0.5);

    this.container.add([
      this.background,
      this.nameText,
      costLabel,
      this.costText,
    ]);

    const hitArea = new Phaser.Geom.Rectangle(0, 0, 120, 160);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.container.on("pointerdown", (_pointer: any, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (this.isEnabled && this.onClick) {
        this.onClick();
      }
    });

    this.container.on("pointerup", (_pointer: any, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });

    this.container.on("pointerover", () => {
      if (this.isEnabled) {
        this.scene.input.setDefaultCursor('pointer');
        this.drawCard(true, true);
      }
    });

    this.container.on("pointerout", () => {
      this.scene.input.setDefaultCursor('default');
      this.drawCard(this.isEnabled);
    });
  }

  private drawCard(enabled: boolean, hover: boolean = false): void {
    this.background.clear();

    const alpha = enabled ? 1 : 0.5;
    const bgColor = enabled ? 0x2a2a3a : 0x1a1a1a;
    const borderColor = hover ? 0xffff00 : enabled ? 0x5555ff : 0x333333;

    this.background.fillStyle(bgColor, alpha);
    this.background.fillRoundedRect(0, 0, 120, 160, 12);

    this.background.lineStyle(hover ? 3 : 2, borderColor, alpha);
    this.background.strokeRoundedRect(0, 0, 120, 160, 12);

    const iconSize = 40;
    const iconX = 60 - iconSize / 2;
    const iconY = 20;

    let cardColor = 0xffffff;
    if (UnitRegistry.hasSpec(this.config.type)) {
      const spec = UnitRegistry.getSpec(this.config.type);
      cardColor = spec.cardColor || 0xffffff;
    }

    this.background.fillStyle(cardColor, alpha);
    this.background.fillCircle(60, iconY + iconSize / 2, iconSize / 2);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.drawCard(enabled);
    this.nameText.setAlpha(enabled ? 1 : 0.5);
    this.costText.setAlpha(enabled ? 1 : 0.5);
  }

  setOnClick(callback: () => void): void {
    this.onClick = callback;
  }

  getType(): UnitType {
    return this.config.type;
  }

  getCost(): number {
    return this.config.cost;
  }

  destroy(): void {
    this.container.destroy();
  }
}
