import type { Challenge, Difficulty } from "./quiz-data";

/** مستوى صعوبة السؤال. */
export type Tier = "easy" | "medium" | "hard";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toEnDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

/**
 * يصنّف السؤال إلى (سهل / متوسط / صعب) اعتماداً على نوعه،
 * وحجم الأرقام، وعدد العمليات الحسابية، وطول النص.
 */
export function inferTier(c: Challenge): Tier {
  if (c.tier) return c.tier;

  const raw = c.question;
  const q = toEnDigits(raw);
  const nums = (q.match(/\d+/g) || []).map(Number);
  const maxNum = nums.length ? Math.max(...nums) : 0;
  const ops = (q.match(/[×÷+\-*/]/g) || []).length;
  const len = raw.length;

  let score = 0;

  switch (c.type) {
    case "logic":
      score += 2;
      break;
    case "sequence":
      score += 1;
      break;
    case "memory":
      score += 0.5;
      break;
    case "odd":
      score -= 0.5;
      break;
    default:
      break;
  }

  if (c.type === "math" || c.type === "sequence") {
    const complex = /[√²³^]|٪|%|جذر|أوّلي|أولي|معادلة|مضاعف|كسر|متوسط|نسبة/.test(raw);
    if (complex) score += 2;
    if (/[×÷*/]/.test(q)) score += 1;
    if (ops >= 2) score += 1;
    if (maxNum > 100) score += 1;
    else if (maxNum > 20) score += 1;
    // خصم للجمع/الطرح البسيط بأرقام صغيرة فقط.
    if (!complex && maxNum <= 12 && ops <= 1 && /[+\-]/.test(q)) score -= 1.5;
  }


  if (len > 90) score += 1.5;
  else if (len > 55) score += 0.75;

  if (c.answers.length === 2) score -= 0.5;

  if (score >= 2.5) return "hard";
  if (score >= 1) return "medium";
  return "easy";
}

/** الطبقات المسموح بها لكل وضع لعب، مرتبة حسب الأفضلية. */
export function tiersForDifficulty(d: Difficulty): Tier[] {
  switch (d) {
    case "beginner":
      return ["easy"];
    case "fast":
      return ["easy", "medium"];
    case "focus":
      return ["medium", "easy"];
    case "challenge":
      return ["hard", "medium"];
  }
}
