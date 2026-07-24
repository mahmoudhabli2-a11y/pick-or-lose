import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadPlayer,
  savePlayer,
  pickChallenges,
  SKILLS,
  DIFFICULTIES,
  unlockedDifficulties,
  levelFromXp,
  updateStreak,
  grantAchievements,
  type Challenge,
  type SkillKey,
  type Difficulty,
} from "@/lib/quiz-data";
import { Heart, Trophy, X, Check, Zap, Lock } from "lucide-react";

const TOTAL = 10;

type Search = { skill?: SkillKey; difficulty?: Difficulty };

export const Route = createFileRoute("/game")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    skill: (s.skill as SkillKey) || undefined,
    difficulty: (s.difficulty as Difficulty) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "التحدّي — تحدّي" },
      { name: "description", content: "تحديات ذهنية سريعة. أجب قبل انتهاء الوقت واحصل على نقاط أعلى بسرعتك." },
      { property: "og:title", content: "التحدّي — تحدّي" },
      { property: "og:description", content: "أجب بسرعة، اجمع النقاط، وطوّر مهاراتك." },
    ],
  }),
  component: GamePage,
});

type Phase = "picking" | "playing" | "reveal" | "done";

function GamePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/game" });
  const [player] = useState(() => loadPlayer());
  const [difficulty, setDifficulty] = useState<Difficulty | null>(search.difficulty ?? null);
  const [phase, setPhase] = useState<Phase>(search.difficulty ? "playing" : "picking");

  if (phase === "picking") {
    return <DifficultyPicker player={player} skill={search.skill} onPick={(d) => { setDifficulty(d); setPhase("playing"); }} />;
  }

  return <PlaySession skill={search.skill} difficulty={difficulty!} onExit={() => navigate({ to: "/" })} />;
}

function DifficultyPicker({ player, skill, onPick }: { player: ReturnType<typeof loadPlayer>; skill?: SkillKey; onPick: (d: Difficulty) => void }) {
  const unlocked = unlockedDifficulties(player.level);
  return (
    <div className="min-h-screen px-5 pt-8 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div className="flex items-center justify-between text-white">
          <Link to="/" className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20" aria-label="خروج">
            <X className="size-5" />
          </Link>
          <div className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 border border-white/20 text-sm font-bold">
            {skill ? SKILLS[skill].emoji + " " + SKILLS[skill].name : "التحدّي الكامل"}
          </div>
          <div className="w-10" />
        </div>

        <div className="mt-6 text-center animate-pop">
          <h1 className="text-3xl font-black text-white drop-shadow-lg">اختر مستوى الصعوبة</h1>
          <p className="mt-2 text-white/85 font-semibold text-sm">كلما زادت الصعوبة، زادت النقاط</p>
        </div>

        <div className="mt-6 space-y-3">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => {
            const info = DIFFICULTIES[d];
            const locked = !unlocked.includes(d);
            return (
              <button
                key={d}
                disabled={locked}
                onClick={() => onPick(d)}
                className={`w-full rounded-3xl p-4 text-right flex items-center gap-3 shadow-card transition ${locked ? "bg-white/40 text-white/70" : "bg-white text-foreground active:translate-y-1"}`}
              >
                <div className={`size-14 rounded-2xl flex items-center justify-center text-3xl ${locked ? "bg-white/30" : "bg-gradient-primary text-white"}`}>
                  {locked ? <Lock className="size-6" /> : info.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-black text-lg">{info.name}</div>
                  <div className={`text-xs font-bold ${locked ? "opacity-90" : "text-muted-foreground"}`}>
                    {locked ? `يُفتح في المستوى ${info.unlockLevel}` : `${info.time} ثوانٍ • ×${info.xp} نقاط`}
                  </div>
                </div>
                {!locked && (
                  <div className="rounded-xl bg-[color:var(--primary)]/10 text-[color:var(--primary)] px-3 py-2 font-black">
                    ابدأ
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlaySession({ skill, difficulty, onExit }: { skill?: SkillKey; difficulty: Difficulty; onExit: () => void }) {
  const navigate = useNavigate();
  const timePerQ = DIFFICULTIES[difficulty].time;
  const xpMult = DIFFICULTIES[difficulty].xp;

  const [challenges] = useState<Challenge[]>(() => pickChallenges(TOTAL, skill));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "reveal">("playing");
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const [skillDelta, setSkillDelta] = useState<Record<SkillKey, { xp: number; score: number }>>({
    speed: { xp: 0, score: 0 }, logic: { xp: 0, score: 0 }, focus: { xp: 0, score: 0 }, math: { xp: 0, score: 0 }, memory: { xp: 0, score: 0 },
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = challenges[idx];
  const currentSkill: SkillKey = q?.skill ?? "speed";
  const skillInfo = SKILLS[currentSkill];

  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(timePerQ);
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
    let gained = 0;
    if (isRight) {
      gained = Math.round((10 + timeLeft * 3) * xpMult);
      setScore((s) => s + gained);
      setCorrect((c) => c + 1);
      setSkillDelta((d) => ({
        ...d,
        [currentSkill]: { xp: d[currentSkill].xp + Math.round(gained / 2), score: d[currentSkill].score + gained },
      }));
    } else {
      setWrong((w) => w + 1);
      setLives((l) => l - 1);
    }

    setTimeout(() => {
      const nextLives = isRight ? lives : lives - 1;
      const nextIdx = idx + 1;
      if (nextLives <= 0 || nextIdx >= challenges.length) {
        finish(
          score + gained,
          correct + (isRight ? 1 : 0),
          wrong + (isRight ? 0 : 1),
        );
        return;
      }
      setIdx(nextIdx);
      setSelected(null);
      setPhase("playing");
    }, 1100);
  }

  function finish(finalScore: number, finalCorrect: number, finalWrong: number) {
    let p = loadPlayer();
    p = updateStreak(p);
    const newXp = p.xp + finalScore;
    const newLevel = levelFromXp(newXp);

    // Skills merge
    const nextSkills = { ...p.skills };
    (Object.keys(skillDelta) as SkillKey[]).forEach((k) => {
      const cur = nextSkills[k];
      const xp = cur.xp + skillDelta[k].xp;
      const level = Math.max(1, Math.floor(xp / 100) + 1);
      nextSkills[k] = { xp, level, score: cur.score + skillDelta[k].score };
    });

    let next = {
      ...p,
      xp: newXp,
      level: Math.max(p.level, newLevel),
      score: finalScore,
      lives: 3,
      bestScore: Math.max(p.bestScore, finalScore),
      totalCorrect: p.totalCorrect + finalCorrect,
      totalWrong: p.totalWrong + finalWrong,
      skills: nextSkills,
    };
    const { player: withAch, unlocked } = grantAchievements(next);
    next = withAch;
    savePlayer(next);

    try {
      localStorage.setItem(
        "tahaddi-last-game",
        JSON.stringify({
          score: finalScore,
          correct: finalCorrect,
          wrong: finalWrong,
          total: challenges.length,
          skill,
          difficulty,
          xpGained: finalScore,
          newLevel: next.level > p.level ? next.level : null,
          unlocked: unlocked.map((a) => ({ name: a.name, emoji: a.emoji })),
        }),
      );
    } catch {}
    navigate({ to: "/results" });
  }

  const progress = ((idx) / challenges.length) * 100;
  const timerPct = (timeLeft / timePerQ) * 100;
  const isDanger = timeLeft <= Math.ceil(timePerQ / 3);

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <button
            onClick={onExit}
            className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20 active:scale-95 transition"
            aria-label="خروج"
          >
            <X className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <Chip icon={<Trophy className="size-4" />} value={score} tint="fun-3" />
            <Chip icon={<Heart className="size-4 fill-current" />} value={lives} tint="fun-1" />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-white/90 text-xs font-bold">
          <span className="rounded-full bg-white/15 px-3 py-1 border border-white/20">
            {DIFFICULTIES[difficulty].emoji} {DIFFICULTIES[difficulty].name}
          </span>
          <span>سؤال {idx + 1} / {challenges.length}</span>
        </div>

        {/* Progress */}
        <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Timer */}
        <div className="mt-6 flex flex-col items-center">
          <div
            className={`relative size-24 rounded-full flex items-center justify-center font-black text-4xl text-white ${isDanger ? "animate-pulse-ring" : ""}`}
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
        <div key={idx} className="mt-5 rounded-3xl bg-white shadow-fun p-6 animate-pop">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full bg-[color:var(--${skillInfo.tint})]/10 text-[color:var(--${skillInfo.tint})] px-3 py-1`}>
            <span>{skillInfo.emoji}</span>
            <span>{skillInfo.name}</span>
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground leading-snug min-h-[3.5rem]">{q.question}</h2>
        </div>

        {/* Answers */}
        <div className={`mt-4 grid gap-3 ${q.answers.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {q.answers.map((a, i) => {
            const isSelected = selected === i;
            const isCorrect = phase === "reveal" && i === q.correct;
            const isWrong = phase === "reveal" && isSelected && i !== q.correct;
            const base = "w-full rounded-2xl px-4 py-4 text-right text-lg font-bold flex items-center justify-between transition-all";
            let cls = "bg-white text-foreground shadow-card active:translate-y-0.5";
            if (isCorrect) cls = "bg-gradient-success text-white shadow-fun animate-pop";
            else if (isWrong) cls = "bg-gradient-danger text-white shadow-fun animate-shake";
            else if (phase === "reveal") cls = "bg-white/70 text-muted-foreground";
            const tints = ["fun-1", "fun-2", "fun-3", "fun-4"];
            const isTF = q.answers.length === 2;
            return (
              <button
                key={i}
                disabled={phase !== "playing"}
                onClick={() => handleAnswer(i)}
                className={`${base} ${cls} ${isTF ? "justify-center" : ""}`}
              >
                {!isTF && (
                  <span className="flex-1 text-right">{a}</span>
                )}
                <span
                  className={`${isTF ? "flex-1 text-center" : ""} ${!isTF ? "size-9 rounded-xl flex items-center justify-center text-white font-black shrink-0" : "font-black text-xl"} ${
                    !isTF ? (isCorrect || isWrong ? "bg-white/25" : `bg-[color:var(--${tints[i]})]`) : ""
                  }`}
                >
                  {isTF ? a : isCorrect ? <Check className="size-5" /> : isWrong ? <X className="size-5" /> : ["أ", "ب", "ج", "د"][i]}
                </span>
              </button>
            );
          })}
        </div>

        {phase === "reveal" && q.hint && (
          <div className="mt-3 text-center text-white/90 text-xs font-bold inline-flex items-center justify-center gap-1">
            <Zap className="size-3" /> {q.hint}
          </div>
        )}
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
