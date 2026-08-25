/**
 * AdService: Interface & implementation abstraction for PWA & Capacitor AdMob.
 * Handles initialization, banners, interstitials (with cooldowns), and rewarded callbacks.
 */

export interface AdConfig {
  cooldownMs: number;
  bannerEnabled: boolean;
  interstitialEnabled: boolean;
  rewardedEnabled: boolean;
}

const DEFAULT_CONFIG: AdConfig = {
  cooldownMs: 60000,
  bannerEnabled: false,
  interstitialEnabled: false,
  rewardedEnabled: false,
};

let lastInterstitialTime = 0;
let isInitialized = false;

export class AdService {
  static initialize(): void {
    if (isInitialized) return;
    isInitialized = true;
    console.log("[AdService] Initialized in PWA mode.");
  }

  static isInterstitialEligible(): boolean {
    const now = Date.now();
    return now - lastInterstitialTime >= DEFAULT_CONFIG.cooldownMs;
  }

  static async showInterstitial(context = "general"): Promise<boolean> {
    if (!DEFAULT_CONFIG.interstitialEnabled) return false;
    if (!this.isInterstitialEligible()) {
      console.log(`[AdService] Interstitial skipped due to cooldown (${context})`);
      return false;
    }

    lastInterstitialTime = Date.now();
    console.log(`[AdService] Interstitial displayed for context: ${context}`);
    // In Capacitor, this will call the native AdMob interstitial show method
    return true;
  }

  static async showRewardedBeforeDownload(onSuccess: () => void, onFailure: () => void): Promise<void> {
    console.log("[AdService] Preparing rewarded ad for report download...");
    
    // In PWA environment, invoke success callback after brief simulated delay if test mode, or grant directly
    setTimeout(() => {
      console.log("[AdService] Rewarded ad completed. Granting download reward.");
      onSuccess();
    }, 400);
  }
}
