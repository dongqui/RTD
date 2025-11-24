export interface SliderConfig {
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  value?: number;
  trackColor?: number;
  fillColor?: number;
  handleColor?: number;
  onChange?: (value: number) => void;
  throttleMs?: number;
}

export class Slider extends Phaser.GameObjects.Container {
  private trackBg: Phaser.GameObjects.Graphics;
  private fillGraphics: Phaser.GameObjects.Graphics;
  private handle: Phaser.GameObjects.Arc;
  private muteLine: Phaser.GameObjects.Graphics;
  private hitArea: Phaser.GameObjects.Rectangle;

  private _value: number;
  private min: number;
  private max: number;
  private trackWidth: number;
  private trackHeight: number;
  private handleRadius: number;
  private trackColor: number;
  private fillColor: number;
  private onChange?: (value: number) => void;
  private isDragging: boolean = false;

  // Throttle
  private throttleMs: number;
  private lastCallbackTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: SliderConfig = {}
  ) {
    super(scene, x, y);

    this.trackWidth = config.width ?? 340;
    this.trackHeight = config.height ?? 28;
    this.min = config.min ?? 0;
    this.max = config.max ?? 1;
    this._value = config.value ?? 0.5;
    this.onChange = config.onChange;
    this.handleRadius = this.trackHeight;
    this.throttleMs = config.throttleMs ?? 100;

    this.trackColor = config.trackColor ?? 0x444444;
    this.fillColor = config.fillColor ?? 0x4488ff;
    const handleColor = config.handleColor ?? 0xffffff;

    // Track background with rounded ends
    this.trackBg = scene.add.graphics();
    this.add(this.trackBg);

    // Fill with rounded ends
    this.fillGraphics = scene.add.graphics();
    this.add(this.fillGraphics);

    // Handle (circle)
    this.handle = scene.add.arc(
      this.getHandleX(),
      0,
      this.handleRadius,
      0,
      360,
      false,
      handleColor
    );
    this.handle.setStrokeStyle(3, 0x888888);
    this.add(this.handle);

    // Mute indicator (diagonal red line)
    this.muteLine = scene.add.graphics();
    this.add(this.muteLine);

    // Large hit area for touch input
    this.hitArea = scene.add.rectangle(
      this.trackWidth / 2,
      0,
      this.trackWidth + this.handleRadius * 2,
      this.handleRadius * 3,
      0x000000,
      0
    );
    this.hitArea.setInteractive({ useHandCursor: true });
    this.add(this.hitArea);

    // Touch/mouse events on hit area
    this.hitArea.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.handlePointerMove(pointer, true);
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.handlePointerMove(pointer, false);
      }
    });

    scene.input.on("pointerup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        // Fire final callback on release
        if (this.onChange) {
          this.onChange(this._value);
        }
      }
    });

    scene.add.existing(this);
    this.updateVisuals();
  }

  private handlePointerMove(
    pointer: Phaser.Input.Pointer,
    immediate: boolean
  ): void {
    const localX = pointer.x - this.x;
    this.setValueFromPosition(localX, immediate);
  }

  private getHandleX(): number {
    const normalized = (this._value - this.min) / (this.max - this.min);
    return normalized * this.trackWidth;
  }

  private setValueFromPosition(localX: number, immediate: boolean): void {
    const clampedX = Phaser.Math.Clamp(localX, 0, this.trackWidth);
    const normalized = clampedX / this.trackWidth;
    const newValue = this.min + normalized * (this.max - this.min);

    this.setValueInternal(newValue, immediate);
  }

  private setValueInternal(value: number, immediate: boolean): void {
    const newValue = Phaser.Math.Clamp(value, this.min, this.max);
    if (newValue !== this._value) {
      this._value = newValue;
      this.updateVisuals();

      // Throttle callback
      const now = Date.now();
      if (
        this.onChange &&
        (immediate || now - this.lastCallbackTime >= this.throttleMs)
      ) {
        this.lastCallbackTime = now;
        this.onChange(this._value);
      }
    }
  }

  private drawRoundedTrack(): void {
    const radius = this.trackHeight / 2;

    this.trackBg.clear();
    this.trackBg.fillStyle(this.trackColor, 1);
    this.trackBg.fillRoundedRect(
      0,
      -radius,
      this.trackWidth,
      this.trackHeight,
      radius
    );
  }

  private drawFill(): void {
    const radius = this.trackHeight / 2;
    const handleX = this.getHandleX();

    this.fillGraphics.clear();

    if (handleX > 0) {
      this.fillGraphics.fillStyle(this.fillColor, 1);
      this.fillGraphics.fillRoundedRect(
        0,
        -radius,
        Math.max(handleX, radius * 2),
        this.trackHeight,
        radius
      );
    }
  }

  private drawMuteIndicator(): void {
    this.muteLine.clear();

    if (this._value === 0) {
      // Draw larger red diagonal line through handle
      this.muteLine.lineStyle(6, 0xff4444, 1);
      const offset = this.handleRadius * 0.75;
      const handleX = this.getHandleX();
      this.muteLine.beginPath();
      this.muteLine.moveTo(handleX - offset, -offset);
      this.muteLine.lineTo(handleX + offset, offset);
      this.muteLine.strokePath();
    }
  }

  private updateVisuals(): void {
    const handleX = this.getHandleX();
    this.handle.setX(handleX);
    this.drawRoundedTrack();
    this.drawFill();
    this.drawMuteIndicator();
  }

  public getValue(): number {
    return this._value;
  }

  public setValue(value: number): void {
    const newValue = Phaser.Math.Clamp(value, this.min, this.max);
    if (newValue !== this._value) {
      this._value = newValue;
      this.updateVisuals();
      if (this.onChange) {
        this.onChange(this._value);
      }
    }
  }
}
