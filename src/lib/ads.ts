// ============================================================
// AdMob rewarded video ads
// Uses the native AdMob bridge when the app runs inside a native
// shell (Capacitor / Android WebView). On plain web there is no
// AdMob rewarded SDK, so we fall back to a short simulated ad.
// ============================================================

export const ADMOB_REWARDED_AD_UNIT_ID = "ca-app-pub-5341059604474919/8598922158";

type NativeBridge = {
  showRewardedAd?: (adUnitId: string) => Promise<boolean> | boolean;
};

type CapacitorAdMob = {
  prepareRewardVideoAd: (opts: { adId: string }) => Promise<unknown>;
  showRewardVideoAd: () => Promise<unknown>;
};

function nativeBridge(): NativeBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { TahaddiAds?: NativeBridge }).TahaddiAds;
}

function capacitorAdMob(): CapacitorAdMob | undefined {
  if (typeof window === "undefined") return undefined;
  const cap = (window as unknown as { Capacitor?: { Plugins?: { AdMob?: CapacitorAdMob } } }).Capacitor;
  return cap?.Plugins?.AdMob;
}

export function hasNativeAds(): boolean {
  return Boolean(nativeBridge()?.showRewardedAd || capacitorAdMob());
}

/** Shows a rewarded video ad. Resolves true when the reward is earned. */
export async function showRewardedAd(): Promise<boolean> {
  const bridge = nativeBridge();
  if (bridge?.showRewardedAd) {
    try {
      return (await bridge.showRewardedAd(ADMOB_REWARDED_AD_UNIT_ID)) !== false;
    } catch {
      return false;
    }
  }

  const admob = capacitorAdMob();
  if (admob) {
    try {
      await admob.prepareRewardVideoAd({ adId: ADMOB_REWARDED_AD_UNIT_ID });
      await admob.showRewardVideoAd();
      return true;
    } catch {
      return false;
    }
  }

  // Web fallback: simulated ad playback handled by the caller's countdown.
  return true;
}
