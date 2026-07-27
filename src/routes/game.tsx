import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import {
  loadHearts,
  spendHeart,
  addHearts,
  MAX_HEARTS,
  msUntilNextHeart,
  formatCountdown,
} from "@/lib/hearts";
import { sfxCorrect, sfxWrong, sfxTick, sfxLevelUp, sfxTap, primeAudio } from "@/lib/fx";
import { RewardedAdButton, ModalShell } from "@/components/rewarded-ad";
import { Heart, Trophy, X, Check, Zap, Lock, Clock, Settings } from "lucide-react";

const TOTAL = 10;

type Search = { skill?: SkillKey; difficulty?: Difficulty };

export const Route = createFileRoute("/game")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    skill: (s.skill as SkillKey) || undefined,
    difficulty: (s.difficulty as Difficulty) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "التحدّي — تحدي العقول" },
      { name: "description", content: "تحديات ذهنية سريعة. أجب قبل انتهاء الوقت واحصل على نقاط أعلى بسرعتك." },
      { property: "og:title", content: "التحدّي — تحدي العقول" },
      { property: "og:description", content: "أجب بسرعة، اجمع النقاط، وطوّر مهاراتك." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/game" });
  const [player] = useState(() => loadPlayer());
  const [difficulty, setDifficulty] = useState<Difficulty | null>(search.difficulty ?? null);
  const [phase, setPhase] = useState<"picking" | "playing">(search.difficulty ? "playing" : "picking");

  if (phase === "picking") {
    return (
      <DifficultyPicker
        player={player}
        skill={search.skill}
        onPick={(d) => {
          primeAudio();
          sfxTap();
          setDifficulty(d);
          setPhase("playing");
        }}
      />
    );
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
          <Link to="/settings" className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20" aria-label="الإعدادات">
            <Settings className="size-5" />
          </Link>
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
  const [hearts, setHearts] = useState(() => loadHearts().hearts);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "reveal" | "blocked">("playing");
  const [bonusTime, setBonusTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const [refillIn, setRefillIn] = useState(0);
  const [powerups, setPowerups] = useState({ fifty: 1, time: 1, hint: 1 });
  const [hidden, setHidden] = useState<number[]>([]);
  const [hintOpen, setHintOpen] = useState(false);

  const [skillDelta, setSkillDelta] = useState<Record<SkillKey, { xp: number; score: number }>>({
    speed: { xp: 0, score: 0 }, logic: { xp: 0, score: 0 }, focus: { xp: 0, score: 0 }, math: { xp: 0, score: 0 }, memory: { xp: 0, score: 0 },
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = challenges[idx];
  const currentSkill: SkillKey = q?.skill ?? "speed";
  const skillInfo = SKILLS[currentSkill];
  const questionTime = timePerQ + bonusTime;
  const nearEnd = idx >= challenges.length - 3;

  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(questionTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null);
          return 0;
        }
        if (t <= 4) sfxTick();
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, questionTime]);

  // Live countdown for the "wait for refill" hint.
  useEffect(() => {
    if (phase !== "blocked") return;
    setRefillIn(msUntilNextHeart());
    const t = setInterval(() => setRefillIn(msUntilNextHeart()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  function handleAnswer(choice: number | null) {
    if (phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(choice);
    setPhase("reveal");

    const isRight = choice !== null && choice === q.correct;
    let gained = 0;
    let heartsLeft = hearts;
    if (isRight) {
      gained = Math.round((10 + timeLeft * 3) * xpMult);
      sfxCorrect();
      setScore((s) => s + gained);
      setCorrect((c) => c + 1);
      setSkillDelta((d) => ({
        ...d,
        [currentSkill]: { xp: d[currentSkill].xp + Math.round(gained / 2), score: d[currentSkill].score + gained },
      }));
    } else {
      sfxWrong();
      setWrong((w) => w + 1);
      heartsLeft = spendHeart();
      setHearts(heartsLeft);
    }

    setTimeout(() => {
      const nextIdx = idx + 1;
      if (heartsLeft <= 0) {
        // Out of hearts → offer rewarded ad / extra time / wait.
        setPhase("blocked");
        return;
      }
      if (nextIdx >= challenges.length) {
        finish(score + gained, correct + (isRight ? 1 : 0), wrong + (isRight ? 0 : 1));
        return;
      }
      setIdx(nextIdx);
      setBonusTime(0);
      setSelected(null);
      setHidden([]);
      setHintOpen(false);
      setPhase("playing");
    }, 1100);
  }

  /** ٥٠/٥٠ — إخفاء إجابتين خاطئتين. */
  function useFifty() {
    if (powerups.fifty <= 0 || phase !== "playing") return;
    const wrongIdx = q.answers.map((_, i) => i).filter((i) => i !== q.correct);
    const shuffled = wrongIdx.sort(() => Math.random() - 0.5).slice(0, Math.min(2, wrongIdx.length - (q.answers.length > 3 ? 0 : 0)));
    setHidden(shuffled);
    setPowerups((p) => ({ ...p, fifty: p.fifty - 1 }));
    sfxTap();
  }

  /** وقت إضافي ١٠ ثوانٍ. */
  function useExtraTime() {
    if (powerups.time <= 0 || phase !== "playing") return;
    setBonusTime((b) => b + 10);
    setTimeLeft((t) => t + 10);
    setPowerups((p) => ({ ...p, time: p.time - 1 }));
    sfxReward();
  }

  /** تلميح أو تصويت الجمهور. */
  function useHint() {
    if (powerups.hint <= 0 || phase !== "playing") return;
    setHintOpen(true);
    setPowerups((p) => ({ ...p, hint: p.hint - 1 }));
    sfxTap();
  }


  function continueAfterAd(extraSeconds: number) {
    setHearts(addHearts(1));
    setBonusTime(extraSeconds);
    setSelected(null);
    if (extraSeconds > 0) {
      // Retry the same question with extra time.
      setPhase("playing");
      return;
    }
    const nextIdx = idx + 1;
    if (nextIdx >= challenges.length) {
      finish(score, correct, wrong);
      return;
    }
    setIdx(nextIdx);
    setPhase("playing");
  }

  function finish(finalScore: number, finalCorrect: number, finalWrong: number) {
    let p = loadPlayer();
    p = updateStreak(p);
    const newXp = p.xp + finalScore;
    const newLevel = levelFromXp(newXp);

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
    if (next.level > p.level) sfxLevelUp();

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

  const progress = (idx / challenges.length) * 100;
  const timerPct = (timeLeft / questionTime) * 100;
  const isDanger = timeLeft <= Math.ceil(questionTime / 3);

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
            <Chip icon={<Heart className="size-4 fill-current" />} value={hearts} tint="fun-1" />
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
          {bonusTime > 0 && (
            <div className="mt-2 text-white text-xs font-black inline-flex items-center gap-1">
              <Clock className="size-3" /> +{bonusTime} ثوانٍ إضافية
            </div>
          )}
        </div>

        {/* Question card */}
        <div key={idx} className="mt-5 rounded-3xl bg-white shadow-fun p-6 animate-pop">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full bg-[color:var(--${skillInfo.tint})]/10 text-[color:var(--${skillInfo.tint})] px-3 py-1`}>
            <span>{skillInfo.emoji}</span>
            <span>{skillInfo.name}</span>
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground leading-snug min-h-[3.5rem]">{q.question}</h2>
        </div>

        {/* Power-ups */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <PowerUp
            emoji="✂️"
            label="٥٠/٥٠"
            icon={<Scissors className="size-4" />}
            left={powerups.fifty}
            disabled={phase !== "playing" || q.answers.length <= 2 || hidden.length > 0}
            onUse={useFifty}
          />
          <PowerUp
            emoji="⏱️"
            label="+١٠ ثوانٍ"
            icon={<Clock className="size-4" />}
            left={powerups.time}
            disabled={phase !== "playing"}
            onUse={useExtraTime}
          />
          <PowerUp
            emoji="💡"
            label="تلميح"
            icon={<Lightbulb className="size-4" />}
            left={powerups.hint}
            disabled={phase !== "playing" || hintOpen}
            onUse={useHint}
          />
        </div>

        {/* Answers */}
        <div className={`mt-4 grid gap-3 ${q.answers.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {q.answers.map((a, i) => {
            const isSelected = selected === i;
            const isCorrect = phase !== "playing" && i === q.correct;
            const isWrong = phase !== "playing" && isSelected && i !== q.correct;
            const isHidden = hidden.includes(i) && phase === "playing";
            const base = "w-full rounded-2xl px-4 py-4 text-right text-lg font-bold flex items-center justify-between transition-all";
            let cls = "bg-white text-foreground shadow-card active:translate-y-0.5";
            if (isCorrect) cls = "bg-gradient-success text-white shadow-fun animate-pop";
            else if (isWrong) cls = "bg-gradient-danger text-white shadow-fun animate-shake";
            else if (phase !== "playing") cls = "bg-white/70 text-muted-foreground";
            if (isHidden) cls = "bg-white/25 text-transparent";
            const tints = ["fun-1", "fun-2", "fun-3", "fun-4"];
            const isTF = q.answers.length === 2;
            return (
              <button
                key={i}
                disabled={phase !== "playing" || isHidden}
                onClick={() => handleAnswer(i)}
                className={`${base} ${cls} ${isTF ? "justify-center" : ""} ${isHidden ? "opacity-50" : ""}`}
              >

                {!isTF && <span className="flex-1 text-right">{a}</span>}
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

        {hintOpen && phase === "playing" && (
          <div className="mt-3 rounded-2xl bg-white/95 shadow-card p-3 animate-pop">
            <div className="text-xs font-black text-[color:var(--primary)] inline-flex items-center gap-1">
              <Lightbulb className="size-3.5" /> {q.hint ? "تلميح" : "تصويت الجمهور"}
            </div>
            {q.hint ? (
              <p className="mt-1 text-sm font-bold text-foreground">{q.hint}</p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {q.answers.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-muted-foreground w-8 tabular-nums">{poll[i]}%</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${poll[i]}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-foreground max-w-[40%] truncate">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === "reveal" && q.hint && (
          <div className="mt-3 text-center text-white/90 text-xs font-bold inline-flex items-center justify-center gap-1">
            <Zap className="size-3" /> {q.hint}
          </div>
        )}

      </div>

      {/* Out-of-hearts modal */}
      {phase === "blocked" && (
        <ModalShell
          emoji="💔"
          title="نفدت القلوب!"
          subtitle={`الحد الأقصى ${MAX_HEARTS} قلوب — يُعاد قلب واحد كل ٢٠ دقيقة`}
        >
          <RewardedAdButton
            label="شاهد إعلاناً واحصل على ❤️ +1"
            onReward={() => continueAfterAd(0)}
          />
          {nearEnd && (
            <RewardedAdButton
              label="استمر مع ٥ ثوانٍ إضافية ⏱️"
              onReward={() => continueAfterAd(5)}
            />
          )}
          <div className="rounded-2xl bg-[color:var(--muted)] p-4">
            <div className="text-sm font-bold text-muted-foreground">انتظار التعبئة</div>
            <div className="text-2xl font-black text-foreground tabular-nums">{formatCountdown(refillIn)}</div>
          </div>
          <button
            onClick={() => finish(score, correct, wrong)}
            className="w-full rounded-2xl border-2 border-[color:var(--border)] px-4 py-3 font-black text-foreground active:translate-y-0.5 transition"
          >
            إنهاء وعرض النتيجة
          </button>
        </ModalShell>
      )}
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
