import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getDailyChallenge, loadPlayer, savePlayer, type Question } from "@/lib/quiz-data";
import { ArrowRight, Check, X, Calendar, Sparkles } from "lucide-react";

const TIME = 15;

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "تحدي اليوم — تحدّي" },
      { name: "description", content: "تحدٍّ خاص جديد كل يوم. جرّب حظك ومهاراتك!" },
      { property: "og:title", content: "تحدي اليوم" },
      { property: "og:description", content: "سؤال مميز كل يوم." },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const navigate = useNavigate();
  const [q] = useState<Question>(() => getDailyChallenge());
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const p = loadPlayer();
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    if (p.lastDailyDay === today) setAlreadyDone(true);
  }, []);

  useEffect(() => {
    if (revealed || alreadyDone) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          onAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, alreadyDone]);

  function onAnswer(choice: number | null) {
    if (revealed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(choice);
    setRevealed(true);
    const p = loadPlayer();
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const isRight = choice !== null && choice === q.correct;
    savePlayer({
      ...p,
      score: p.score + (isRight ? 50 : 0),
      bestScore: Math.max(p.bestScore, p.score + (isRight ? 50 : 0)),
      lastDailyDay: today,
    });
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen px-5 pt-10 pb-8 flex flex-col">
        <div className="mx-auto w-full max-w-md flex-1 flex flex-col items-center justify-center text-center text-white">
          <div className="text-7xl mb-4">🌟</div>
          <h1 className="text-3xl font-black drop-shadow-lg">أنجزت تحدي اليوم!</h1>
          <p className="mt-2 text-white/85 font-semibold">عد غداً لتحدٍّ جديد.</p>
          <Link to="/" className="mt-8 rounded-2xl bg-white text-[color:var(--primary)] px-6 py-3 font-black shadow-fun">
            الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pt-8 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={() => navigate({ to: "/" })}
            className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </button>
          <div className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 flex items-center gap-2 border border-white/20">
            <Calendar className="size-4" />
            <span className="text-sm font-bold">تحدي اليوم</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="mt-6 text-center animate-pop">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-accent text-white px-4 py-1.5 shadow-card">
            <Sparkles className="size-4" />
            <span className="font-black text-sm">مكافأة +50 نقطة</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-white drop-shadow-lg">التحدي الخاص</h1>
        </div>

        {/* Timer bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-white/90 text-sm font-bold mb-1">
            <span>الوقت المتبقي</span>
            <span>{timeLeft} ث</span>
          </div>
          <div className="h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 4 ? "bg-gradient-danger" : "bg-gradient-accent"}`}
              style={{ width: `${(timeLeft / TIME) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white shadow-fun p-6 animate-pop">
          <div className="inline-block text-xs font-bold rounded-full bg-[color:var(--fun-4)]/10 text-[color:var(--fun-4)] px-3 py-1">
            {q.category}
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground leading-snug">{q.question}</h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {q.answers.map((a, i) => {
            const isSel = selected === i;
            const isCorrect = revealed && i === q.correct;
            const isWrong = revealed && isSel && i !== q.correct;
            let cls = "bg-white text-foreground shadow-card active:translate-y-0.5";
            if (isCorrect) cls = "bg-gradient-success text-white shadow-fun animate-pop";
            else if (isWrong) cls = "bg-gradient-danger text-white shadow-fun animate-shake";
            else if (revealed) cls = "bg-white/70 text-muted-foreground";
            const tints = ["fun-1", "fun-2", "fun-3", "fun-4"];
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => onAnswer(i)}
                className={`w-full rounded-2xl px-5 py-4 text-right text-lg font-bold flex items-center justify-between transition-all ${cls}`}
              >
                <span className="flex-1 text-right">{a}</span>
                <span className={`size-9 rounded-xl flex items-center justify-center text-white font-black shrink-0 ${isCorrect || isWrong ? "bg-white/25" : `bg-[color:var(--${tints[i]})]`}`}>
                  {isCorrect ? <Check className="size-5" /> : isWrong ? <X className="size-5" /> : ["أ", "ب", "ج", "د"][i]}
                </span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 rounded-3xl bg-white text-[color:var(--primary)] px-6 py-4 text-lg font-black shadow-fun active:translate-y-1 transition animate-float-up"
          >
            العودة للرئيسية
          </button>
        )}
      </div>
    </div>
  );
}
