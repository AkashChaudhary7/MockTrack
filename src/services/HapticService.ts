/**
 * HapticService: Provides tactile/vibrational feedback for PWA & future Capacitor builds.
 * Uses Web Vibration API (navigator.vibrate) when supported.
 */
export class HapticService {
  private static isSupported(): boolean {
    return typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator;
  }

  // Light tap for button press or tab selection
  static lightTap(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(12);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Medium selection click
  static selection(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Success confirmation pulse
  static success(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([25, 50, 25]);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Personal Best achievement double pulse
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
