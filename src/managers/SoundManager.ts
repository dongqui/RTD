import { LocalStorage } from "../data/LocalStorage";

/**
 * SoundManager - Centralized sound management system
 *
 * Features:
 * - Global volume control
 * - Mute/unmute functionality
 * - Settings persistence (준비됨)
 * - Single source of truth for all sound playback
 */

interface SoundSettings {
  masterVolume: number;
  bgmVolume: number;
  isMuted: boolean;
  isBGMMuted: boolean;
}

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  masterVolume: 1.0,
  bgmVolume: 0.5,
  isMuted: false,
  isBGMMuted: false,
};

interface SoundConfig {
  volume?: number;
  loop?: boolean;
  rate?: number;
  detune?: number;
  seek?: number;
  delay?: number;
}

export class SoundManager {
  private static instance: SoundManager | null = null;
  private scene: Phaser.Scene | null = null;

  private _masterVolume: number = 1.0; // 0.0 to 1.0
  private _bgmVolume: number = 0.5; // BGM volume (0.0 to 1.0)
  private _isMuted: boolean = false;
  private _isBGMMuted: boolean = false;
  private currentBGM: Phaser.Sound.BaseSound | null = null;
  private currentBGMKey: string | null = null;

  private constructor() {
    // Load settings from localStorage
    this.loadSettings();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize with a Phaser scene
   */
  public init(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * Play a sound effect
   */
  public play(soundKey: string, config?: SoundConfig): Phaser.Sound.BaseSound | null {
    if (!this.scene) {
      console.warn('[SoundManager] Scene not initialized');
      return null;
    }

    if (this._isMuted) {
      console.log('[SoundManager] Sound is muted');
      return null;
    }

    const finalConfig = {
      ...config,
      volume: (config?.volume ?? 1.0) * this._masterVolume,
    };

    console.log('[SoundManager] Playing sound:', soundKey, 'with config:', finalConfig);
    this.scene.sound.play(soundKey, finalConfig);
    return this.scene.sound.get(soundKey);
  }

  /**
   * Play a sound with a delay
   */
  public playDelayed(soundKey: string, delay: number, config?: SoundConfig): void {
    if (!this.scene) {
      console.warn('[SoundManager] playDelayed - Scene not initialized');
      return;
    }

    if (this._isMuted) {
      console.log('[SoundManager] playDelayed - Sound is muted');
      return;
    }

    console.log('[SoundManager] playDelayed - Scheduling sound:', soundKey, 'delay:', delay);
    this.scene.time.delayedCall(delay, () => {
      this.play(soundKey, config);
    });
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  public setMasterVolume(volume: number): void {
    this._masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  /**
   * Get master volume
   */
  public getMasterVolume(): number {
    return this._masterVolume;
  }

  /**
   * Mute all sounds
   */
  public mute(): void {
    this._isMuted = true;
    this.saveSettings();
  }

  /**
   * Unmute all sounds
   */
  public unmute(): void {
    this._isMuted = false;
    this.saveSettings();
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    this._isMuted = !this._isMuted;
    this.saveSettings();
    return this._isMuted;
  }

  /**
   * Check if muted
   */
  public isMuted(): boolean {
    return this._isMuted;
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    const settings: SoundSettings = {
      masterVolume: this._masterVolume,
      bgmVolume: this._bgmVolume,
      isMuted: this._isMuted,
      isBGMMuted: this._isBGMMuted,
    };
    LocalStorage.set("soundSettings", settings);
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    const settings = LocalStorage.get<SoundSettings>(
      "soundSettings",
      DEFAULT_SOUND_SETTINGS
    );
    this._masterVolume = settings.masterVolume;
    this._bgmVolume = settings.bgmVolume;
    this._isMuted = settings.isMuted;
    this._isBGMMuted = settings.isBGMMuted;
  }

  /**
   * Reset to default settings
   */
  public reset(): void {
    this._masterVolume = 1.0;
    this._bgmVolume = 0.5;
    this._isMuted = false;
    this._isBGMMuted = false;
    this.saveSettings();
  }

  // ==================== BGM Methods ====================

  /**
   * Play background music (stops current BGM if playing)
   */
  public playBGM(bgmKey: string): void {
    if (!this.scene) {
      console.warn('[SoundManager] playBGM - Scene not initialized');
      return;
    }

    // 같은 BGM이 이미 재생 중이면 무시
    if (this.currentBGMKey === bgmKey && this.currentBGM) {
      return;
    }

    // 기존 BGM 중지
    this.stopBGM();

    if (this._isBGMMuted) {
      this.currentBGMKey = bgmKey; // 나중에 unmute 시 재생하기 위해 저장
      return;
    }

    const volume = this._bgmVolume * this._masterVolume;
    this.currentBGM = this.scene.sound.add(bgmKey, {
      volume,
      loop: true,
    });
    this.currentBGM.play();
    this.currentBGMKey = bgmKey;
    console.log('[SoundManager] Playing BGM:', bgmKey);
  }

  /**
   * Stop current background music
   */
  public stopBGM(): void {
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM.destroy();
      this.currentBGM = null;
    }
  }

  /**
   * Set BGM volume (0.0 to 1.0)
   */
  public setBGMVolume(volume: number): void {
    this._bgmVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentBGM && 'setVolume' in this.currentBGM) {
      (this.currentBGM as Phaser.Sound.WebAudioSound).setVolume(
        this._bgmVolume * this._masterVolume
      );
    }
    this.saveSettings();
  }

  /**
   * Get BGM volume
   */
  public getBGMVolume(): number {
    return this._bgmVolume;
  }

  /**
   * Mute BGM (just sets volume to 0, doesn't stop)
   */
  public muteBGM(): void {
    this._isBGMMuted = true;
    if (this.currentBGM && "setVolume" in this.currentBGM) {
      (this.currentBGM as Phaser.Sound.WebAudioSound).setVolume(0);
    }
    this.saveSettings();
  }

  /**
   * Unmute BGM (restores volume)
   */
  public unmuteBGM(): void {
    this._isBGMMuted = false;
    if (this.currentBGM && "setVolume" in this.currentBGM) {
      (this.currentBGM as Phaser.Sound.WebAudioSound).setVolume(
        this._bgmVolume * this._masterVolume
      );
    }
    this.saveSettings();
  }

  /**
   * Toggle BGM mute state
   */
  public toggleBGMMute(): boolean {
    if (this._isBGMMuted) {
      this.unmuteBGM();
    } else {
      this.muteBGM();
    }
    return this._isBGMMuted;
  }

  /**
   * Check if BGM is muted
   */
  public isBGMMuted(): boolean {
    return this._isBGMMuted;
  }

  /**
   * Cleanup
   */
  public static destroy(): void {
    if (SoundManager.instance) {
      SoundManager.instance = null;
    }
  }
}
