import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setGuest, isGuest } from "@/lib/auth";
import { LogIn, UserPlus, Play, Trophy } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "أهلاً بك في تحدي العقول" },
      { name: "description", content: "سجّل دخول أو أنشئ حساباً أو ادخل كضيف لبدء اللعب في تحدي العقول." },
      { property: "og:title", content: "أهلاً بك في تحدي العقول" },
      { property: "og:description", content: "منصة تحديات ذهنية عربية — طوّر عقلك يومياً." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already signed in or already chose guest, skip.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session || isGuest()) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  function continueAsGuest() {
    setGuest(true);
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14 pb-8">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div className="text-center animate-pop">
          <div className="inline-block rounded-3xl bg-white/15 backdrop-blur-sm px-5 py-1.5 mb-3 border border-white/20">
            <span className="text-white/95 text-xs font-bold tracking-wider">🏆 تحدّى عقلك</span>
          </div>
          <h1 className="text-7xl font-black text-white leading-none drop-shadow-lg">تحدّي</h1>
          <p className="mt-4 text-white/90 font-bold text-base leading-relaxed px-2">
            منصة تحديات ذهنية بالعربية.<br />طوّر سرعتك، منطقك، وذاكرتك.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-8 animate-float-up">
          <FeatureBadge emoji="⚡" label="سرعة" />
          <FeatureBadge emoji="🧠" label="منطق" />
          <FeatureBadge emoji="🎯" label="تركيز" />
          <FeatureBadge emoji="🔢" label="حساب" />
          <FeatureBadge emoji="🧩" label="ذاكرة" />
          <FeatureBadge emoji="🏆" label="تحديات" />
        </div>

        <div className="flex-1" />

        <div className="space-y-3 mt-8 animate-float-up">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white text-[color:var(--primary)] px-6 py-4 text-lg font-black shadow-fun active:translate-y-0.5 transition"
          >
            <UserPlus className="size-5" />
            إنشاء حساب جديد
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white/15 backdrop-blur border-2 border-white/40 text-white px-6 py-4 text-lg font-black active:translate-y-0.5 transition"
          >
            <LogIn className="size-5" />
            تسجيل الدخول
          </Link>
          <button
            onClick={continueAsGuest}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-transparent text-white/90 px-6 py-3 text-sm font-bold underline underline-offset-4"
          >
            <Play className="size-4" />
            المتابعة كضيف
          </button>
          <p className="text-center text-[11px] text-white/70 font-semibold">
            <Trophy className="inline size-3 mb-0.5" /> أنشئ حساباً لحفظ تقدّمك بشكل دائم
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur border border-white/20 py-3 text-center">
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs font-black text-white mt-1">{label}</div>
    </div>
  );
}
