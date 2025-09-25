import { GridSystem } from "../GridSystem";
import CameraManager from "../CameraManager";
import GameManager from "../GameManager";
import { TowerManager } from "../TowerManager";
import { WaveManager } from "../WaveManager";
import { PathfindingSystem } from "../PathfindingSystem";
import { MonsterManager } from "../MonsterManager";

export default class GameScene extends Phaser.Scene {
  private gridSystem: GridSystem;
  private cameraManager: CameraManager;
  private gameManager: GameManager;
  private towerManager: TowerManager;
  private waveManager: WaveManager;
  private pathfindingSystem: PathfindingSystem;
  private monsterManager: MonsterManager;

  constructor() {
    super("GameScene");
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
    ); // 2x2의 중앙

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
      .setDisplaySize(256, 256)
      .play("king_idle");

    this.cameraManager.centerOn(castleWorldPos.x, castleWorldPos.y);

    // King 위치는 몬스터가 도달할 수 있도록 occupied로 설정하지 않음
  }

  private setupGrid() {
    this.gridSystem = new GridSystem(this, 80, 31, 31);
    this.gridSystem.showGrid();

    this.data.set("gridSystem", this.gridSystem);

    // 중앙에 2x2 castle 배치 (31x31 그리드의 중앙)
  }

  private setupTowerManager() {
    this.towerManager = new TowerManager(
      this,
      this.gridSystem,
      this.gameManager,
      this.monsterManager
    );

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

  private setupGameEventHandlers() {
    this.events.on("wave-prepared", (waveNumber: number) => {
      console.log(`Wave ${waveNumber} prepared. Tap to start!`);
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
    // Start Wave 버튼
    const startButton = this.add
      .text(100, 50, "START WAVE", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#4CAF50",
        padding: { x: 20, y: 10 },
      })
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

    // 게임 정보 표시
    const infoText = this.add
      .text(20, 20, "", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0);

    // 게임 상태 업데이트
    this.events.on("wave-started", (wave: number) => {
      infoText.setText(
        `Wave: ${wave} | HP: ${this.gameManager.getCoreHealth()} | Gold: ${this.gameManager.getGold()}`
      );
      startButton.setVisible(false);
    });

    this.events.on("wave-prepared", (wave: number) => {
      infoText.setText(
        `Wave: ${wave} Ready | HP: ${this.gameManager.getCoreHealth()} | Gold: ${this.gameManager.getGold()}`
      );
      startButton.setVisible(true);
    });

    this.events.on("core-damage", (health: number) => {
      infoText.setText(
        `Wave: ${this.gameManager.getCurrentWave()} | HP: ${health} | Gold: ${this.gameManager.getGold()}`
      );
    });

    this.events.on("gold-changed", (gold: number) => {
      infoText.setText(
        `Wave: ${this.gameManager.getCurrentWave()} | HP: ${this.gameManager.getCoreHealth()} | Gold: ${gold}`
      );
    });

    // 초기 정보 설정
    infoText.setText(`Wave: 1 Ready | HP: 20 | Gold: 100`);

    // 웨이브 완료 알림 추가
    this.events.on("wave-completed", (wave: number) => {
      this.showWaveCompleteNotification(wave);
    });
  }

  private showWaveCompleteNotification(waveNumber: number): void {
    const { width, height } = this.scale.gameSize;

    const notification = this.add
      .text(width / 2, height / 2, `웨이브 ${waveNumber} 완료!`, {
        fontSize: "48px",
        color: "#FFD700",
        backgroundColor: "#000000",
        padding: { x: 40, y: 20 },
        align: "center"
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
            }
          });
        });
      }
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
