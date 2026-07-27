import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { shareRank, buildInviteText, whatsappUrl } from "@/lib/share";
import { sfxTap } from "@/lib/fx";

/** "ادعُ أصدقاءك" — native share → clipboard → WhatsApp fallback. */
export function InviteFriendsButton({
  score,
  label = "ادعُ أصدقاءك",
  className = "",
}: {
  score?: number;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState<null | "copied" | "shared">(null);

  return (
    <div className={`animate-float-up ${className}`}>
      <button
        onClick={async () => {
          sfxTap();
          const r = await shareRank(buildInviteText(score));
          if (r === "copied") setDone("copied");
          else if (r === "shared") setDone("shared");
          setTimeout(() => setDone(null), 2500);
        }}
        className="w-full rounded-3xl bg-white/15 backdrop-blur border border-white/25 text-white px-5 py-4 shadow-card active:translate-y-0.5 transition flex items-center gap-4"
      >
        <span className="size-12 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-card shrink-0">
          {done ? <Check className="size-6" /> : <UserPlus className="size-6" />}
        </span>
        <span className="flex-1 text-right">
          <span className="block font-black text-lg">
            {done === "copied" ? "تم نسخ الرابط!" : done === "shared" ? "تمت المشاركة!" : label}
          </span>
          <span className="block text-xs font-bold text-white/75">
            شارك اللعبة وتحدَّ أصدقاءك
          </span>
        </span>
      </button>
      <a
        href={whatsappUrl(buildInviteText(score))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-xs font-bold text-white/80 underline underline-offset-4"
      >
        مشاركة على واتساب
      </a>
    </div>
  );
}
