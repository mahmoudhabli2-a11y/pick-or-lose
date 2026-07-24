import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadLeaderboard, type LBEntry } from "@/lib/quiz-data";
import { Trophy, ArrowRight, Medal, Crown } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "المتصدرون — تحدّي" },
      { name: "description", content: "أفضل اللاعبين ونتائجهم في لعبة تحدّي." },
      { property: "og:title", content: "المتصدرون" },
      { property: "og:description", content: "أعلى النتائج في تحدّي." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [entries, setEntries] = useState<LBEntry[]>([]);
  useEffect(() => setEntries(loadLeaderboard().sort((a, b) => b.score - a.score)), []);

  return (
    <div className="min-h-screen px-5 pt-8 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div className="flex items-center justify-between text-white">
          <Link
            to="/"
            className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="text-2xl font-black drop-shadow-lg flex items-center gap-2">
            <Trophy className="size-6 text-[color:var(--fun-3)]" />
            المتصدرون
          </h1>
          <div className="w-10" />
        </div>

        {/* Podium */}
        {entries.length >= 3 && (
          <div className="mt-8 grid grid-cols-3 gap-2 items-end animate-pop">
            <PodiumSpot rank={2} entry={entries[1]} height="h-24" tint="fun-2" />
            <PodiumSpot rank={1} entry={entries[0]} height="h-32" tint="fun-3" crown />
            <PodiumSpot rank={3} entry={entries[2]} height="h-20" tint="fun-1" />
          </div>
        )}

        {/* List */}
        <div className="mt-6 flex-1 rounded-3xl bg-white shadow-fun p-4 animate-float-up">
          <div className="text-sm font-bold text-muted-foreground mb-2 px-2">جميع المتصدرين</div>
          <div className="space-y-2">
            {entries.length === 0 && (
              <p className="text-center text-muted-foreground py-8 font-semibold">لا توجد نتائج بعد. كن أول اللاعبين!</p>
            )}
            {entries.map((e, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${i < 3 ? "bg-gradient-card" : "bg-muted/50"}`}
              >
                <div className={`size-9 rounded-xl flex items-center justify-center font-black text-white ${
                  i === 0 ? "bg-[color:var(--fun-3)]" : i === 1 ? "bg-[color:var(--fun-2)]" : i === 2 ? "bg-[color:var(--fun-1)]" : "bg-[color:var(--muted-foreground)]"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-foreground truncate">{e.name}</div>
                </div>
                <div className="flex items-center gap-1 font-black text-[color:var(--primary)]">
                  <Medal className="size-4 text-[color:var(--fun-3)]" />
                  {e.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/game"
          className="mt-4 rounded-3xl bg-white text-[color:var(--primary)] px-6 py-4 text-lg font-black shadow-fun text-center active:translate-y-1 transition"
        >
          العب واصعد للقمة
        </Link>
      </div>
    </div>
  );
}

function PodiumSpot({ rank, entry, height, tint, crown }: { rank: number; entry: LBEntry; height: string; tint: string; crown?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        {crown && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 size-6 text-[color:var(--fun-3)] fill-current" />}
        <div className={`size-14 rounded-full bg-[color:var(--${tint})] flex items-center justify-center text-white font-black text-lg border-4 border-white shadow-fun`}>
          {entry.name[0]}
        </div>
      </div>
      <div className="text-white text-sm font-black truncate max-w-full">{entry.name}</div>
      <div className="text-white/85 text-xs font-bold">{entry.score} نقطة</div>
      <div className={`mt-2 ${height} w-full rounded-t-2xl bg-white/95 flex items-start justify-center pt-2 font-black text-[color:var(--primary)] text-2xl shadow-card`}>
        {rank}
      </div>
    </div>
  );
}
