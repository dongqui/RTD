import type { HeroType } from "../managers/HeroManager";
import { HeroRegistry } from "../units/heroes";
import { SkillRegistry } from "../skills/SkillRegistry";
import { CardType } from "../skills/SkillTypes";
import HeroCard from "./HeroCard";
import SkillCard from "./SkillCard";
import { CARD_WIDTH, CARD_HEIGHT } from "../constants";

export interface CardConfig {
  cardType: CardType;
  id: string;
  type: HeroType | string; // HeroType or SkillType
}

export default class Card {
  private scene: Phaser.Scene;
  private card: HeroCard | SkillCard;
  private container: Phaser.GameObjects.Container;
  private characterImage: Phaser.GameObjects.Image | null = null;
  private config: CardConfig;
  private isEnabled: boolean = true;
  private onClick: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: CardConfig
  ) {
    this.scene = scene;
    this.config = config;

    // CardType에 따라 HeroCard 또는 SkillCard 생성
    if (config.cardType === CardType.UNIT) {
      const spec = HeroRegistry.getSpec(config.type as HeroType);
      this.card = new HeroCard(scene, 0, 0, {
        cost: spec.cost,
        name: spec.name,
        imageKey: `unit_portrait_${config.type}`,
        attack: spec.stats.attackDamage,
        health: spec.stats.health,
        description: spec.description,
        rate: spec.rate,
      });
    } else {
      // CardType.SKILL
      const spec = SkillRegistry.getSpec(config.type);
      this.card = new SkillCard(scene, 0, 0, {
        cost: spec.cost,
        name: spec.name,
        description: spec.description,
        iconKey: spec.icon || "icon_book",
      });
    }

    // Container에 Card와 다른 UI 요소들 추가
    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

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

  getType(): HeroType | string {
    return this.config.type;
  }

  get cardData(): CardConfig {
    return this.config;
  }

  getCardType(): CardType {
    return this.config.cardType;
  }

  getCost(): number {
    if (this.config.cardType === CardType.UNIT) {
      return HeroRegistry.getSpec(this.config.type as HeroType).cost;
    } else {
      return SkillRegistry.getSpec(this.config.type).cost;
    }
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  setInteractive(
    hitArea: any,
    callback?: Phaser.Types.Input.HitAreaCallback,
    dropZone?: boolean
  ): this {
    this.container.setInteractive(hitArea, callback, dropZone);
    return this;
  }

  on(event: string, fn: Function, context?: any): this {
    this.container.on(event, fn, context);
    return this;
  }

  once(event: string, fn: Function, context?: any): this {
    this.container.once(event, fn, context);
    return this;
  }

  off(event: string, fn?: Function, context?: any, once?: boolean): this {
    this.container.off(event, fn, context, once);
    return this;
  }

  setAlpha(alpha: number): this {
    this.container.setAlpha(alpha);
    return this;
  }

  setScale(scaleX: number, scaleY?: number): this {
    this.container.setScale(scaleX, scaleY);
    return this;
  }

  get scaleX(): number {
    return this.container.scaleX;
  }

  set scaleX(value: number) {
    this.container.scaleX = value;
  }

  get scaleY(): number {
    return this.container.scaleY;
  }

  set scaleY(value: number) {
    this.container.scaleY = value;
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy();
  }
}
