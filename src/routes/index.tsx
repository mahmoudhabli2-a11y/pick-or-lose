import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadPlayer, type PlayerState } from "@/lib/quiz-data";
import { Heart, Trophy, Zap, Calendar, Play, Medal } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تحدّي — الرئيسية" },
      { name: "description", content: "ابدأ اللعب في تحدّي: أسئلة سريعة، 5 ثوانٍ لكل سؤال." },
      { property: "og:title", content: "تحدّي — الرئيسية" },
      { property: "og:description", content: "أسئلة عربية سريعة الإيقاع. ابدأ اللعب الآن." },
    ],
  }),
  component: Home,
});

function Home() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  useEffect(() => setPlayer(loadPlayer()), []);

  const p = player ?? { score: 0, level: 1, lives: 3, bestScore: 0, lastDailyDay: null };

  return (
    <div className="min-h-screen px-5 pt-10 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        {/* Logo */}
        <div className="text-center animate-pop">
          <div className="inline-block rounded-3xl bg-white/15 backdrop-blur-sm px-6 py-2 mb-4 border border-white/20">
            <span className="text-white/90 text-sm font-bold tracking-wider">🏆 تحدّى عقلك</span>
          </div>
          <h1 className="text-7xl font-black text-white leading-tight drop-shadow-lg">
            تحدّي
          </h1>
          <p className="mt-3 text-white/85 font-semibold text-lg">
            ٥ ثوانٍ فقط لكل سؤال ⏱️
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-3 animate-float-up">
          <StatCard icon={<Trophy className="size-5" />} label="النقاط" value={p.score} tint="fun-3" />
          <StatCard icon={<Zap className="size-5" />} label="المستوى" value={p.level} tint="fun-2" />
          <StatCard icon={<Heart className="size-5 fill-current" />} label="القلوب" value={p.lives} tint="fun-1" />
        </div>

        {/* Best score chip */}
        <div className="mt-4 flex justify-center animate-float-up">
          <div className="rounded-full bg-white/15 backdrop-blur-sm px-5 py-2 border border-white/20 flex items-center gap-2 text-white">
            <Medal className="size-4 text-[color:var(--fun-3)]" />
            <span className="text-sm font-bold">أعلى نتيجة: {p.bestScore}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex-1 flex flex-col justify-end gap-3">
          <Link
            to="/game"
            className="group relative block w-full rounded-3xl bg-white text-[color:var(--primary)] px-6 py-5 text-2xl font-black text-center shadow-fun active:translate-y-1 transition-transform"
          >
            <span className="inline-flex items-center gap-3">
              <Play className="size-7 fill-current" />
              ابدأ اللعب
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/daily"
              className="rounded-2xl bg-gradient-accent text-white px-4 py-4 font-bold text-center shadow-card active:translate-y-0.5 transition-transform flex flex-col items-center gap-1"
            >
              <Calendar className="size-6" />
              <span>تحدي اليوم</span>
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-2xl bg-gradient-primary text-white px-4 py-4 font-bold text-center shadow-card active:translate-y-0.5 transition-transform flex flex-col items-center gap-1"
            >
              <Trophy className="size-6" />
              <span>المتصدرون</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: string }) {
  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur px-3 py-4 shadow-card text-center">
      <div className={`mx-auto mb-1 inline-flex size-9 items-center justify-center rounded-full text-[color:var(--${tint})] bg-[color:var(--${tint})]/15`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-foreground leading-none">{value}</div>
      <div className="text-xs font-semibold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
