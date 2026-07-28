import { useEffect, useState } from "react";
import { PlayCircle, Loader2 } from "lucide-react";
import { sfxReward, sfxTap } from "@/lib/fx";
import { hasNativeAds, showRewardedAd } from "@/lib/ads";

/** Rewarded-video ad button (AdMob on native, simulated playback on web). */
export function RewardedAdButton({
  label,
  onReward,
  className = "",
}: {
  label: string;
  onReward: () => void;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [left, setLeft] = useState(3);

  useEffect(() => {
    if (!playing) return;
    if (left <= 0) {
      setPlaying(false);
      sfxReward();
      onReward();
      return;
    }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, left]);

  async function start() {
    if (playing) return;
    sfxTap();
    if (hasNativeAds()) {
      setPlaying(true);
      setLeft(-1); // no countdown; native ad drives the flow
      const ok = await showRewardedAd();
      setPlaying(false);
      if (ok) {
        sfxReward();
        onReward();
      }
      return;
    }
    setLeft(3);
    setPlaying(true);
  }

  return (
    <button
      onClick={start}
      disabled={playing}
      className={`w-full rounded-2xl bg-gradient-primary text-white px-4 py-3.5 font-black shadow-card active:translate-y-0.5 transition flex items-center justify-center gap-2 disabled:opacity-80 ${className}`}
    >

      {playing ? (
        <>
          <Loader2 className="size-5 animate-spin" />
          الإعلان قيد التشغيل… {left}
        </>
      ) : (
        <>
          <PlayCircle className="size-5" />
          {label}
        </>
      )}
    </button>
  );
}

export function ModalShell({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-fun p-6 text-center animate-pop">
        <div className="text-6xl mb-2">{emoji}</div>
        <h2 className="text-2xl font-black text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-bold text-muted-foreground">{subtitle}</p>}
        <div className="mt-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}
