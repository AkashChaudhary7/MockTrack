export interface AdConfig {
  testMode: boolean;
  bannerEnabled: boolean;
  nativeEnabled: boolean;
  interstitialEnabled: boolean;
  rewardedEnabled: boolean;
  interstitialCooldownSeconds: number;
  maxInterstitialsPerSession: number;
}

const DEFAULT_CONFIG: AdConfig = {
  testMode: false,
  bannerEnabled: false,
  nativeEnabled: false,
  interstitialEnabled: false,
  rewardedEnabled: false,
  interstitialCooldownSeconds: 999999,
  maxInterstitialsPerSession: 0,
};

class AdsManagerClass {
  private config: AdConfig = { ...DEFAULT_CONFIG };
  private lastInterstitialTime: number = 0;
  private sessionInterstitialCount: number = 0;
  private initialized: boolean = false;

  public initialize() {
    if (this.initialized) return;
    this.initialized = true;
    if ((import.meta as any).env?.DEV) {
      console.log("[AdMob AdsManager] Initialized with config:", this.config);
    }
  }

  public getConfig(): AdConfig {
    return this.config;
  }

  public setConfig(newConfig: Partial<AdConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public canShowInterstitial(): boolean {
    if (!this.config.interstitialEnabled) return false;
    if (this.sessionInterstitialCount >= this.config.maxInterstitialsPerSession) {
      return false;
    }
    const now = Date.now();
    const elapsedSeconds = (now - this.lastInterstitialTime) / 1000;
    return elapsedSeconds >= this.config.interstitialCooldownSeconds;
  }

  public recordInterstitialShown() {
    this.lastInterstitialTime = Date.now();
    this.sessionInterstitialCount += 1;
    if ((import.meta as any).env?.DEV) {
      console.log(`[AdMob AdsManager] Interstitial shown. Session count: ${this.sessionInterstitialCount}`);
    }
  }

  public recordUserAction() {
    if ((import.meta as any).env?.DEV) {
      console.log("[AdMob AdsManager] User action recorded");
    }
  }

  public resetSession() {
    this.sessionInterstitialCount = 0;
    this.lastInterstitialTime = 0;
  }
}

export const AdsManager = new AdsManagerClass();
