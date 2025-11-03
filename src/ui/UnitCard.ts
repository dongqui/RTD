import type { UnitType } from "../UnitManager";
import { UnitRegistry } from "../units/UnitRegistry";
import Card from "./Card";

export interface UnitCardConfig {
  id: string;
  type: UnitType;
  cost: number;
  name: string;
}

export default class UnitCard {
  private scene: Phaser.Scene;
  private card: Card;
  private container: Phaser.GameObjects.Container;

  private characterImage: Phaser.GameObjects.Image | null = null;
  private config: UnitCardConfig;
  private isEnabled: boolean = true;
  private onClick: (() => void) | null = null;
  private baseScale: number = 0.7;
  private hoverScale: number = 0.75;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: UnitCardConfig
  ) {
    const spec = UnitRegistry.getSpec(config.type);

    this.scene = scene;
    this.config = config;

    // Card 클래스 사용
    this.card = new Card(scene, 0, 0, {
      cost: config.cost,
      name: config.name,
      imageKey: `unit_portrait_${this.config.type}`,
      attack: spec.stats.attackDamage,
      health: spec.stats.health,
    });

    // Container에 Card와 다른 UI 요소들 추가
    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);
    this.container.setSize(200, 280);
    // this.container.setScale(this.baseScale);

    // 캐릭터 이미지 영역

    this.container.add([this.card]);

    // 인터랙션 설정
    const hitArea = new Phaser.Geom.Rectangle(-100, -140, 200, 280);
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
        this.container.setScale(this.hoverScale);
      }
    });

    this.container.on("pointerout", () => {
      this.scene.input.setDefaultCursor("default");
      this.container.setScale(this.baseScale);
    });
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const alpha = enabled ? 1 : 0.5;
    this.card.setAlpha(alpha);

    if (this.characterImage) {
      this.characterImage.setAlpha(alpha);
    }
  }

  setOnClick(callback: () => void): void {
    this.onClick = callback;
  }

  getCardId(): string {
    return this.config.id;
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
