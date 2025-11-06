/**
 * SoundManager - Centralized sound management system
 *
 * Features:
 * - Global volume control
 * - Mute/unmute functionality
 * - Settings persistence (준비됨)
 * - Single source of truth for all sound playback
 */

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
  private _isMuted: boolean = false;

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
    if (!this.scene || this._isMuted) {
      return null;
    }

    const finalConfig = {
      ...config,
      volume: (config?.volume ?? 1.0) * this._masterVolume,
    };

    return this.scene.sound.play(soundKey, finalConfig);
  }

  /**
   * Play a sound with a delay
   */
  public playDelayed(soundKey: string, delay: number, config?: SoundConfig): void {
    if (!this.scene || this._isMuted) {
      return;
    }

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
    try {
      const settings = {
        masterVolume: this._masterVolume,
        isMuted: this._isMuted,
      };
      localStorage.setItem('soundSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('soundSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this._masterVolume = settings.masterVolume ?? 1.0;
        this._isMuted = settings.isMuted ?? false;
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  /**
   * Reset to default settings
   */
  public reset(): void {
    this._masterVolume = 1.0;
    this._isMuted = false;
    this.saveSettings();
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
