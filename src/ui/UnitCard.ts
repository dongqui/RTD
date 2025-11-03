import type { UnitType } from "../UnitManager";
import { UnitRegistry } from "../units/UnitRegistry";
import Card from "./Card";
import { CARD_WIDTH, CARD_HEIGHT } from "../constants";
export interface UnitCardConfig {
  id: string;
  type: UnitType;
}

export default class UnitCard {
  private scene: Phaser.Scene;
  private card: Card;
  private container: Phaser.GameObjects.Container;
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
    const spec = UnitRegistry.getSpec(config.type);

    this.scene = scene;
    this.config = config;

    // Card 클래스 사용
    this.card = new Card(scene, 0, 0, {
      cost: spec.cost,
      name: spec.name,
      imageKey: `unit_portrait_${this.config.type}`,
      attack: spec.stats.attackDamage,
      health: spec.stats.health,
      description: spec.description,
      rate: spec.rate,
    });

    // Container에 Card와 다른 UI 요소들 추가
    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    // 캐릭터 이미지 영역

    this.container.add([this.card]);

    // 인터랙션 설정
    const hitArea = new Phaser.Geom.Rectangle(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
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
    return UnitRegistry.getSpec(this.config.type).cost;
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
