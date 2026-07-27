import { useState } from "react";
import { Gift, X } from "lucide-react";
import { ModalShell } from "@/components/rewarded-ad";
import { Confetti } from "@/components/confetti";
import { addHearts } from "@/lib/hearts";
import { loadPlayer, savePlayer, levelFromXp } from "@/lib/quiz-data";
import { sfxReward, sfxLevelUp, sfxTap } from "@/lib/fx";

const KEY = "tahaddi-wheel-at";
const LEGACY_KEY = "tahaddi-wheel-day";
const DAY_MS = 86400000;

export type WheelPrize = { label: string; emoji: string; kind: "hearts" | "xp"; amount: number };

const PRIZES: WheelPrize[] = [
  { label: "قلب واحد", emoji: "❤️", kind: "hearts", amount: 1 },
  { label: "٢٥ نقطة خبرة", emoji: "⚡", kind: "xp", amount: 25 },
  { label: "قلبان", emoji: "💖", kind: "hearts", amount: 2 },
  { label: "٥٠ نقطة خبرة", emoji: "✨", kind: "xp", amount: 50 },
  { label: "٣ قلوب", emoji: "💝", kind: "hearts", amount: 3 },
  { label: "١٠٠ نقطة خبرة", emoji: "🌟", kind: "xp", amount: 100 },
];

function lastSpinAt(): number {
  if (typeof window === "undefined") return Date.now();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Number(raw) || 0;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return Number(legacy) * DAY_MS;
    return 0;
  } catch {
    return Date.now();
  }
}

/** الوقت المتبقي بالمللي ثانية حتى اللفة التالية (صفر إذا كانت متاحة). */
export function msUntilNextSpin(): number {
  if (typeof window === "undefined") return DAY_MS;
  return Math.max(0, lastSpinAt() + DAY_MS - Date.now());
}

export function wheelAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return msUntilNextSpin() === 0;
}

function markClaimed() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {}
}

/** عجلة الحظ اليومية — مرة واحدة كل ٢٤ ساعة. */
export function DailyWheel({ onClose }: { onClose: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [prize, setPrize] = useState<WheelPrize | null>(null);
  const locked = !wheelAvailable() && !prize;


  function spin() {
    if (spinning || prize || locked) return;
    sfxTap();
    setSpinning(true);
    const idx = Math.floor(Math.random() * PRIZES.length);
    const seg = 360 / PRIZES.length;
    const target = angle + 360 * 6 + (360 - (idx * seg + seg / 2)) - (angle % 360);
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
      sfxLevelUp();
      setSpinning(false);
      setPrize(won);
    }, 3800);
  }

  const seg = 360 / PRIZES.length;

  return (
    <ModalShell
      emoji="🎡"
      title="عجلة الحظ اليومية"
      subtitle={
        prize
          ? "مبروك! هذه جائزتك اليوم"
          : locked
            ? "لقد لففت العجلة اليوم — عد بعد ٢٤ ساعة"
            : "لفّة واحدة كل ٢٤ ساعة — اربح قلوباً أو نقاط خبرة"
      }
    >
      {prize && <Confetti />}

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
