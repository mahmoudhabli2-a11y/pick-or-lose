import { useState } from "react";
import { Gift, X } from "lucide-react";
import { ModalShell } from "@/components/rewarded-ad";
import { addHearts } from "@/lib/hearts";
import { loadPlayer, savePlayer, levelFromXp } from "@/lib/quiz-data";
import { sfxReward, sfxTap } from "@/lib/fx";

const KEY = "tahaddi-wheel-day";

export type WheelPrize = { label: string; emoji: string; kind: "hearts" | "xp"; amount: number };

const PRIZES: WheelPrize[] = [
  { label: "قلب واحد", emoji: "❤️", kind: "hearts", amount: 1 },
  { label: "٢٥ نقطة خبرة", emoji: "⚡", kind: "xp", amount: 25 },
  { label: "قلبان", emoji: "💖", kind: "hearts", amount: 2 },
  { label: "٥٠ نقطة خبرة", emoji: "✨", kind: "xp", amount: 50 },
  { label: "٣ قلوب", emoji: "💝", kind: "hearts", amount: 3 },
  { label: "١٠٠ نقطة خبرة", emoji: "🌟", kind: "xp", amount: 100 },
];

function today() {
  return Math.floor(Date.now() / 86400000);
}

export function wheelAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Number(localStorage.getItem(KEY)) !== today();
  } catch {
    return false;
  }
}

function markClaimed() {
  try {
    localStorage.setItem(KEY, String(today()));
  } catch {}
}

/** عجلة الحظ اليومية — مرة واحدة كل يوم. */
export function DailyWheel({ onClose }: { onClose: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [prize, setPrize] = useState<WheelPrize | null>(null);

  function spin() {
    if (spinning || prize) return;
    sfxTap();
    setSpinning(true);
    const idx = Math.floor(Math.random() * PRIZES.length);
    const seg = 360 / PRIZES.length;
    const target = 360 * 5 + (360 - (idx * seg + seg / 2));
    setAngle(target);
    setTimeout(() => {
      const won = PRIZES[idx];
      if (won.kind === "hearts") {
        addHearts(won.amount);
      } else {
        const p = loadPlayer();
        const xp = p.xp + won.amount;
        savePlayer({ ...p, xp, level: Math.max(p.level, levelFromXp(xp)), score: p.score + won.amount });
      }
      markClaimed();
      sfxReward();
      setSpinning(false);
      setPrize(won);
    }, 2600);
  }

  const seg = 360 / PRIZES.length;

  return (
    <ModalShell
      emoji="🎡"
      title="عجلة الحظ اليومية"
      subtitle={prize ? "مبروك! هذه جائزتك اليوم" : "لفّة واحدة كل يوم — اربح قلوباً أو نقاط خبرة"}
    >
      <div className="relative mx-auto size-52">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10 text-2xl">🔻</div>
        <div
          className="size-52 rounded-full border-8 border-white shadow-fun overflow-hidden relative"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: "transform 2.5s cubic-bezier(.15,.9,.2,1)",
            background: `conic-gradient(${PRIZES.map((_, i) => {
              const colors = [
                "var(--fun-1)",
                "var(--fun-2)",
                "var(--fun-3)",
                "var(--fun-4)",
                "var(--fun-5)",
                "var(--primary)",
              ];
              return `${colors[i % colors.length]} ${i * seg}deg ${(i + 1) * seg}deg`;
            }).join(", ")})`,
          }}
        >
          {PRIZES.map((pz, i) => (
            <span
              key={pz.label}
              className="absolute left-1/2 top-1/2 text-xl"
              style={{
                transform: `rotate(${i * seg + seg / 2}deg) translateY(-72px)`,
                transformOrigin: "0 0",
              }}
            >
              {pz.emoji}
            </span>
          ))}
        </div>
      </div>

      {prize ? (
        <>
          <div className="rounded-2xl bg-gradient-success text-white px-4 py-3 font-black">
            {prize.emoji} فزت بـ {prize.label}
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-primary text-white py-3.5 font-black shadow-card"
          >
            هيا نلعب!
          </button>
        </>
      ) : (
        <>
          <button
            onClick={spin}
            disabled={spinning}
            className="w-full rounded-2xl bg-gradient-primary text-white py-3.5 font-black shadow-card disabled:opacity-70 inline-flex items-center justify-center gap-2"
          >
            <Gift className="size-5" />
            {spinning ? "جارٍ اللف…" : "لُفّ العجلة"}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-muted text-foreground py-3 font-bold inline-flex items-center justify-center gap-2"
          >
            <X className="size-4" /> لاحقاً
          </button>
        </>
      )}
    </ModalShell>
  );
}
