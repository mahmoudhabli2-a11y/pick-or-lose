import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { setGuest } from "@/lib/auth";
import { CountryPicker } from "@/components/country-picker";
import { loadPlayer, savePlayer } from "@/lib/quiz-data";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";

type AuthSearch = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — تحدي العقول" },
      { name: "description", content: "سجّل الدخول أو أنشئ حساباً في تحدي العقول لحفظ تقدمك." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email({ message: "بريد إلكتروني غير صالح" }).max(255);
const passwordSchema = z.string().min(6, { message: "كلمة السر ٦ أحرف على الأقل" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "أدخل اسمك" }).max(24);

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const emailR = emailSchema.safeParse(email);
    const passR = passwordSchema.safeParse(password);
    if (!emailR.success) return setError(emailR.error.issues[0].message);
    if (!passR.success) return setError(passR.error.issues[0].message);
    if (isSignup) {
      const nameR = nameSchema.safeParse(name);
      if (!nameR.success) return setError(nameR.error.issues[0].message);
      if (!country) return setError("اختر دولتك");
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: emailR.data,
          password: passR.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() },
          },
        });
        if (error) throw error;
        const pl = loadPlayer();
        savePlayer({ ...pl, name: name.trim() || pl.name, country });
        if (data.session) {
          setGuest(false);
          navigate({ to: "/", replace: true });
        } else {
          setInfo("تم إنشاء الحساب. تحقق من بريدك لتأكيده ثم سجّل الدخول.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailR.data,
          password: passR.data,
        });
        if (error) throw error;
        setGuest(false);
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setError(translateAuthError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-8 pb-8">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div className="flex items-center justify-between text-white mb-6">
          <Link
            to="/welcome"
            className="rounded-full bg-white/15 backdrop-blur size-10 flex items-center justify-center border border-white/20"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="text-xl font-black drop-shadow-lg">
            {isSignup ? "إنشاء حساب" : "تسجيل الدخول"}
          </h1>
          <div className="size-10" />
        </div>

        <div className="rounded-3xl bg-white shadow-fun p-5 animate-pop">
          <form onSubmit={onSubmit} className="space-y-3">
            {isSignup && (
              <Field
                icon={<User className="size-4" />}
                placeholder="اسمك"
                value={name}
                onChange={setName}
                type="text"
              />
            )}
            {isSignup && (
              <div className="rounded-2xl border-2 border-[color:var(--border)] p-3">
                <div className="text-xs font-bold text-muted-foreground mb-2 text-right">اختر دولتك</div>
                <CountryPicker value={country} onChange={setCountry} />
              </div>
            )}
            <Field
              icon={<Mail className="size-4" />}
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={setEmail}
              type="email"
            />
            <Field
              icon={<Lock className="size-4" />}
              placeholder="كلمة السر"
              value={password}
              onChange={setPassword}
              type="password"
            />

            {error && (
              <div className="rounded-xl bg-[color:var(--destructive)]/10 text-[color:var(--destructive)] text-xs font-bold p-3 text-right">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl bg-[color:var(--fun-2)]/15 text-[color:var(--foreground)] text-xs font-bold p-3 text-right">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-primary text-white py-4 font-black text-lg shadow-card active:translate-y-0.5 transition disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin inline" />
              ) : isSignup ? (
                "إنشاء الحساب"
              ) : (
                "دخول"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm font-bold text-muted-foreground">
            {isSignup ? "لديك حساب؟ " : "ليس لديك حساب؟ "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "signin" : "signup" }}
              className="text-[color:var(--primary)] underline underline-offset-4"
            >
              {isSignup ? "سجّل الدخول" : "أنشئ حساباً"}
            </Link>
          </div>
        </div>

        <button
          onClick={() => {
            setGuest(true);
            navigate({ to: "/", replace: true });
          }}
          className="mt-4 mx-auto text-white/90 text-sm font-bold underline underline-offset-4"
        >
          المتابعة كضيف
        </button>
      </div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border-2 border-[color:var(--border)] focus-within:border-[color:var(--primary)] bg-white px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-right font-bold text-foreground placeholder:text-muted-foreground/70"
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
      />
    </label>
  );
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "بريد أو كلمة سر غير صحيحة";
  if (m.includes("already registered") || m.includes("already been")) return "هذا البريد مسجّل من قبل";
  if (m.includes("password")) return "كلمة السر ضعيفة أو غير مقبولة";
  if (m.includes("email")) return "بريد إلكتروني غير صالح";
  return msg;
}
