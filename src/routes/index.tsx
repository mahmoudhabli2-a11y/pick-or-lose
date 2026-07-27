import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  loadPlayer,
  levelProgress,
  xpForNextLevel,
  totalXpForLevel,
  SKILLS,
  type PlayerState,
  type SkillKey,
  DIFFICULTIES,
  unlockedDifficulties,
  ACHIEVEMENTS,
} from "@/lib/quiz-data";
import { useAuth, isGuest, signOut } from "@/lib/auth";
import { loadHearts, MAX_HEARTS } from "@/lib/hearts";
import { countryFlag } from "@/lib/countries";
import { DailyWheel, wheelAvailable, msUntilNextSpin } from "@/components/daily-wheel";
import { formatCountdown } from "@/lib/hearts";
import { Trophy, Zap, Calendar, Play, Flame, ChevronLeft, Award, User, LogOut, LogIn, Heart, Settings } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تحدي العقول — 🏆 تحدّى عقلك" },
      { name: "description", content: "تحدي العقول: منصة تحديات ذهنية عربية. طوّر سرعتك ومنطقك وذاكرتك يومياً." },
      { property: "og:title", content: "تحدي العقول — 🏆 تحدّى عقلك" },
      { property: "og:description", content: "لعبة تحديات ذهنية عربية بمهارات متعددة، مستويات، وإنجازات." },
    ],
  }),
  component: Home,
});

function Home() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [showWheel, setShowWheel] = useState(false);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    // First-open flow: no session AND not a guest → welcome.
    if (!session && !isGuest()) {
      navigate({ to: "/welcome", replace: true });
      return;
    }
    setPlayer(loadPlayer());
  }, [session, loading, navigate]);

  useEffect(() => {
    setHearts(loadHearts().hearts);
    const t = setInterval(() => setHearts(loadHearts().hearts), 5000);
    const onHearts = () => setHearts(loadHearts().hearts);
    window.addEventListener("tahaddi-hearts", onHearts);
    return () => {
      clearInterval(t);
      window.removeEventListener("tahaddi-hearts", onHearts);
    };
  }, []);

  useEffect(() => {
    if (!player) return;
    const t = setTimeout(() => setShowWheel(wheelAvailable()), 700);
    return () => clearTimeout(t);
  }, [player]);

  const p = player;


  return (
    <div className="min-h-screen px-4 pt-6 pb-24 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between animate-pop">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-white/95 flex items-center justify-center text-2xl shadow-card border-2 border-white">
              {p?.avatar ?? "🦊"}
            </div>
            <div className="text-white">
              <div className="text-xs font-bold opacity-85">مرحباً</div>
              <div className="font-black text-base leading-tight">
                {p?.name ?? "لاعب"} {countryFlag(p?.country)}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/15 backdrop-blur px-3 py-1.5 flex items-center gap-1 border border-white/20 text-white">
              <Flame className="size-4 text-[color:var(--fun-3)]" />
              <span className="text-sm font-black">{p?.streak ?? 0}</span>
            </div>
            <div className="rounded-full bg-white/15 backdrop-blur px-3 py-1.5 flex items-center gap-1 border border-white/20 text-white">
              <Heart className="size-4 fill-[color:var(--fun-1)] text-[color:var(--fun-1)]" />
              <span className="text-sm font-black">{hearts}</span>
            </div>
            <Link to="/settings" className="size-10 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white" aria-label="الإعدادات">
              <Settings className="size-5" />
            </Link>
            <Link to="/profile" className="size-10 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white" aria-label="الملف">
              <User className="size-5" />
            </Link>
            {session ? (
              <button
                onClick={() => signOut()}
                className="size-10 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white"
                aria-label="خروج"
              >
                <LogOut className="size-5" />
              </button>
            ) : (
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="size-10 rounded-full bg-white text-[color:var(--primary)] flex items-center justify-center"
                aria-label="تسجيل الدخول"
              >
                <LogIn className="size-5" />
              </Link>
            )}
          </div>

        </div>

        {/* Brand */}
        <div className="text-center animate-pop">
          <div className="inline-block rounded-3xl bg-white/15 backdrop-blur-sm px-5 py-1.5 mb-2 border border-white/20">
            <span className="text-white/95 text-xs font-bold tracking-wider">🏆 تحدّى عقلك</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-none drop-shadow-lg">تحدي العقول</h1>
        </div>

        {/* Level & XP */}
        <ProfileSummary player={p} />

        {/* Big CTA */}
        <Link
          to="/game"
          className="block w-full rounded-3xl bg-white text-[color:var(--primary)] px-6 py-5 text-2xl font-black text-center shadow-fun active:translate-y-1 transition-transform animate-float-up"
        >
          <span className="inline-flex items-center gap-3">
            <Play className="size-7 fill-current" />
            ابدأ التحدّي
          </span>
        </Link>

        {/* Daily challenge */}
        <SectionCard
          to="/daily"
          title="التحدّي اليومي"
          subtitle={p?.lastDailyDay === Math.floor(Date.now() / 86400000) ? "أنجزته اليوم — عد غداً" : "سؤال جديد ينتظرك"}
          icon={<Calendar className="size-6" />}
          gradient="bg-gradient-accent"
        />

        {/* Daily spin */}
        <DailySpinButton onOpen={() => setShowWheel(true)} />


        {/* Skills */}
        <div className="animate-float-up">
          <SectionHeader title="طوّر مهاراتك" subtitle="اختر مهارة وابدأ التدريب" />
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(SKILLS) as SkillKey[]).map((k) => (
              <SkillCard key={k} skill={k} state={p?.skills[k]} />
            ))}
            <DifficultyPeek level={p?.level ?? 1} />
          </div>
        </div>

        {/* Leaderboard preview */}
        <SectionCard
          to="/leaderboard"
          title="المتصدرون"
          subtitle="شاهد أفضل اللاعبين"
          icon={<Trophy className="size-6" />}
          gradient="bg-gradient-primary"
        />

        {showWheel && (
          <DailyWheel
            onClose={() => {
              setShowWheel(false);
              setPlayer(loadPlayer());
              setHearts(loadHearts().hearts);
            }}
          />
        )}

        {/* Achievements strip */}
        <AchievementStrip owned={p?.achievements ?? []} />
      </div>
    </div>
  );
}

function ProfileSummary({ player }: { player: PlayerState | null }) {
  const level = player?.level ?? 1;
  const xp = player?.xp ?? 0;
  const base = totalXpForLevel(level);
  const need = xpForNextLevel(level);
  const inLvl = xp - base;
  const pct = Math.round(levelProgress(xp, level) * 100);

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur p-4 shadow-card animate-float-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-primary text-white font-black flex items-center justify-center shadow-card">
            {level}
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground">المستوى</div>
            <div className="font-black text-foreground text-sm">مستوى {level}</div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-muted-foreground">النقاط</div>
          <div className="font-black text-[color:var(--primary)] text-lg leading-tight inline-flex items-center gap-1">
            <Trophy className="size-4 text-[color:var(--fun-3)]" />
            {player?.score ?? 0}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1">
          <span className="inline-flex items-center gap-1"><Zap className="size-3.5" /> XP</span>
          <span>{inLvl} / {need}</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between text-white">
      <div>
        <h2 className="text-lg font-black drop-shadow">{title}</h2>
        {subtitle && <div className="text-xs font-semibold opacity-85">{subtitle}</div>}
      </div>
    </div>
  );
}

function SectionCard({ to, title, subtitle, icon, gradient }: { to: string; title: string; subtitle: string; icon: React.ReactNode; gradient: string }) {
  return (
    <Link to={to} className={`${gradient} rounded-3xl p-4 text-white shadow-card active:translate-y-0.5 transition-transform flex items-center gap-3 animate-float-up`}>
      <div className="size-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-lg leading-tight">{title}</div>
        <div className="text-xs font-semibold opacity-90 truncate">{subtitle}</div>
      </div>
      <ChevronLeft className="size-5 opacity-90" />
    </Link>
  );
}

function SkillCard({ skill, state }: { skill: SkillKey; state?: { score: number; level: number; xp: number } }) {
  const s = SKILLS[skill];
  const lvl = state?.level ?? 1;
  const score = state?.score ?? 0;
  const progress = state ? Math.min(100, ((state.xp % 100) / 100) * 100) : 0;
  return (
    <Link
      to="/game"
      search={{ skill }}
      className="rounded-2xl bg-white p-3 shadow-card active:translate-y-0.5 transition flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <div className={`size-10 rounded-xl bg-[color:var(--${s.tint})]/15 text-[color:var(--${s.tint})] flex items-center justify-center text-xl`}>
          {s.emoji}
        </div>
        <div className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full bg-[color:var(--${s.tint})]`}>
          LV {lvl}
        </div>
      </div>
      <div>
        <div className="text-sm font-black text-foreground leading-tight">{s.name}</div>
        <div className="text-[11px] font-bold text-muted-foreground">{score} نقطة</div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full bg-[color:var(--${s.tint})]`} style={{ width: `${progress}%` }} />
      </div>
    </Link>
  );
}

function DifficultyPeek({ level }: { level: number }) {
  const unlocked = unlockedDifficulties(level).length;
  const total = Object.keys(DIFFICULTIES).length;
  return (
    <div className="rounded-2xl bg-gradient-primary text-white p-3 shadow-card flex flex-col justify-between">
      <div className="text-xl">🔓</div>
      <div>
        <div className="text-sm font-black leading-tight">مستويات الصعوبة</div>
        <div className="text-[11px] font-bold opacity-90">{unlocked} / {total} مفتوحة</div>
      </div>
      <div className="flex gap-1 mt-1">
        {(Object.keys(DIFFICULTIES) as (keyof typeof DIFFICULTIES)[]).map((d) => (
          <span key={d} className={`text-xs px-1.5 py-0.5 rounded ${level >= DIFFICULTIES[d].unlockLevel ? "bg-white/25" : "bg-white/10 opacity-50"}`}>
            {DIFFICULTIES[d].emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

function AchievementStrip({ owned }: { owned: string[] }) {
  const displayed = ACHIEVEMENTS.slice(0, 6);
  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-4 animate-float-up">
      <div className="flex items-center justify-between mb-2 text-white">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-[color:var(--fun-3)]" />
          <span className="font-black">الإنجازات</span>
        </div>
        <Link to="/profile" className="text-xs font-bold opacity-90 underline">عرض الكل</Link>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {displayed.map((a) => {
          const has = owned.includes(a.id);
          return (
            <div key={a.id} className={`shrink-0 w-16 text-center rounded-2xl p-2 ${has ? "bg-white text-foreground" : "bg-white/10 text-white/60"}`}>
              <div className="text-2xl">{has ? a.emoji : "🔒"}</div>
              <div className="text-[10px] font-bold leading-tight mt-0.5 truncate">{a.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** زر عجلة الحظ اليومية مع عدّاد ٢٤ ساعة. */
function DailySpinButton({ onOpen }: { onOpen: () => void }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(msUntilNextSpin());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const ready = left === 0;

  return (
    <button
      onClick={onOpen}
      className="w-full rounded-3xl bg-gradient-success text-white p-4 shadow-card active:translate-y-0.5 transition-transform flex items-center gap-3 animate-float-up text-right"
    >
      <div className={`size-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl ${ready ? "animate-pulse-ring" : ""}`}>
        🎡
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-lg leading-tight">عجلة الحظ اليومية</div>
        <div className="text-xs font-semibold opacity-90 truncate tabular-nums">
          {left === null ? "…" : ready ? "لفّتك متاحة الآن — اربح قلوباً أو نقاط خبرة" : `اللفة التالية بعد ${formatCountdown(left)}`}
        </div>
      </div>
      <ChevronLeft className="size-5 opacity-90" />
    </button>
  );
}

