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
  private descText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private characterImage: Phaser.GameObjects.Image | null = null;
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
    this.container.setSize(112, 168);
    this.container.setScale(0.7);

    this.background = this.scene.add.graphics();
    this.drawCard(true);

    const spec = UnitRegistry.hasSpec(config.type)
      ? UnitRegistry.getSpec(config.type)
      : null;

    this.nameText = this.scene.add.text(80, 125, config.name, {
      fontSize: "32px",
      color: "#2a2a3a",
      fontStyle: "bold",
      fontFamily: "Arial",
    });
    this.nameText.setOrigin(0.5);

    this.descText = this.scene.add.text(80, 152.5, spec?.description || "", {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "Arial",
      align: "center",
      wordWrap: { width: 160 },
    });
    this.descText.setOrigin(0.5);

    this.statsText = this.scene.add.text(
      80,
      186,
      spec ? `⚔️${spec.stats.attackDamage} ❤️${spec.stats.health}` : "",
      {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      }
    );
    this.statsText.setOrigin(0.5);

    this.costText = this.scene.add.text(40, 60, `${config.cost}`, {
      fontSize: "48px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 5,
    });
    this.costText.setOrigin(0.5);

    this.container.add([
      this.background,
      this.nameText,
      this.descText,
      this.statsText,
      this.costText,
    ]);

    this.loadCharacterImage();

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
        this.drawCard(true, true);
      }
    });

    this.container.on("pointerout", () => {
      this.scene.input.setDefaultCursor("default");
      this.drawCard(this.isEnabled);
    });
  }

  private loadCharacterImage(): void {
    if (!UnitRegistry.hasSpec(this.config.type)) {
      return;
    }

    const imageKey = `unit_portrait_${this.config.type}`;

    if (this.scene.textures.exists(imageKey)) {
      this.characterImage = this.scene.add.image(80, 60, imageKey);
      this.characterImage.setDisplaySize(125, 100);
      this.container.add(this.characterImage);
    } else {
      const placeholderText = this.scene.add.text(80, 60, "📷", {
        fontSize: "80px",
      });
      placeholderText.setOrigin(0.5);
      this.container.add(placeholderText);
    }
  }

  private drawCard(enabled: boolean, hover: boolean = false): void {
    this.background.clear();

    const alpha = enabled ? 1 : 0.5;
    const borderColor = hover ? 0xffff44 : 0xffffff;
    const scale = hover ? 0.75 : 0.7;

    this.container.setScale(scale);

    this.background.lineStyle(6, 0x8b6f47, alpha);
    this.background.strokeRoundedRect(0, 0, 160, 240, 20);

    this.background.fillStyle(0xf5deb3, alpha);
    this.background.fillRoundedRect(15, 15, 125, 105, 12);

    this.background.fillStyle(0xfff8dc, alpha);
    this.background.fillRoundedRect(15, 115, 125, 22.5, 10);

    this.background.fillStyle(0x5a4a3a, alpha * 0.9);
    this.background.fillRoundedRect(15, 137.5, 125, 35, 10);

    this.background.fillStyle(0x3a2a2a, alpha * 0.9);
    this.background.fillRoundedRect(15, 177.5, 125, 17.5, 10);

    this.background.fillStyle(0x4a9eff, alpha);
    this.background.fillCircle(22.5, 22.5, 16);
    this.background.lineStyle(4, 0xffffff, alpha);
    this.background.strokeCircle(45, 45, 32);

    if (hover) {
      this.background.lineStyle(6, borderColor, alpha);
      this.background.strokeRoundedRect(0, 0, 280, 400, 20);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.drawCard(enabled);
    this.nameText.setAlpha(enabled ? 1 : 0.5);
    this.descText.setAlpha(enabled ? 1 : 0.5);
    this.statsText.setAlpha(enabled ? 1 : 0.5);
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

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
