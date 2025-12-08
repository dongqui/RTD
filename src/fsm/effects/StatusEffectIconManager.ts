import Phaser from "phaser";
import { CombatEntity } from "../CombatEntity";
import { EffectType } from "./StatusEffect";

export enum IconPosition {
  ABOVE_HEAD = "above_head",
  BELOW_FEET = "below_feet",
  LEFT_SIDE = "left_side",
  RIGHT_SIDE = "right_side",
}

export interface EffectIconConfig {
  iconKey: string;
  position: IconPosition;
  scale?: number;
  alpha?: number;
  offsetX?: number;
  offsetY?: number;
}

interface EffectIcon {
  sprite: Phaser.GameObjects.Sprite;
  config: EffectIconConfig;
  effectId: string;
}

export class StatusEffectIconManager {
  private entity: CombatEntity;
  private scene: Phaser.Scene;
  private icons: Map<string, EffectIcon> = new Map();
  private updateEvent: Phaser.Time.TimerEvent | null = null;

  // 각 위치별 아이콘 간격 및 오프셋
  private static readonly POSITION_CONFIGS = {
    [IconPosition.ABOVE_HEAD]: {
      baseOffsetX: 0,
      baseOffsetY: -80,
      spacing: 25,
      horizontal: true,
    },
    [IconPosition.BELOW_FEET]: {
      baseOffsetX: 0,
      baseOffsetY: 60,
      spacing: 25,
      horizontal: true,
    },
    [IconPosition.LEFT_SIDE]: {
      baseOffsetX: -40,
      baseOffsetY: -20,
      spacing: 25,
      horizontal: false,
    },
    [IconPosition.RIGHT_SIDE]: {
      baseOffsetX: 40,
      baseOffsetY: -20,
      spacing: 25,
      horizontal: false,
    },
  };

  constructor(entity: CombatEntity, scene: Phaser.Scene) {
    this.entity = entity;
    this.scene = scene;

    // 아이콘 위치 업데이트 이벤트 생성
    this.updateEvent = scene.time.addEvent({
      delay: 16,
      callback: () => this.updateIconPositions(),
      loop: true,
    });
  }

  addIcon(effectId: string, config: EffectIconConfig): void {
    if (this.icons.has(effectId)) {
      return;
    }

    const sprite = this.scene.add.sprite(0, 0, config.iconKey);
    sprite.setScale(config.scale ?? 0.5);
    sprite.setAlpha(config.alpha ?? 0.9);
    sprite.setOrigin(0.5, 0.5);

    if (this.entity.spineObject) {
      sprite.setDepth(this.entity.spineObject.depth + 10);
    }

    this.icons.set(effectId, {
      sprite,
      config,
      effectId,
    });

    this.updateIconPositions();
  }

  removeIcon(effectId: string): void {
    const icon = this.icons.get(effectId);
    if (icon) {
      icon.sprite.destroy();
      this.icons.delete(effectId);
      this.updateIconPositions();
    }
  }

  private updateIconPositions(): void {
    if (!this.entity.spineObject?.active) {
      return;
    }

    const baseX = this.entity.getX();
    const baseY = this.entity.getY();

    // 위치별로 아이콘 그룹화
    const iconsByPosition = new Map<IconPosition, EffectIcon[]>();
    for (const icon of this.icons.values()) {
      const position = icon.config.position;
      if (!iconsByPosition.has(position)) {
        iconsByPosition.set(position, []);
      }
      iconsByPosition.get(position)!.push(icon);
    }

    // 각 위치별로 아이콘 배치
    iconsByPosition.forEach((icons, position) => {
      const posConfig = StatusEffectIconManager.POSITION_CONFIGS[position];
      const count = icons.length;
      const totalSize = (count - 1) * posConfig.spacing;

      icons.forEach((icon, index) => {
        let x = baseX + posConfig.baseOffsetX;
        let y = baseY + posConfig.baseOffsetY;

        // 중앙 정렬을 위한 오프셋 계산
        if (posConfig.horizontal) {
          x += index * posConfig.spacing - totalSize / 2;
        } else {
          y += index * posConfig.spacing - totalSize / 2;
        }

        // 개별 아이콘의 추가 오프셋 적용
        x += icon.config.offsetX ?? 0;
        y += icon.config.offsetY ?? 0;

        icon.sprite.setPosition(x, y);
      });
    });
  }

  clear(): void {
    this.icons.forEach((icon) => {
      icon.sprite.destroy();
    });
    this.icons.clear();

    if (this.updateEvent) {
      this.updateEvent.remove();
      this.updateEvent = null;
    }
  }

  getIconCount(): number {
    return this.icons.size;
  }

  hasIcon(effectId: string): boolean {
    return this.icons.has(effectId);
  }
}
