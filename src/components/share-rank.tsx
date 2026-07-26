import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { shareRank, whatsappUrl } from "@/lib/share";
import { sfxTap } from "@/lib/fx";

/** "تحدَّ أصدقاءك" — native share → clipboard → WhatsApp fallback. */
export function ShareRankButton({
  text,
  label = "تحدَّ أصدقاءك",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState<null | "copied" | "shared">(null);

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={async () => {
          sfxTap();
          const r = await shareRank(text);
          if (r === "copied") setDone("copied");
          else if (r === "shared") setDone("shared");
          setTimeout(() => setDone(null), 2500);
        }}
        className="w-full rounded-2xl bg-gradient-accent text-white px-4 py-3.5 font-black shadow-card active:translate-y-0.5 transition flex items-center justify-center gap-2"
      >
        {done ? <Check className="size-5" /> : <Share2 className="size-5" />}
        {done === "copied" ? "تم نسخ التحدي!" : done === "shared" ? "تم!" : label}
      </button>
      <a
        href={whatsappUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs font-bold text-muted-foreground underline underline-offset-4"
      >
        مشاركة على واتساب
      </a>
    </div>
  );
}
