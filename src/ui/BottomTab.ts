//   bg: spriteBorder: {x: 29, y: 5, z: 29, w: 25}, color: #3B304E
// border   spriteBorder: {x: 29, y: 4, z: 29, w: 26}, color: #151428
// light:   spriteBorder: {x: 25, y: 0, z: 25, w: 0}, color: #565076
// inner shadow:   spriteBorder: {x: 7, y: 13, z: 7, w: 17} color: #332B47

export interface BottomTabConfig {
  key: string;
  width?: number;
  height?: number;
  imageKey: string;
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

// Selected tab colors
const SELECTED_BG_COLOR = 0x7550d2;
const SELECTED_LIGHT_COLOR = 0x8f8fff;
const SELECTED_INNER_SHADOW_COLOR = 0x593da1;
const SELECTED_BORDER_COLOR = 0x151428;

// Light slice positioning offsets
const LIGHT_OFFSET_Y = 4; // 상단에서 약간 내린 오프셋
const LIGHT_OFFSET_WIDTH = 5; // 좌우 여백을 위한 너비 감소

const DEFAULT_LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: "28px",
  color: "#ffffff",
  fontStyle: "bold",
  align: "center",
};

export class BottomTab extends Phaser.GameObjects.Container {
  private slices: Phaser.GameObjects.NineSlice[] = [];
  private image: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private isSelected = false;
  private baseY: number;
  private readonly raisedOffset: number;
  private bodyWidth: number;
  private bodyHeight: number;
  private iconYSelected: number;
  private iconYDeselected: number;
  private labelY: number;
  private offsetY: number;

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
    this.offsetY = 40;
    this.baseY = y + this.offsetY;

    this.createSlices();
    this.image = this.createIcon();
    this.label = this.createLabel();

    this.add([...this.slices, this.image, this.label]);

    this.setSize(this.bodyWidth, this.bodyHeight);
    this.updateLayout(false);

    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        0,
        -this.bodyHeight + this.offsetY + this.raisedOffset,
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

  setTabWidth(width: number): void {
    this.setTabSize(width, this.bodyHeight);
  }

  setTabSize(width: number, height: number): void {
    this.bodyWidth = width;
    this.bodyHeight = height;

    // 모든 slice 업데이트 (light slice 제외)
    this.slices.forEach((slice, index) => {
      if (index === 2) {
        // Light slice (인덱스 2)는 특별한 크기와 위치
        slice.setSize(width - LIGHT_OFFSET_WIDTH, height);
        slice.setPosition(0, -height + LIGHT_OFFSET_Y);
      } else {
        // 다른 slice들은 일반 크기
        slice.setSize(width, height);
      }
    });

    this.updateLayout(false);

    this.setSize(width, height);
    if (this.input) {
      // Container origin (0, 0) 기준으로 hitArea 설정
      this.input.hitArea.setTo(-width / 2, -height, width, height);
    }
  }

  private applyState(animate: boolean): void {
    const targetY = this.baseY + (this.isSelected ? -this.raisedOffset : 0);
    const iconY = this.isSelected ? this.iconYSelected : this.iconYDeselected;
    const labelAlpha = this.isSelected ? 1 : 0;

    // 선택 상태에 따라 색상 변경
    const bgColor = this.isSelected ? SELECTED_BG_COLOR : BG_CONFIG.tint;
    const lightColor = this.isSelected
      ? SELECTED_LIGHT_COLOR
      : LIGHT_CONFIG.tint;
    const innerShadowColor = this.isSelected
      ? SELECTED_INNER_SHADOW_COLOR
      : INNER_SHADOW_CONFIG.tint;
    const borderColor = this.isSelected
      ? SELECTED_BORDER_COLOR
      : BORDER_CONFIG.tint;

    // slice 색상 업데이트 (0: bg, 1: border, 2: light, 3: innerShadow)
    this.slices[0].setTint(bgColor);
    this.slices[1].setTint(borderColor);
    this.slices[2].setTint(lightColor);
    this.slices[3].setTint(innerShadowColor);

    if (animate) {
      this.scene.tweens.add({
        targets: this,
        y: targetY,
        duration: 220,
        ease: "Cubic.easeOut",
      });

      this.scene.tweens.add({
        targets: this.image,
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
      this.image.setY(iconY);
      this.label.setAlpha(labelAlpha);
    }
  }

  private createSlices(): void {
    // BG slice
    const bgSlice = this.scene.add
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
      .setTint(BG_CONFIG.tint);

    // Border slice
    const borderSlice = this.scene.add
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
      .setTint(BORDER_CONFIG.tint);

    // Light slice (상단에 위치)
    const lightSlice = this.scene.add
      .nineslice(
        0,
        -this.bodyHeight + LIGHT_OFFSET_Y,
        LIGHT_CONFIG.key,
        undefined,
        this.bodyWidth - LIGHT_OFFSET_WIDTH,
        this.bodyHeight,
        LIGHT_CONFIG.borders.left,
        LIGHT_CONFIG.borders.right,
        LIGHT_CONFIG.borders.top,
        LIGHT_CONFIG.borders.bottom
      )
      .setOrigin(0.5, 0)
      .setTint(LIGHT_CONFIG.tint);

    // Inner shadow slice
    const innerShadowSlice = this.scene.add
      .nineslice(
        0,
        0,
        INNER_SHADOW_CONFIG.key,
        undefined,
        this.bodyWidth - 10,
        this.bodyHeight - 20,
        INNER_SHADOW_CONFIG.borders.left,
        INNER_SHADOW_CONFIG.borders.right,
        INNER_SHADOW_CONFIG.borders.top,
        INNER_SHADOW_CONFIG.borders.bottom
      )
      .setOrigin(0.5, 1)
      .setTint(INNER_SHADOW_CONFIG.tint);

    // 모든 slice를 배열에 추가 (순서 중요: 배경부터 앞으로)
    this.slices = [bgSlice, borderSlice, lightSlice, innerShadowSlice];
  }

  private createIcon(): Phaser.GameObjects.Image {
    return this.scene.add
      .image(0, 0, this.config.imageKey)
      .setDisplaySize(100, 100)
      .setOrigin(0.5, 0.5);
  }

  private createLabel(): Phaser.GameObjects.Text {
    const style = {
      ...DEFAULT_LABEL_STYLE,
      ...this.config.labelStyle,
    };

    return this.scene.add
      .text(0, 0, this.config.label, {
        ...style,
        fontFamily: "Germania One",
      })

      .setOrigin(0.5, 0.5)
      .setAlpha(0);
  }

  private updateLayout(animate = true): void {
    this.iconYSelected = -this.bodyHeight * 0.65;
    this.iconYDeselected = -this.bodyHeight * 0.6;
    this.labelY = -this.bodyHeight * 0.16;

    this.image.setY(
      this.isSelected ? this.iconYSelected : this.iconYDeselected
    );
    this.label.setY(this.labelY);

    if (!animate) {
      this.applyState(false);
    } else {
      this.applyState(true);
    }
  }
}
