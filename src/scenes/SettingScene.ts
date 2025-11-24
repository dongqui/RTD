import { StyledText } from "../ui/StyledText";
import { Button } from "../ui/Button";
import { SoundManager } from "../managers/SoundManager";
import { Slider } from "../ui/Slider";
import { ConfirmModal } from "../ui/ConfirmModal";
import PlayerDeckManager from "../managers/PlayerDeckManager";
import CurrencyManager from "../managers/CurrencyManager";
import { WaveManager } from "../managers/WaveManager";

export default class SettingScene extends Phaser.Scene {
  private sfxSlider?: Slider;
  private bgmSlider?: Slider;
  private resetModal?: ConfirmModal;

  constructor() {
    super("SettingScene");
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0, 0);

    const soundManager = SoundManager.getInstance();

    const labelX = 80;
    const sliderX = width / 2;
    const sliderWidth = width / 2 - 100;

    // SFX (Sound Effects) Section - 상단
    const sfxLabelY = 160;
    new StyledText(this, labelX, sfxLabelY, {
      text: "효과음",
      fontSize: "24px",
      color: "#ffffff",
    }).setOrigin(0, 0.5);

    this.sfxSlider = new Slider(this, sliderX, sfxLabelY, {
      width: sliderWidth,
      value: soundManager.isMuted() ? 0 : soundManager.getMasterVolume(),
      onChange: (value) => {
        if (value === 0) {
          soundManager.mute();
        } else {
          soundManager.unmute();
          soundManager.setMasterVolume(value);
        }
      },
    });

    // BGM Section - 상단
    const bgmLabelY = 230;
    new StyledText(this, labelX, bgmLabelY, {
      text: "배경음악",
      fontSize: "24px",
      color: "#ffffff",
    }).setOrigin(0, 0.5);

    this.bgmSlider = new Slider(this, sliderX, bgmLabelY, {
      width: sliderWidth,
      value: soundManager.isBGMMuted() ? 0 : soundManager.getBGMVolume(),
      onChange: (value) => {
        if (value === 0) {
          soundManager.muteBGM();
        } else {
          soundManager.unmuteBGM();
          soundManager.setBGMVolume(value);
        }
      },
    });

    // Reset Game Button - 하단 왼쪽 정렬
    const resetButtonY = height - 200;
    const buttonWidth = 280;
    new Button(this, labelX + buttonWidth / 2, resetButtonY, {
      text: "게임 포기하기",
      width: buttonWidth,
      height: 70,
      color: "red",
      textStyle: {
        fontSize: "24px",
      },
      onClick: () => this.showResetConfirmation(),
    });

    // Create reset confirmation modal
    this.resetModal = new ConfirmModal(this, {
      message: "게임을 정말 포기하시겠습니까?\n모든 진행 상황이 초기화됩니다.",
      confirmText: "확인",
      cancelText: "취소",
      onConfirm: () => this.resetGame(),
      onCancel: () => {},
    });
  }

  private showResetConfirmation(): void {
    this.resetModal?.show();
  }

  private resetGame(): void {
    // Reset all game progress
    PlayerDeckManager.getInstance().reset();
    CurrencyManager.getInstance().reset();
    WaveManager.getInstance().reset();

    // Navigate to SummonScene
    const sceneManager = this.scene;
    sceneManager.stop("SettingScene");
    sceneManager.start("SummonScene");
  }
}
