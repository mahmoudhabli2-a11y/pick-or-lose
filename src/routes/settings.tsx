import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSettings, saveSettings, sfxTap, sfxCorrect, type GameSettings } from "@/lib/fx";
import { loadHearts, MAX_HEARTS, msUntilNextHeart, formatCountdown, addHearts } from "@/lib/hearts";
import { RewardedAdButton } from "@/components/rewarded-ad";
import { ChevronRight, Volume2, VolumeX, Vibrate, Heart } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — تحدي العقول" },
      { name: "description", content: "تحكّم في المؤثرات الصوتية والاهتزاز وقلوب اللعب في تحدي العقول." },
      { property: "og:title", content: "الإعدادات — تحدي العقول" },
      { property: "og:description", content: "تشغيل أو إيقاف الصوت والاهتزاز وإدارة القلوب." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<GameSettings>({ sound: true, vibrate: true });
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [nextIn, setNextIn] = useState(0);

  useEffect(() => {
    setS(loadSettings());
    setHearts(loadHearts().hearts);
    setNextIn(msUntilNextHeart());
    const t = setInterval(() => {
      setHearts(loadHearts().hearts);
      setNextIn(msUntilNextHeart());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function update(patch: Partial<GameSettings>) {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
    if (patch.sound) sfxCorrect();
    else sfxTap();
  }

  return (
    <div className="min-h-screen px-5 pt-6 pb-10">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between text-white">
          <h1 className="text-2xl font-black drop-shadow">الإعدادات</h1>
          <Link
            to="/"
            className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20"
            aria-label="رجوع"
          >
            <ChevronRight className="size-5" />
          </Link>
        </div>

        <div className="mt-5 rounded-3xl bg-white shadow-fun p-5 space-y-3">
          <Toggle
            on={s.sound}
            onChange={(v) => update({ sound: v })}
            label="المؤثرات الصوتية"
            desc="أصوات الإجابات والمؤقت والمستويات"
            icon={s.sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          />
          <Toggle
            on={s.vibrate}
            onChange={(v) => update({ vibrate: v })}
            label="الاهتزاز"
            desc="اهتزاز عند الإجابة الصحيحة والخاطئة"
            icon={<Vibrate className="size-5" />}
          />
        </div>

        <div className="mt-4 rounded-3xl bg-white shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-foreground">القلوب</div>
              <div className="text-xs font-bold text-muted-foreground">
                {hearts >= MAX_HEARTS ? "كل القلوب ممتلئة" : `القلب التالي بعد ${formatCountdown(nextIn)}`}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <Heart
                  key={i}
                  className={`size-5 ${i < hearts ? "fill-[color:var(--fun-1)] text-[color:var(--fun-1)]" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
          </div>
          {hearts < MAX_HEARTS && (
            <div className="mt-4">
              <RewardedAdButton
                label="شاهد إعلاناً واحصل على ❤️ +1"
                onReward={() => setHearts(addHearts(1))}
              />
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-white/80 text-xs font-bold">
          يتم تعبئة قلب واحد تلقائياً كل ٢٠ دقيقة
        </p>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
  desc,
  icon,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className="w-full flex items-center gap-3 text-right rounded-2xl bg-[color:var(--muted)] p-4 active:translate-y-0.5 transition"
    >
      <span
        className={`size-11 rounded-2xl flex items-center justify-center ${on ? "bg-gradient-primary text-white" : "bg-white text-muted-foreground"}`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-black text-foreground">{label}</span>
        <span className="block text-xs font-bold text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`w-12 h-7 rounded-full p-1 transition-colors ${on ? "bg-[color:var(--success)]" : "bg-muted-foreground/30"}`}
      >
        <span
          className={`block size-5 rounded-full bg-white shadow transition-transform ${on ? "-translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}
