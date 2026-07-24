import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addLeaderboardEntry } from "@/lib/quiz-data";
import { RotateCw, Home, Trophy, Check, X, Save } from "lucide-react";

type Result = { score: number; correct: number; wrong: number; total: number };

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "النتيجة — اختار أو اخسر" },
      { name: "description", content: "نتيجتك النهائية: نقاط، إجابات صحيحة وخاطئة." },
      { property: "og:title", content: "النتيجة — اختار أو اخسر" },
      { property: "og:description", content: "نتيجتك بعد التحدي." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ekhtar-last-game");
      if (raw) setResult(JSON.parse(raw));
    } catch {}
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-white">
        <div className="text-center">
          <p className="font-bold mb-4">لا توجد نتائج بعد.</p>
          <Link to="/game" className="rounded-2xl bg-white text-[color:var(--primary)] px-6 py-3 font-black">
            العب الآن
          </Link>
        </div>
      </div>
    );
  }

  const total = result.total || result.correct + result.wrong;
  const pct = total > 0 ? Math.round((result.correct / total) * 100) : 0;
  const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "💪";
  const title = pct >= 80 ? "بطل!" : pct >= 50 ? "أداء جيد" : "حاول مجدداً";

  function saveScore() {
    addLeaderboardEntry(name.trim() || "لاعب", result!.score);
    setSaved(true);
  }

  return (
    <div className="min-h-screen px-5 pt-8 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div className="text-center animate-pop">
          <div className="text-7xl mb-2">{emoji}</div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{title}</h1>
          <p className="mt-2 text-white/85 font-semibold">
            حصلت على {pct}% من الإجابات الصحيحة
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-white shadow-fun p-6 animate-float-up">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">النقاط الإجمالية</span>
            <span className="inline-flex items-center gap-2 text-3xl font-black text-[color:var(--primary)]">
              <Trophy className="size-6 text-[color:var(--fun-3)]" />
              {result.score}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatBox tone="success" icon={<Check className="size-5" />} label="صحيحة" value={result.correct} />
            <StatBox tone="danger" icon={<X className="size-5" />} label="خاطئة" value={result.wrong} />
          </div>
        </div>

        {/* Save to leaderboard */}
        <div className="mt-4 rounded-3xl bg-white/95 shadow-card p-5 animate-float-up">
          <label className="text-sm font-bold text-muted-foreground">أضف اسمك للمتصدرين</label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saved}
              placeholder="اسمك"
              className="flex-1 rounded-xl border-2 border-[color:var(--border)] bg-white px-4 py-3 font-bold text-foreground focus:outline-none focus:border-[color:var(--primary)] text-right"
            />
            <button
              onClick={saveScore}
              disabled={saved}
              className="rounded-xl bg-gradient-primary text-white px-4 font-black shadow-card disabled:opacity-60 active:translate-y-0.5 transition"
            >
              {saved ? <Check className="size-5" /> : <Save className="size-5" />}
            </button>
          </div>
          {saved && <p className="mt-2 text-sm font-bold text-[color:var(--success)]">✓ تم الحفظ في المتصدرين</p>}
        </div>

        <div className="mt-auto pt-6 grid grid-cols-1 gap-3">
          <button
            onClick={() => navigate({ to: "/game" })}
            className="rounded-3xl bg-white text-[color:var(--primary)] px-6 py-4 text-xl font-black shadow-fun active:translate-y-1 transition flex items-center justify-center gap-2"
          >
            <RotateCw className="size-6" />
            العب مرة أخرى
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/leaderboard" className="rounded-2xl bg-gradient-accent text-white px-4 py-3 font-bold text-center shadow-card active:translate-y-0.5 transition flex items-center justify-center gap-2">
              <Trophy className="size-5" /> المتصدرون
            </Link>
            <Link to="/" className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 text-white px-4 py-3 font-bold text-center active:translate-y-0.5 transition flex items-center justify-center gap-2">
              <Home className="size-5" /> الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ tone, icon, label, value }: { tone: "success" | "danger"; icon: React.ReactNode; label: string; value: number }) {
  const bg = tone === "success" ? "bg-gradient-success" : "bg-gradient-danger";
  return (
    <div className={`${bg} rounded-2xl p-4 text-white`}>
      <div className="flex items-center gap-2 text-sm font-bold opacity-90">
        {icon} {label}
      </div>
      <div className="mt-1 text-3xl font-black">{value}</div>
    </div>
  );
}
