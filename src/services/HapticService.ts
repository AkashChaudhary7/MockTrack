/**
 * HapticService: Provides tactile/vibrational feedback for PWA & mobile browsers.
 * Uses Web Vibration API (navigator.vibrate) when supported.
 */
export class HapticService {
  public static isSupported(): boolean {
    return typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator;
  }

  // Light tap for button press or tab selection
  static lightTap(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(15);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Medium selection click (e.g. switching profile, toggling filter)
  static selection(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(25);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Success confirmation pulse (e.g. saving mock test or goal date)
  static success(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([30, 50, 30]);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Achievement / Major milestone pulse (e.g. mock logged, PDF exported)
  static achievement(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([40, 60, 40, 60, 80]);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Warning pulse
  static warning(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Error buzz
  static error(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([50, 100, 50, 100]);
      } catch (e) {
        /* ignore */
      }
    }
  }
}

