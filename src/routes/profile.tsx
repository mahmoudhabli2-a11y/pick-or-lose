import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  loadPlayer,
  savePlayer,
  SKILLS,
  ACHIEVEMENTS,
  AVATARS,
  levelProgress,
  xpForNextLevel,
  totalXpForLevel,
  type PlayerState,
  type SkillKey,
} from "@/lib/quiz-data";
import { ArrowRight, Flame, Trophy, Zap, Check, Pencil, Award } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "الملف الشخصي — تحدي العقول" },
      { name: "description", content: "ملفك الشخصي: المستوى، النقاط، المهارات، الإنجازات، والسلسلة اليومية." },
      { property: "og:title", content: "الملف الشخصي — تحدي العقول" },
      { property: "og:description", content: "تابع تقدمك وإنجازاتك في تحدي العقول." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [p, setP] = useState<PlayerState | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🦊");

  useEffect(() => {
    const pl = loadPlayer();
    setP(pl);
    setName(pl.name);
    setAvatar(pl.avatar);
  }, []);

  if (!p) return null;

  function save() {
    const next = { ...p!, name: name.trim() || "لاعب", avatar };
    savePlayer(next);
    setP(next);
    setEditing(false);
  }

  const base = totalXpForLevel(p.level);
  const need = xpForNextLevel(p.level);
  const inLvl = p.xp - base;
  const pct = Math.round(levelProgress(p.xp, p.level) * 100);

  return (
    <div className="min-h-screen px-5 pt-8 pb-8 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between text-white">
          <Link to="/" className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20" aria-label="رجوع">
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="text-2xl font-black drop-shadow-lg">الملف الشخصي</h1>
          <button onClick={() => setEditing((v) => !v)} className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20" aria-label="تعديل">
            {editing ? <Check className="size-5" onClick={save} /> : <Pencil className="size-5" />}
          </button>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white shadow-fun p-5 animate-pop">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-3xl bg-gradient-primary flex items-center justify-center text-5xl shadow-card border-4 border-white">
              {avatar}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border-2 border-[color:var(--border)] px-3 py-2 font-black text-lg text-right"
                  maxLength={16}
                />
              ) : (
                <div className="font-black text-2xl text-foreground truncate">{p.name}</div>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-[color:var(--fun-3)]"><Trophy className="size-3.5" />{p.bestScore}</span>
                <span className="inline-flex items-center gap-1 text-[color:var(--destructive)]"><Flame className="size-3.5" />{p.streak} يوم</span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="mt-4">
              <div className="text-xs font-bold text-muted-foreground mb-2">اختر الصورة</div>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`size-12 rounded-2xl text-2xl flex items-center justify-center transition ${avatar === a ? "bg-gradient-primary text-white shadow-fun" : "bg-muted"}`}
                  >{a}</button>
                ))}
              </div>
              <button onClick={save} className="mt-3 w-full rounded-2xl bg-gradient-primary text-white py-3 font-black shadow-card">حفظ</button>
            </div>
          )}

          {/* Level */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-muted-foreground inline-flex items-center gap-1"><Zap className="size-3.5" /> المستوى {p.level}</span>
              <span className="text-xs font-bold text-muted-foreground">{inLvl} / {need} XP</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="نقاط" value={p.score} tint="fun-3" />
            <MiniStat label="صحيحة" value={p.totalCorrect} tint="fun-2" />
            <MiniStat label="خاطئة" value={p.totalWrong} tint="fun-1" />
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-3xl bg-white shadow-card p-4 animate-float-up">
          <div className="font-black text-foreground mb-3">المهارات</div>
          <div className="space-y-3">
            {(Object.keys(SKILLS) as SkillKey[]).map((k) => {
              const s = SKILLS[k];
              const st = p.skills[k];
              const progress = Math.min(100, (st.xp % 100));
              return (
                <div key={k} className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl bg-[color:var(--${s.tint})]/15 text-[color:var(--${s.tint})] flex items-center justify-center text-xl`}>{s.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-foreground">{s.name}</span>
                      <span className="text-xs font-bold text-muted-foreground">LV {st.level} • {st.score}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full bg-[color:var(--${s.tint})]`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-3xl bg-white shadow-card p-4 animate-float-up">
          <div className="flex items-center gap-2 mb-3">
            <Award className="size-5 text-[color:var(--fun-3)]" />
            <div className="font-black text-foreground">الإنجازات</div>
            <div className="text-xs font-bold text-muted-foreground">({p.achievements.length}/{ACHIEVEMENTS.length})</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const has = p.achievements.includes(a.id);
              return (
                <div key={a.id} className={`rounded-2xl p-3 text-center ${has ? "bg-gradient-card" : "bg-muted/40 opacity-60"}`}>
                  <div className="text-3xl">{has ? a.emoji : "🔒"}</div>
                  <div className="text-xs font-black text-foreground mt-1 leading-tight">{a.name}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5 leading-tight">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 py-2">
      <div className={`text-lg font-black text-[color:var(--${tint})]`}>{value}</div>
      <div className="text-[11px] font-bold text-muted-foreground">{label}</div>
    </div>
  );
}
