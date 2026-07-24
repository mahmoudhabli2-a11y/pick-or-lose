import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { loadPlayer, pickQuestions, savePlayer, type Question } from "@/lib/quiz-data";
import { Heart, Trophy, X, Check } from "lucide-react";

const TIME_PER_Q = 5; // seconds
const TOTAL = 10;

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "اللعب — اختار أو اخسر" },
      { name: "description", content: "٥ ثوانٍ لكل سؤال. اختر الإجابة الصحيحة قبل انتهاء الوقت." },
      { property: "og:title", content: "اللعب — اختار أو اخسر" },
      { property: "og:description", content: "٥ ثوانٍ لكل سؤال. اختر الإجابة الصحيحة." },
    ],
  }),
  component: GamePage,
});

type Phase = "playing" | "reveal";

function GamePage() {
  const navigate = useNavigate();
  const [questions] = useState<Question[]>(() => pickQuestions(TOTAL));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[idx];

  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  function handleAnswer(choice: number | null) {
    if (phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(choice);
    setPhase("reveal");

    const isRight = choice !== null && choice === q.correct;
    if (isRight) {
      const gained = 10 + timeLeft * 2;
      setScore((s) => s + gained);
      setCorrect((c) => c + 1);
    } else {
      setWrong((w) => w + 1);
      setLives((l) => l - 1);
    }

    setTimeout(() => {
      const nextLives = isRight ? lives : lives - 1;
      const nextIdx = idx + 1;
      if (nextLives <= 0 || nextIdx >= questions.length) {
        finish(
          score + (isRight ? 10 + timeLeft * 2 : 0),
          correct + (isRight ? 1 : 0),
          wrong + (isRight ? 0 : 1),
        );
        return;
      }
      setIdx(nextIdx);
      setSelected(null);
      setPhase("playing");
    }, 1200);
  }

  function finish(finalScore: number, finalCorrect: number, finalWrong: number) {
    const p = loadPlayer();
    const newState = {
      ...p,
      score: finalScore,
      level: Math.max(p.level, Math.floor(finalScore / 50) + 1),
      lives: 3,
      bestScore: Math.max(p.bestScore, finalScore),
    };
    savePlayer(newState);
    try {
      localStorage.setItem(
        "ekhtar-last-game",
        JSON.stringify({ score: finalScore, correct: finalCorrect, wrong: finalWrong, total: questions.length }),
      );
    } catch {}
    navigate({ to: "/results" });
  }

  const progress = (idx / questions.length) * 100;
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const isDanger = timeLeft <= 2;

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <button
            onClick={() => navigate({ to: "/" })}
            className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20 active:scale-95 transition"
            aria-label="خروج"
          >
            <X className="size-5" />
          </button>
          <div className="flex items-center gap-3">
            <Chip icon={<Trophy className="size-4" />} value={score} tint="fun-3" />
            <Chip
              icon={<Heart className="size-4 fill-current" />}
              value={lives}
              tint="fun-1"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-center text-xs font-bold text-white/80">
          سؤال {idx + 1} / {questions.length}
        </div>

        {/* Timer */}
        <div className="mt-6 flex flex-col items-center">
          <div
            className={`relative size-24 rounded-full flex items-center justify-center font-black text-4xl text-white ${isDanger ? "bg-gradient-danger animate-pulse-ring" : "bg-gradient-primary"}`}
            style={{
              background: `conic-gradient(${isDanger ? "oklch(0.75 0.24 25)" : "oklch(0.85 0.19 90)"} ${timerPct}%, oklch(1 0 0 / 0.15) 0)`,
            }}
          >
            <div className="absolute inset-2 rounded-full bg-[color:var(--primary)] flex items-center justify-center">
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Question card */}
        <div key={idx} className="mt-6 rounded-3xl bg-white shadow-fun p-6 animate-pop">
          <div className="inline-block text-xs font-bold rounded-full bg-[color:var(--fun-4)]/10 text-[color:var(--fun-4)] px-3 py-1">
            {q.category}
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground leading-snug min-h-[3.5rem]">
            {q.question}
          </h2>
        </div>

        {/* Answers */}
        <div className="mt-5 grid grid-cols-1 gap-3">
          {q.answers.map((a, i) => {
            const isSelected = selected === i;
            const isCorrect = phase === "reveal" && i === q.correct;
            const isWrong = phase === "reveal" && isSelected && i !== q.correct;
            const base =
              "w-full rounded-2xl px-5 py-4 text-right text-lg font-bold flex items-center justify-between transition-all";
            let cls = "bg-white text-foreground shadow-card active:translate-y-0.5";
            if (isCorrect) cls = "bg-gradient-success text-white shadow-fun animate-pop";
            else if (isWrong) cls = "bg-gradient-danger text-white shadow-fun animate-shake";
            else if (phase === "reveal") cls = "bg-white/70 text-muted-foreground";
            const tints = ["fun-1", "fun-2", "fun-3", "fun-4"];
            return (
              <button
                key={i}
                disabled={phase !== "playing"}
                onClick={() => handleAnswer(i)}
                className={`${base} ${cls}`}
              >
                <span className="flex-1 text-right">{a}</span>
                <span
                  className={`size-9 rounded-xl flex items-center justify-center text-white font-black shrink-0 ${
                    isCorrect ? "bg-white/25" : isWrong ? "bg-white/25" : `bg-[color:var(--${tints[i]})]`
                  }`}
                >
                  {isCorrect ? <Check className="size-5" /> : isWrong ? <X className="size-5" /> : ["أ", "ب", "ج", "د"][i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, value, tint }: { icon: React.ReactNode; value: number; tint: string }) {
  return (
    <div className="rounded-full bg-white/95 px-3 py-1.5 flex items-center gap-1.5 shadow-card">
      <span className={`text-[color:var(--${tint})]`}>{icon}</span>
      <span className="font-black text-foreground text-sm">{value}</span>
    </div>
  );
}
