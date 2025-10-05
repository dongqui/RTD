import { GridSystem } from "../GridSystem";
import CameraManager from "../CameraManager";
import GameManager from "../GameManager";
import { TowerManager } from "../TowerManager";
import { WaveManager } from "../WaveManager";
import { PathfindingSystem } from "../PathfindingSystem";
import { MonsterManager } from "../MonsterManager";
import { RewardSystem } from "../RewardSystem";
import { SimpleRewardUI } from "../SimpleRewardUI";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v3";
import { Skin } from '@esotericsoftware/spine-core';

export default class GameScene extends Phaser.Scene {
  private gridSystem: GridSystem;
  private cameraManager: CameraManager;
  private gameManager: GameManager;
  private towerManager: TowerManager;
  private waveManager: WaveManager;
  private pathfindingSystem: PathfindingSystem;
  private monsterManager: MonsterManager;
  private rewardSystem: RewardSystem;
  private rewardUI: SimpleRewardUI;

  spine: SpinePlugin = (window as any).spine as SpinePlugin;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.spineJson(
      "fantasy_character",
      "assets/spine/Fantasy Character.json"
    );
    this.load.spineAtlas(
      "fantasy_character-atlas",
      "assets/spine/Fantasy Character.atlas.txt"
    );
  }

  create() {
    this.gameManager = new GameManager(this);
    this.cameraManager = new CameraManager(this);
    this.gameManager.setCameraManager(this.cameraManager);
    this.monsterManager = new MonsterManager(this);
    this.setupGrid();
    this.setupMap();
    this.setupTowerManager();
    this.setupMonsterSystem();
    this.setupRewardSystem();

    this.cameraManager.setupCameraDrag();
    this.setupGameEventHandlers();
    this.setupMobileOptimization();
  }

  private setupMobileOptimization() {
    // 모바일에서 터치 입력 최적화
    this.input.addPointer(2); // 멀티터치 지원

    // 화면 크기 변경 감지
    this.scale.on("resize", this.handleResize, this);

    // 초기 카메라 설정
    this.handleResize();
  }

  private handleResize() {
    const { width, height } = this.scale.gameSize;

    // 카메라 경계 설정 (게임 월드 크기에 맞게) - 2480x2480
    this.cameras.main.setBounds(0, 0, 2480, 2480);

    // 작은 화면에서는 줌 아웃
    if (width < 800 || height < 600) {
      this.cameras.main.setZoom(0.4); // 더 작은 줌으로 전체 맵 보이기
    } else {
      this.cameras.main.setZoom(0.8);
    }
  }

  private setupMap() {
    const castleGridX = 15;
    const castleGridY = 15;
    const castleWorldPos = this.gridSystem.gridToWorld(
      castleGridX,
      castleGridY
    ); // 1x1의 중앙

    this.anims.create({
      key: "king_idle",
      frames: this.anims.generateFrameNumbers("king_idle", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.add
      .sprite(castleWorldPos.x, castleWorldPos.y, "king_idle")
      .setDisplaySize(128, 128)
      .play("king_idle");

    this.cameraManager.centerOn(castleWorldPos.x, castleWorldPos.y);

    // King 위치는 몬스터가 도달할 수 있도록 occupied로 설정하지 않음
  }

  private setupGrid() {
    this.gridSystem = new GridSystem(this, 80, 31, 31);
    this.gameManager.setGridSystem(this.gridSystem);

    this.data.set("gridSystem", this.gridSystem);

    // 중앙에 1x1 castle 배치 (31x31 그리드의 중앙)
  }

  private setupTowerManager() {
    this.towerManager = new TowerManager(
      this,
      this.gridSystem,
      this.gameManager,
      this.monsterManager
    );

    // GameManager에 TowerManager 참조 설정
    this.gameManager.setTowerManager(this.towerManager);

    this.towerManager.placeTower(17, 15, "arrow"); // castle 옆에 배치
  }

  private setupMonsterSystem() {
    this.pathfindingSystem = new PathfindingSystem(this.gridSystem, 31, 31);
    this.waveManager = new WaveManager(
      this,
      this.gameManager,
      this.pathfindingSystem,
      this.gridSystem,
      this.monsterManager
    );
  }

  private setupRewardSystem() {
    this.rewardSystem = new RewardSystem(this);
    this.rewardUI = new SimpleRewardUI(this, (reward) => {
      this.gameManager.selectReward(reward);
    });
  }

  private setupGameEventHandlers() {
    this.events.on("wave-prepared", (waveNumber: number) => {
      console.log(`Wave ${waveNumber} prepared. Tap to start!`);
    });

    this.events.on("show-rewards", (waveNumber: number) => {
      console.log(`Showing rewards for wave ${waveNumber}`);
      const rewards = this.rewardSystem.getRandomRewards(4);
      console.log("Generated rewards:", rewards);
      this.rewardUI.showRewards(rewards);
    });

    this.events.on("enter-placement-mode", (reward: any) => {
      console.log(`Entering placement mode for ${reward.name}`);
    });

    // 키보드 입력 (데스크톱)
    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.gameManager.canStartWave()) {
        this.gameManager.startWave();
      }
    });

    // 모바일을 위한 UI 버튼 생성
    this.createMobileUI();
  }

  private createMobileUI() {
    const { width, height } = this.scale.gameSize;
    const isMobile = width < 800 || height < 600;

    // Start Wave 버튼 - 모바일에서 더 크게
    const startButton = this.add
      .text(isMobile ? width - 20 : 100, isMobile ? 20 : 50, "START WAVE", {
        fontSize: isMobile ? "32px" : "24px",
        color: "#ffffff",
        backgroundColor: "#4CAF50",
        padding: { x: isMobile ? 30 : 20, y: isMobile ? 15 : 10 },
      })
      .setOrigin(isMobile ? 1 : 0, 0)
      .setDepth(10000)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0) // UI는 카메라 이동에 영향받지 않음
      .on("pointerdown", () => {
        if (this.gameManager.canStartWave()) {
          this.gameManager.startWave();
        }
      })
      .on("pointerover", () =>
        startButton.setStyle({ backgroundColor: "#45a049" })
      )
      .on("pointerout", () =>
        startButton.setStyle({ backgroundColor: "#4CAF50" })
      );

    // 게임 정보 표시 - 모바일에서 더 크게
    const infoText = this.add
      .text(20, isMobile ? height - 60 : 20, "", {
        fontSize: isMobile ? "20px" : "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: isMobile ? 15 : 10, y: isMobile ? 8 : 5 },
      })
      .setScrollFactor(0)
      .setDepth(9999);

    // 게임 상태 업데이트
    this.events.on("wave-started", (wave: number) => {
      const waveText = isMobile
        ? `W:${wave} | HP:${this.gameManager.getCoreHealth()} | G:${this.gameManager.getGold()}`
        : `Wave: ${wave} | HP: ${this.gameManager.getCoreHealth()} | Gold: ${this.gameManager.getGold()}`;
      infoText.setText(waveText);
      startButton.setVisible(false);
    });

    this.events.on("wave-prepared", (wave: number) => {
      const waveText = isMobile
        ? `W:${wave} | HP:${this.gameManager.getCoreHealth()} | G:${this.gameManager.getGold()}`
        : `Wave: ${wave} Ready | HP: ${this.gameManager.getCoreHealth()} | Gold: ${this.gameManager.getGold()}`;
      infoText.setText(waveText);
      // 타워 설치 모드가 아닐 때만 버튼 표시
      const shouldShowButton = !this.gameManager.isPendingTowerPlacement();
      console.log(
        `Wave prepared: ${wave}, isPending: ${this.gameManager.isPendingTowerPlacement()}, showing button: ${shouldShowButton}`
      );
      startButton.setVisible(shouldShowButton);
    });

    this.events.on("enter-placement-mode", (reward: any) => {
      const placementText = isMobile
        ? `${reward.name} 설치`
        : `${
            reward.name
          } 설치 위치를 선택하세요 | HP: ${this.gameManager.getCoreHealth()} | Gold: ${this.gameManager.getGold()}`;
      infoText.setText(placementText);
      startButton.setVisible(false);
    });

    this.events.on("reward-selected", (reward: any) => {
      console.log(`Selected reward: ${reward.name}`);
    });

    this.events.on("core-damage", (health: number) => {
      const damageText = isMobile
        ? `W:${this.gameManager.getCurrentWave()} | HP:${health} | G:${this.gameManager.getGold()}`
        : `Wave: ${this.gameManager.getCurrentWave()} | HP: ${health} | Gold: ${this.gameManager.getGold()}`;
      infoText.setText(damageText);
    });

    this.events.on("gold-changed", (gold: number) => {
      const goldText = isMobile
        ? `W:${this.gameManager.getCurrentWave()} | HP:${this.gameManager.getCoreHealth()} | G:${gold}`
        : `Wave: ${this.gameManager.getCurrentWave()} | HP: ${this.gameManager.getCoreHealth()} | Gold: ${gold}`;
      infoText.setText(goldText);
    });

    // 초기 정보 설정
    const initialText = isMobile
      ? `W:1 Ready | HP:20 | G:100`
      : `Wave: 1 Ready | HP: 20 | Gold: 100`;
    infoText.setText(initialText);

    // 타워 설치 완료 이벤트 처리
    this.events.on("tower-placement-completed", () => {
      console.log(
        "Tower placement completed event received, showing start button"
      );
      startButton.setVisible(true);
    });

    // 웨이브 완료 알림 추가
    this.events.on("wave-completed", (wave: number) => {
      this.showWaveCompleteNotification(wave);
    });
  }

  private showWaveCompleteNotification(waveNumber: number): void {
    const { width, height } = this.scale.gameSize;

    const isMobile = width < 800 || height < 600;
    const notification = this.add
      .text(width / 2, height / 2, `웨이브 ${waveNumber} 완료!`, {
        fontSize: isMobile ? "36px" : "48px",
        color: "#FFD700",
        backgroundColor: "#000000",
        padding: { x: isMobile ? 30 : 40, y: isMobile ? 15 : 20 },
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    notification.setScale(0);

    this.tweens.add({
      targets: notification,
      scale: 1,
      duration: 300,
      ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              notification.destroy();
            },
          });
        });
      },
    });
  }

  update() {
    if (this.monsterManager) {
      this.monsterManager.update();
    }
    if (this.waveManager) {
      this.waveManager.update();
    }
    if (this.towerManager) {
      this.towerManager.update();
    }
  }
}
