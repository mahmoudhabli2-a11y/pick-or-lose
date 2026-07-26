// ============================================================
// تحدي العقول — مشاركة النتيجة / التحدي
// ============================================================

export const APP_NAME = "تحدي العقول";
export const APP_TAGLINE = "🏆 تحدّى عقلك";

const SITE = "https://pick-or-lose.lovable.app";

export function buildShareText(opts: {
  name: string;
  score?: number;
  level?: number;
  rank?: number | null;
  flag?: string;
}): string {
  const { name, score, level, rank, flag } = opts;
  const lines: string[] = [];
  lines.push(`🏆 ${APP_NAME}`);
  lines.push(`أنا ${name}${flag ? " " + flag : ""}`);
  if (typeof score === "number") lines.push(`🎯 نقاطي: ${score}`);
  if (typeof level === "number") lines.push(`⚡ مستواي: ${level}`);
  if (rank) lines.push(`📊 ترتيبي: #${rank}`);
  lines.push("");
  lines.push("تحدَّ أصدقاءك وشوف مين أذكى! 👇");
  lines.push(SITE);
  return lines.join("\n");
}

/** Native share when available, otherwise WhatsApp, otherwise clipboard. */
export async function shareRank(text: string): Promise<"shared" | "copied" | "whatsapp"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: APP_NAME, text });
      return "shared";
    } catch {
      /* user cancelled → fall through */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    return "whatsapp";
  }
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
