import { BottomTab, BottomTabConfig } from "./BottomTab";

interface ButtonData {
  key: string;
  icon: string;
  label: string;
  scene: string;
}

export default class BottomNavigation {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private buttons: Map<string, BottomTab> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
    this.setupResize();
  }

  private create(): void {
    const { width, height } = this.scene.scale.gameSize;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    this.background = this.scene.add.rectangle(
      width / 2,
      height - 75,
      width,
      150,
      0x2a2a3e,
      0.95
    );
    this.background.setStrokeStyle(2, 0x4a4a6e);
    this.container.add(this.background);

    this.createNavigationButtons();
  }

  private createNavigationButtons(): void {
    const { width, height } = this.scene.scale.gameSize;
    const buttonY = height - 75;

    this.buttonData = [
      { key: "home", icon: "🏠", label: "Home", scene: "HomeScene" },
      { key: "game", icon: "⚔️", label: "Game", scene: "GameScene" },
      { key: "deck", icon: "🃏", label: "Deck", scene: "DeckScene" },
    ];

    const columnWidth = width / this.buttonData.length;

    this.buttonData.forEach((buttonData, index) => {
      const x = columnWidth * index + columnWidth / 2;
      const tab = this.createTab(x, buttonY, columnWidth, buttonData);
      this.buttons.set(buttonData.key, tab);
      this.container.add(tab);
      if (index === 0) {
        tab.select(false);
        this.selectedTabKey = buttonData.key;
      } else {
        tab.deselect(false);
      }
    });
  }

  private buttonData: ButtonData[] = [];

  private selectedTabKey?: string;

  private readonly tabHeight = 140;

  private createTab(
    x: number,
    y: number,
    columnWidth: number,
    data: ButtonData
  ): BottomTab {
    const config: BottomTabConfig = {
      key: data.key,
      width: columnWidth,
      height: this.tabHeight,
      icon: data.icon,
      label: data.label,
      raisedOffset: 38,
      onSelect: () => this.handleTabSelect(data.key),
    };

    const tab = new BottomTab(this.scene, x, y, config);
    tab.setBasePosition(x, y);
    return tab;
  }

  private handleTabSelect(key: string): void {
    if (this.selectedTabKey === key) {
      return;
    }

    if (this.selectedTabKey) {
      const current = this.buttons.get(this.selectedTabKey);
      current?.deselect();
    }

    const next = this.buttons.get(key);
    next?.select();

    this.selectedTabKey = key;

    const data = this.buttonData.find((entry) => entry.key === key);
    if (data && this.scene.scene.key !== data.scene) {
      this.scene.scene.start(data.scene);
    }
  }

  private setupResize(): void {
    this.scene.scale.on("resize", this.handleResize, this);
  }

  private handleResize(): void {
    const { width, height } = this.scene.scale.gameSize;

    this.background.setPosition(width / 2, height - 75);
    this.background.setSize(width, 150);

    const buttonY = height - 75;
    const buttons = Array.from(this.buttons.values());
    const columnWidth = width / buttons.length;

    buttons.forEach((tab, index) => {
      const x = columnWidth * index + columnWidth / 2;
      tab.setTabWidth(columnWidth);
      tab.setBasePosition(x, buttonY);
    });
  }

  hide(): void {
    this.container.setVisible(false);
  }

  show(): void {
    this.container.setVisible(true);
  }

  destroy(): void {
    this.scene.scale.off("resize", this.handleResize, this);
    this.container.destroy();
  }
}
