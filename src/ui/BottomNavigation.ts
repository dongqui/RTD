import { BottomTab, BottomTabConfig } from "./BottomTab";
interface ButtonData {
  key: string;
  imageKey: string;
  label: string;
  scene: string;
}

export default class BottomNavigation {
  private static instance: BottomNavigation | null = null;
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private buttons: Map<string, BottomTab> = new Map();

  private constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  public static getInstance(scene?: Phaser.Scene): BottomNavigation {
    if (!BottomNavigation.instance) {
      if (!scene) {
        throw new Error("Scene is required for first initialization");
      }
      BottomNavigation.instance = new BottomNavigation(scene);
    }
    return BottomNavigation.instance;
  }

  public static reset(): void {
    if (BottomNavigation.instance) {
      BottomNavigation.instance.destroy();
      BottomNavigation.instance = null;
    }
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    this.createNavigationButtons();
  }

  private createNavigationButtons(): void {
    const { width, height } = this.scene.scale.gameSize;
    const buttonY = height;

    this.buttonData = [
      {
        key: "home",
        imageKey: "icon_book",
        label: "카드 소환",
        scene: "SummonScene",
      },
      {
        key: "game",
        imageKey: "icon_swoard2",
        label: "전투",
        scene: "GameScene",
      },
      {
        key: "deck",
        imageKey: "icon_card",
        label: "내 카드",
        scene: "DeckScene",
      },
      {
        key: "settings",
        imageKey: "icon_settings",
        label: "설정",
        scene: "SettingsScene",
      },
    ];

    // 탭 너비를 화면 너비에 맞춰 4등분 (간격 없음)
    const tabWidth = width / this.buttonData.length;

    // 첫 번째 탭의 시작 x 위치 계산
    const startX = tabWidth / 2;

    this.buttonData.forEach((buttonData, index) => {
      const x = startX + index * tabWidth;
      const tab = this.createTab(x, buttonY, tabWidth, buttonData);
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

  private readonly tabHeight = 180;

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
      imageKey: data.imageKey,
      label: data.label,
      raisedOffset: 38,
      onSelect: () => this.handleTabSelect(data.key),
    };

    const tab = new BottomTab(this.scene, x, y, config);
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
    if (data) {
      // Game Scene Manager를 통해 씬 전환
      const sceneManager = this.scene.game.scene;
      const currentScenes = sceneManager.getScenes(true);

      // UIScene을 제외한 활성 씬 찾기
      const activeGameScene = currentScenes.find(
        (s) =>
          s.scene.key !== "UIScene" &&
          s.scene.key !== "Boot" &&
          s.scene.key !== "Preload"
      );

      // 현재 활성 씬과 다르면 전환
      if (activeGameScene && activeGameScene.scene.key !== data.scene) {
        sceneManager.stop(activeGameScene.scene.key);
        sceneManager.start(data.scene);
      } else if (!activeGameScene) {
        // 활성 씬이 없으면 그냥 시작
        sceneManager.start(data.scene);
      }
    }
  }

  hide(): void {
    this.container.setVisible(false);
  }

  show(): void {
    this.container.setVisible(true);
  }

  destroy(): void {
    this.container.destroy();
  }
}
