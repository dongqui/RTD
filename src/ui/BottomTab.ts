//   bg: spriteBorder: {x: 29, y: 5, z: 29, w: 25}, color: #3B304E
// border   spriteBorder: {x: 29, y: 4, z: 29, w: 26}, color: #151428
// light:   spriteBorder: {x: 25, y: 0, z: 25, w: 0}, color: #565076
// inner shadow:   spriteBorder: {x: 7, y: 13, z: 7, w: 17} color: #332B47

export interface BottomTabConfig {
  key: string;
  width?: number;
  height?: number;
  icon: string;
  label: string;
  iconStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  labelStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  raisedOffset?: number;
  onSelect?: (tab: BottomTab) => void;
}

interface SliceConfig {
  key: string;
  tint: number;
  borders: { left: number; right: number; top: number; bottom: number };
}

const BG_CONFIG: SliceConfig = {
  key: "tab_bottom_bg",
  tint: 0x3b304e,
  borders: { left: 29, right: 29, top: 25, bottom: 5 },
};

const BORDER_CONFIG: SliceConfig = {
  key: "tab_bottom_border",
  tint: 0x151428,
  borders: { left: 29, right: 29, top: 26, bottom: 4 },
};

const LIGHT_CONFIG: SliceConfig = {
  key: "tab_bottom_light",
  tint: 0x565076,
  borders: { left: 25, right: 25, top: 0, bottom: 0 },
};

const INNER_SHADOW_CONFIG: SliceConfig = {
  key: "tab_bottom_inner_shadow",
  tint: 0x332b47,
  borders: { left: 7, right: 7, top: 17, bottom: 13 },
};

const DEFAULT_ICON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: "48px",
  color: "#ffffff",
  fontStyle: "bold",
  align: "center",
};

const DEFAULT_LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: "24px",
  color: "#2d2342",
  fontStyle: "bold",
  align: "center",
};

export class BottomTab extends Phaser.GameObjects.Container {
  private slices: Phaser.GameObjects.NineSlice[] = [];
  private icon: Phaser.GameObjects.Text;
  private label: Phaser.GameObjects.Text;
  private isSelected = false;
  private baseY: number;
  private readonly raisedOffset: number;
  private bodyWidth: number;
  private bodyHeight: number;
  private iconYSelected: number;
  private iconYDeselected: number;
  private labelY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly config: BottomTabConfig
  ) {
    super(scene, x, y);

    this.bodyWidth = config.width ?? 320;
    this.bodyHeight = config.height ?? 140;
    this.raisedOffset = config.raisedOffset ?? 36;
    this.baseY = y;

    this.createSlices();
    this.icon = this.createIcon();
    this.label = this.createLabel();

    this.add([...this.slices, this.icon, this.label]);

    this.setSize(this.bodyWidth, this.bodyHeight);
    this.updateLayout(false);

    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        -this.bodyWidth / 2,
        -this.bodyHeight,
        this.bodyWidth,
        this.bodyHeight
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.on("pointerup", () => {
      if (!this.isSelected && this.config.onSelect) {
        this.config.onSelect(this);
      }
    });

    scene.add.existing(this);
  }

  get key(): string {
    return this.config.key;
  }

  select(animate = true): void {
    if (this.isSelected) {
      return;
    }
    this.isSelected = true;
    this.applyState(animate);
  }

  deselect(animate = true): void {
    if (!this.isSelected) {
      return;
    }
    this.isSelected = false;
    this.applyState(animate);
  }

  setBasePosition(x: number, y: number): void {
    this.baseY = y;
    this.setPosition(x, this.isSelected ? y - this.raisedOffset : y);
  }

  setTabWidth(width: number): void {
    this.setTabSize(width, this.bodyHeight);
  }

  setTabSize(width: number, height: number): void {
    this.bodyWidth = width;
    this.bodyHeight = height;

    this.slices.forEach((slice) => {
      slice.setSize(width, height);
    });

    this.updateLayout(false);

    this.setSize(width, height);
    if (this.input) {
      this.input.hitArea.setTo(-width / 2, -height, width, height);
    }
  }

  private applyState(animate: boolean): void {
    const targetY = this.baseY + (this.isSelected ? -this.raisedOffset : 0);
    const iconY = this.isSelected ? this.iconYSelected : this.iconYDeselected;
    const labelAlpha = this.isSelected ? 1 : 0;

    if (animate) {
      this.scene.tweens.add({
        targets: this,
        y: targetY,
        duration: 220,
        ease: "Cubic.easeOut",
      });

      this.scene.tweens.add({
        targets: this.icon,
        y: iconY,
        duration: 220,
        ease: "Cubic.easeOut",
      });

      this.scene.tweens.add({
        targets: this.label,
        alpha: labelAlpha,
        duration: 220,
        ease: "Cubic.easeOut",
      });
    } else {
      this.setY(targetY);
      this.icon.setY(iconY);
      this.label.setAlpha(labelAlpha);
    }
  }

  private createSlices(): void {
    const sliceConfigs = [
      BG_CONFIG,
      INNER_SHADOW_CONFIG,
      LIGHT_CONFIG,
      BORDER_CONFIG,
    ];

    this.slices = [
      this.scene.add
        .nineslice(
          0,
          0,
          BG_CONFIG.key,
          undefined,
          this.bodyWidth,
          this.bodyHeight,
          BG_CONFIG.borders.left,
          BG_CONFIG.borders.right,
          BG_CONFIG.borders.top,
          BG_CONFIG.borders.bottom
        )
        .setOrigin(0.5, 1)
        .setTint(BG_CONFIG.tint),
      this.scene.add
        .nineslice(
          0,
          0,
          BORDER_CONFIG.key,
          undefined,
          this.bodyWidth,
          this.bodyHeight,
          BORDER_CONFIG.borders.left,
          BORDER_CONFIG.borders.right,
          BORDER_CONFIG.borders.top,
          BORDER_CONFIG.borders.bottom
        )
        .setOrigin(0.5, 1)
        .setTint(BORDER_CONFIG.tint),
    ];

    // this.slices = sliceConfigs.map((config) =>
    //   this.scene.add
    //     .nineslice(
    //       0,
    //       0,
    //       config.key,
    //       undefined,
    //       this.bodyWidth,
    //       this.bodyHeight,
    //       config.borders.left,
    //       config.borders.right,
    //       config.borders.top,
    //       config.borders.bottom
    //     )
    //     .setOrigin(0.5, 1)
    //     .setTint(config.tint)
    // );

    // this.scene.add
    //   .nineslice(
    //     0,
    //     0,
    //     INNER_SHADOW_CONFIG.key,
    //     undefined,
    //     this.bodyWidth,
    //     this.bodyHeight,
    //     INNER_SHADOW_CONFIG.borders.left,
    //     INNER_SHADOW_CONFIG.borders.right,
    //     INNER_SHADOW_CONFIG.borders.top,
    //     INNER_SHADOW_CONFIG.borders.bottom
    //   )
    //   .setOrigin(0.5, 1)
    //   .setTint(INNER_SHADOW_CONFIG.tint);

    // this.scene.add
    //   .nineslice(
    //     0,
    //     0,
    //     LIGHT_CONFIG.key,
    //     undefined,
    //     this.bodyWidth,
    //     0,
    //     LIGHT_CONFIG.borders.left,
    //     LIGHT_CONFIG.borders.right,
    //     LIGHT_CONFIG.borders.top,
    //     LIGHT_CONFIG.borders.bottom
    //   )
    //   .setOrigin(0.5, 1)
    //   .setTint(LIGHT_CONFIG.tint);

    // const lightSlice = this.slices[1];
    // lightSlice.setAlpha(0.85);
  }

  private createIcon(): Phaser.GameObjects.Text {
    const style = {
      ...DEFAULT_ICON_STYLE,
      ...this.config.iconStyle,
    };

    return this.scene.add
      .text(0, 0, this.config.icon, style)
      .setOrigin(0.5, 0.5);
  }

  private createLabel(): Phaser.GameObjects.Text {
    const style = {
      ...DEFAULT_LABEL_STYLE,
      ...this.config.labelStyle,
    };

    return this.scene.add
      .text(0, 0, this.config.label, style)
      .setOrigin(0.5, 0.5)
      .setAlpha(0);
  }

  private updateLayout(animate = true): void {
    this.iconYSelected = -this.bodyHeight * 0.62;
    this.iconYDeselected = -this.bodyHeight * 0.5;
    this.labelY = -this.bodyHeight * 0.16;

    this.icon.setY(this.isSelected ? this.iconYSelected : this.iconYDeselected);
    this.label.setY(this.labelY);

    if (!animate) {
      this.applyState(false);
    } else {
      this.applyState(true);
    }
  }
}
