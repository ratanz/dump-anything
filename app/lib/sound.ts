'use client';

/**
 * A simple, modular click sound manager for the application
 */
class ClickSoundManager {
  private static instance: ClickSoundManager;
  private enabled: boolean = true;
  private volume: number = 0.4;
  private soundPath: string = '/audio/mouse-click.mp3';

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  /**
   * Get the singleton instance of ClickSoundManager
   */
  public static getInstance(): ClickSoundManager {
    if (!ClickSoundManager.instance) {
      ClickSoundManager.instance = new ClickSoundManager();
    }
    return ClickSoundManager.instance;
  }

  /**
   * Load user settings from localStorage
   */
  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    
    // Load sound enabled/disabled preference
    const soundEnabled = localStorage.getItem('clickSoundEnabled');
    if (soundEnabled !== null) {
      this.enabled = soundEnabled === 'true';
    }
    
    // Load volume setting
    const volumeSetting = localStorage.getItem('clickSoundVolume');
    if (volumeSetting !== null) {
      const volume = parseFloat(volumeSetting);
      if (!isNaN(volume)) {
        this.volume = Math.max(0, Math.min(1, volume));
      }
    }
  }

  /**
   * Save current settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('clickSoundEnabled', String(this.enabled));
    localStorage.setItem('clickSoundVolume', String(this.volume));
  }

  /**
   * Play the click sound
   */
  public play(): void {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      // Create a new audio instance each time for better handling of rapid clicks
      const sound = new Audio(this.soundPath);
      sound.volume = this.volume;
      
      sound.play().catch(err => {
        console.log('Click sound playback failed:', err);
      });
    } catch (error) {
      console.error('Error playing click sound:', error);
    }
  }

  /**
   * Enable or disable click sound
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Check if click sound is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set the volume for click sound (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Get the current volume
   */
  public getVolume(): number {
    return this.volume;
  }
}

// Create singleton instance
export const clickSound = 
  typeof window !== 'undefined' ? ClickSoundManager.getInstance() : null;

/**
 * Play a click sound effect
 */
export function playClickSound(): void {
  clickSound?.play();
}

/**
 * Toggle click sound on/off
 */
export function toggleClickSound(enabled?: boolean): void {
  if (clickSound) {
    if (enabled !== undefined) {
      clickSound.setEnabled(enabled);
    } else {
      clickSound.setEnabled(!clickSound.isEnabled());
    }
  }
}

/**
 * Check if click sound is enabled
 */
export function isClickSoundEnabled(): boolean {
  return clickSound?.isEnabled() ?? false;
} 