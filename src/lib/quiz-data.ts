// ============================================================
// تحدّي — game data & state
// ============================================================

import { EXTRA_CHALLENGES } from "./challenges-extra";
import { EASY_CHALLENGES, HARD_CHALLENGES } from "./challenges-tiers";
import { inferTier, tiersForDifficulty } from "./difficulty";

export type SkillKey = "speed" | "logic" | "focus" | "math" | "memory";

export const SKILLS: Record<SkillKey, { name: string; emoji: string; tint: string; desc: string }> = {
  speed:  { name: "سرعة التفكير", emoji: "⚡", tint: "fun-3", desc: "أجب بسرعة" },
  logic:  { name: "الذكاء والمنطق", emoji: "🧠", tint: "fun-4", desc: "فكّر بمنطق" },
  focus:  { name: "التركيز",        emoji: "🎯", tint: "fun-2", desc: "ركّز جيداً" },
  math:   { name: "الحساب",         emoji: "🔢", tint: "fun-1", desc: "احسب بذكاء" },
  memory: { name: "الذاكرة",        emoji: "🧩", tint: "fun-5", desc: "تذكّر جيداً" },
};

export type Difficulty = "beginner" | "fast" | "focus" | "challenge";

export const DIFFICULTIES: Record<Difficulty, { name: string; emoji: string; time: number; xp: number; unlockLevel: number }> = {
  beginner:  { name: "مبتدئ",  emoji: "🌱", time: 15, xp: 1,   unlockLevel: 1 },
  fast:      { name: "سريع",   emoji: "⚡", time: 8,  xp: 1.5, unlockLevel: 3 },
  focus:     { name: "تركيز",  emoji: "🎯", time: 12, xp: 2,   unlockLevel: 6 },
  challenge: { name: "تحدّي",  emoji: "🔥", time: 5,  xp: 3,   unlockLevel: 10 },
};

export function unlockedDifficulties(level: number): Difficulty[] {
  return (Object.keys(DIFFICULTIES) as Difficulty[]).filter((d) => level >= DIFFICULTIES[d].unlockLevel);
}

export type ChallengeType = "mcq" | "tf" | "math" | "odd" | "sequence" | "memory" | "logic" | "reaction";

export type Challenge = {
  id: number;
  skill: SkillKey;
  type: ChallengeType;
  question: string;
  answers: string[];
  correct: number;
  hint?: string;
  /** تصنيف صعوبة اختياري؛ إن غاب يُستنتج تلقائياً. */
  tier?: "easy" | "medium" | "hard";
};

// ---------- core challenges ----------
const CORE_CHALLENGES: Challenge[] = [
  // Speed / Reaction
  { id: 1,  skill: "speed", type: "reaction", question: "بسرعة! أي رقم أكبر؟", answers: ["47", "74"], correct: 1 },
  { id: 2,  skill: "speed", type: "reaction", question: "أيّهما أخف: ريشة أم حجر؟", answers: ["ريشة", "حجر"], correct: 0 },
  { id: 3,  skill: "speed", type: "reaction", question: "أي لون هذا النص؟ (أخضر)", answers: ["أخضر", "أحمر", "أزرق", "أصفر"], correct: 0 },
  { id: 4,  skill: "speed", type: "mcq", question: "ما هي عاصمة المملكة العربية السعودية؟", answers: ["جدة", "الرياض", "مكة", "الدمام"], correct: 1 },
  { id: 5,  skill: "speed", type: "tf",  question: "الشمس تشرق من الشرق.", answers: ["صح", "خطأ"], correct: 0 },
  { id: 6,  skill: "speed", type: "tf",  question: "٥ + ٧ = ١٣", answers: ["صح", "خطأ"], correct: 1 },
  { id: 7,  skill: "speed", type: "reaction", question: "الأقصر: ثانية، دقيقة، ساعة؟", answers: ["ثانية", "دقيقة", "ساعة"], correct: 0 },
  { id: 8,  skill: "speed", type: "reaction", question: "٩ × ٠ = ؟", answers: ["9", "0", "1"], correct: 1 },
  { id: 9,  skill: "speed", type: "tf",  question: "الأسبوع فيه ٨ أيام.", answers: ["صح", "خطأ"], correct: 1 },
  { id: 10, skill: "speed", type: "mcq", question: "أي إشارة مرور تعني قف؟", answers: ["أخضر", "أصفر", "أحمر", "أزرق"], correct: 2 },
  { id: 11, skill: "speed", type: "reaction", question: "الأكبر: ١٠٠ أم مئة؟", answers: ["١٠٠", "مئة", "متساويان"], correct: 2 },
  { id: 12, skill: "speed", type: "tf",  question: "الحوت الأزرق سمكة.", answers: ["صح", "خطأ"], correct: 1, hint: "الحوت من الثدييات" },

  // Logic
  { id: 20, skill: "logic", type: "logic", question: "إذا كان كل الطيور تطير، والنعامة طائر، هل تطير النعامة؟", answers: ["نعم منطقياً", "لا واقعياً", "كلاهما صحيح", "لا شيء"], correct: 0, hint: "من زاوية المنطق فقط" },
  { id: 21, skill: "logic", type: "logic", question: "أب عمره ٤٠، وابنه ١٠. متى يصبح الأب ضعف عمر الابن؟", answers: ["بعد ١٠ سنين", "بعد ٢٠ سنة", "بعد ٥ سنين", "لن يحدث"], correct: 1 },
  { id: 22, skill: "logic", type: "mcq", question: "ما الشيء الذي يزيد كلما أخذت منه؟", answers: ["الحفرة", "الماء", "المال", "الطعام"], correct: 0 },
  { id: 23, skill: "logic", type: "mcq", question: "الأب أكبر من الأخ، والأخ أكبر من الأخت. أصغرهم؟", answers: ["الأب", "الأخ", "الأخت", "متساوون"], correct: 2 },
  { id: 24, skill: "logic", type: "logic", question: "غرفة فيها ٣ مصابيح و٣ مفاتيح خارجها. كم مرة تحتاج دخول الغرفة لمعرفة أيّ مفتاح لأيّ مصباح؟", answers: ["١", "٢", "٣", "٠"], correct: 0, hint: "استعمل الحرارة" },
  { id: 25, skill: "logic", type: "tf",  question: "إذا كان أ = ب و ب = ج فإن أ = ج.", answers: ["صح", "خطأ"], correct: 0 },
  { id: 26, skill: "logic", type: "mcq", question: "أي كلمة تخرج عن المجموعة؟", answers: ["تفاح", "موز", "جزر", "برتقال"], correct: 2, hint: "الجزر ليس فاكهة" },
  { id: 27, skill: "logic", type: "mcq", question: "أنا لست في المكتبة، ولست في المنزل. أين أكون؟", answers: ["المكتبة", "المنزل", "مكان آخر", "الحديقة"], correct: 2 },
  { id: 28, skill: "logic", type: "logic", question: "٥ قطط تصطاد ٥ فئران في ٥ دقائق. كم قطة نحتاج لصيد ١٠٠ فأر في ١٠٠ دقيقة؟", answers: ["٥", "٢٠", "١٠٠", "٥٠"], correct: 0 },
  { id: 29, skill: "logic", type: "mcq", question: "أخو أختك الوحيد. من هو؟", answers: ["أنت", "والدك", "عمك", "خالك"], correct: 0 },
  { id: 30, skill: "logic", type: "tf",  question: "بعض الأزهار حمراء يعني كل الأزهار حمراء.", answers: ["صح", "خطأ"], correct: 1 },
  { id: 31, skill: "logic", type: "mcq", question: "قطار طوله ١ كم يعبر جسراً طوله ١ كم بسرعة ٦٠ كم/س. كم يستغرق؟", answers: ["دقيقة", "دقيقتان", "٣٠ ثانية", "٩٠ ثانية"], correct: 1 },

  // Focus / attention
  { id: 40, skill: "focus", type: "odd", question: "أيّها مختلف؟", answers: ["●", "●", "○", "●"], correct: 2 },
  { id: 41, skill: "focus", type: "odd", question: "أيّها مختلف؟", answers: ["كتاب", "كتاب", "كتب", "كتاب"], correct: 2 },
  { id: 42, skill: "focus", type: "odd", question: "أيّها مختلف؟", answers: ["🐶", "🐶", "🐶", "🐺"], correct: 3 },
  { id: 43, skill: "focus", type: "odd", question: "أيّها مختلف؟", answers: ["٢٣٤", "٢٣٤", "٢٣٥", "٢٣٤"], correct: 2 },
  { id: 44, skill: "focus", type: "odd", question: "أيّ الأشكال يختلف؟", answers: ["■", "■", "▲", "■"], correct: 2 },
  { id: 45, skill: "focus", type: "odd", question: "أيها ليس من الألوان الأساسية؟", answers: ["أحمر", "أزرق", "أخضر", "أصفر"], correct: 2 },
  { id: 46, skill: "focus", type: "odd", question: "أيها ليس من الفصول؟", answers: ["ربيع", "خريف", "قمر", "شتاء"], correct: 2 },
  { id: 47, skill: "focus", type: "odd", question: "أيها الحرف المختلف؟", answers: ["ب", "ب", "ت", "ب"], correct: 2 },
  { id: 48, skill: "focus", type: "odd", question: "أيها لا ينتمي؟", answers: ["أسد", "نمر", "فهد", "حمار"], correct: 3 },
  { id: 49, skill: "focus", type: "odd", question: "أي كلمة مكتوبة بشكل صحيح؟", answers: ["مدرصة", "مدرسة", "مذرسة", "مدرثة"], correct: 1 },
  { id: 50, skill: "focus", type: "odd", question: "أيّها مختلف؟", answers: ["🍎", "🍎", "🍏", "🍎"], correct: 2 },
  { id: 51, skill: "focus", type: "mcq", question: "كم مرة يظهر الحرف (م) في: محمد يحب المدرسة؟", answers: ["٢", "٣", "٤", "٥"], correct: 2 },

  // Math
  { id: 60, skill: "math", type: "math", question: "٧ × ٨ = ؟", answers: ["54", "56", "64", "48"], correct: 1 },
  { id: 61, skill: "math", type: "math", question: "١٥ + ٢٧ = ؟", answers: ["42", "41", "43", "40"], correct: 0 },
  { id: 62, skill: "math", type: "math", question: "٩٠ ÷ ٦ = ؟", answers: ["12", "15", "18", "9"], correct: 1 },
  { id: 63, skill: "math", type: "math", question: "٢٥٪ من ٨٠ = ؟", answers: ["15", "20", "25", "30"], correct: 1 },
  { id: 64, skill: "math", type: "math", question: "جذر ١٤٤ = ؟", answers: ["10", "11", "12", "14"], correct: 2 },
  { id: 65, skill: "math", type: "math", question: "٣² + ٤² = ؟", answers: ["25", "20", "24", "16"], correct: 0 },
  { id: 66, skill: "math", type: "math", question: "١٠٠ - ٤٧ = ؟", answers: ["43", "53", "63", "57"], correct: 1 },
  { id: 67, skill: "math", type: "math", question: "١٢ × ١٢ = ؟", answers: ["124", "144", "134", "154"], correct: 1 },
  { id: 68, skill: "math", type: "math", question: "٥٠٪ من ٢٠٠ = ؟", answers: ["50", "100", "150", "75"], correct: 1 },
  { id: 69, skill: "math", type: "math", question: "٨ × ٧ - ٦ = ؟", answers: ["48", "50", "52", "56"], correct: 1 },
  { id: 70, skill: "math", type: "math", question: "أي عدد أوّليّ؟", answers: ["9", "15", "17", "21"], correct: 2 },
  { id: 71, skill: "math", type: "sequence", question: "التالي: ٢، ٤، ٨، ١٦، ؟", answers: ["24", "32", "20", "18"], correct: 1 },
  { id: 72, skill: "math", type: "sequence", question: "التالي: ١، ١، ٢، ٣، ٥، ٨، ؟", answers: ["11", "13", "12", "10"], correct: 1, hint: "فيبوناتشي" },
  { id: 73, skill: "math", type: "sequence", question: "التالي: ٣، ٦، ١٢، ٢٤، ؟", answers: ["36", "48", "30", "42"], correct: 1 },
  { id: 74, skill: "math", type: "sequence", question: "التالي: ١٠٠، ٩٠، ٨١، ٧٣، ؟", answers: ["64", "65", "66", "67"], correct: 2, hint: "الفرق ينقص واحداً كل مرة" },
  { id: 75, skill: "math", type: "math", question: "نصف ثلث ٩٠ = ؟", answers: ["10", "15", "20", "30"], correct: 1 },

  // Memory
  { id: 80, skill: "memory", type: "memory", question: "احفظ: (٣، ٧، ١، ٩). ما الرقم الثاني؟", answers: ["3", "7", "1", "9"], correct: 1 },
  { id: 81, skill: "memory", type: "memory", question: "احفظ: (أحمر، أزرق، أخضر). ما الأول؟", answers: ["أزرق", "أخضر", "أحمر", "أصفر"], correct: 2 },
  { id: 82, skill: "memory", type: "memory", question: "احفظ: (🍎🍌🍇🥝). أيها الثالث؟", answers: ["🍎", "🍌", "🍇", "🥝"], correct: 2 },
  { id: 83, skill: "memory", type: "memory", question: "احفظ الكلمة: (سماء). كم عدد حروفها؟", answers: ["3", "4", "5", "2"], correct: 1 },
  { id: 84, skill: "memory", type: "memory", question: "احفظ: (٢٠٢٤، القاهرة، كتاب). ما هو الرقم؟", answers: ["2020", "2024", "2022", "2025"], correct: 1 },
  { id: 85, skill: "memory", type: "memory", question: "الترتيب: (ألف، باء، تاء، ثاء). ما الثالث؟", answers: ["ألف", "باء", "تاء", "ثاء"], correct: 2 },
  { id: 86, skill: "memory", type: "memory", question: "احفظ: (٥، ٩، ٤). المجموع؟", answers: ["16", "18", "20", "14"], correct: 1 },
  { id: 87, skill: "memory", type: "memory", question: "قائمة: (قطة، كلب، حصان). كم حيواناً؟", answers: ["2", "3", "4", "5"], correct: 1 },
  { id: 88, skill: "memory", type: "memory", question: "احفظ الرمز: (⭐🌙☀️). ما الأخير؟", answers: ["⭐", "🌙", "☀️", "☁️"], correct: 2 },
  { id: 89, skill: "memory", type: "memory", question: "احفظ العاصمة: (اليابان = طوكيو). ما عاصمة اليابان؟", answers: ["كيوتو", "طوكيو", "أوساكا", "سيول"], correct: 1 },
  { id: 90, skill: "memory", type: "memory", question: "احفظ: (٧-أ-٢-ب). ما ثاني عنصر؟", answers: ["7", "أ", "2", "ب"], correct: 1 },
  { id: 91, skill: "memory", type: "memory", question: "احفظ: (شمس، قمر، نجم). ما الوسط؟", answers: ["شمس", "قمر", "نجم", "كوكب"], correct: 1 },

  // General knowledge (speed)
  { id: 100, skill: "speed", type: "mcq", question: "من مخترع المصباح؟", answers: ["نيوتن", "أديسون", "أينشتاين", "تسلا"], correct: 1 },
  { id: 101, skill: "speed", type: "mcq", question: "أسرع حيوان بري؟", answers: ["الأسد", "الفهد", "الحصان", "الغزال"], correct: 1 },
  { id: 102, skill: "speed", type: "mcq", question: "أطول نهر في العالم؟", answers: ["النيل", "الأمازون", "المسيسيبي", "اليانغتسي"], correct: 0 },
  { id: 103, skill: "speed", type: "mcq", question: "عاصمة اليابان؟", answers: ["بكين", "سيول", "طوكيو", "بانكوك"], correct: 2 },
  { id: 104, skill: "speed", type: "mcq", question: "كم وجهاً للمكعب؟", answers: ["4", "6", "8", "12"], correct: 1 },
  { id: 105, skill: "speed", type: "mcq", question: "لون الأزرق + الأصفر؟", answers: ["بنفسجي", "أخضر", "برتقالي", "رمادي"], correct: 1 },
  { id: 106, skill: "speed", type: "mcq", question: "أعلى قمة؟", answers: ["كليمنجارو", "إفرست", "K2", "الألب"], correct: 1 },
  { id: 107, skill: "speed", type: "mcq", question: "كم عدد ألوان قوس قزح؟", answers: ["5", "6", "7", "8"], correct: 2 },
  { id: 108, skill: "focus", type: "mcq", question: "أيّ ليس من الثدييات؟", answers: ["الدلفين", "الخفاش", "التمساح", "الحصان"], correct: 2 },
  { id: 109, skill: "logic", type: "tf",  question: "العنكبوت من الحشرات.", answers: ["صح", "خطأ"], correct: 1, hint: "له ٨ أرجل" },
  { id: 110, skill: "speed", type: "mcq", question: "أكبر كوكب في المجموعة الشمسية؟", answers: ["الأرض", "المشتري", "زحل", "المريخ"], correct: 1 },
  { id: 111, skill: "logic", type: "mcq", question: "من كتب البخلاء؟", answers: ["المتنبي", "الجاحظ", "طه حسين", "المعري"], correct: 1 },
];

/** Full bank: core + extra (300+ challenges). */
export const CHALLENGES: Challenge[] = [...CORE_CHALLENGES, ...EXTRA_CHALLENGES, ...EASY_CHALLENGES, ...HARD_CHALLENGES];

// ---------- Daily challenges ----------
export const DAILY_CHALLENGES: Challenge[] = [
  { id: 501, skill: "logic", type: "logic", question: "٣ تفاحات، أعطيت ١، اشتريت ٥. كم لديك؟", answers: ["6", "7", "8", "9"], correct: 1 },
  { id: 502, skill: "logic", type: "mcq",   question: "أي كلمة تُقرأ من الاتجاهين؟", answers: ["كتاب", "ليل", "بيت", "قلم"], correct: 1 },
  { id: 503, skill: "math",  type: "math",  question: "رقم × نفسه = ٨١؟", answers: ["7", "8", "9", "11"], correct: 2 },
  { id: 504, skill: "logic", type: "mcq",   question: "الشيء الذي يزيد كلما أخذت منه؟", answers: ["الحفرة", "الماء", "المال", "الطعام"], correct: 0 },
  { id: 505, skill: "math",  type: "math",  question: "كم دقيقة في يوم؟", answers: ["1440", "1240", "1400", "1500"], correct: 0 },
  { id: 506, skill: "memory", type: "memory", question: "احفظ: (١٩٦٩ = القمر). سنة الهبوط؟", answers: ["1965", "1969", "1972", "1959"], correct: 1 },
  { id: 507, skill: "focus", type: "odd",   question: "أيّها مختلف؟", answers: ["🌳", "🌳", "🌲", "🌳"], correct: 2 },
];

export function getDailyChallenge(): Challenge {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length];
}

export function secondsUntilNextDaily(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((+next - +now) / 1000));
}

/**
 * يختار أسئلة مناسبة لمستوى الصعوبة:
 * المبتدئ يحصل على الأسهل فقط، والتحدّي على الأصعب.
 */
export function pickChallenges(n: number, skill?: SkillKey, difficulty?: Difficulty): Challenge[] {
  const base = skill ? CHALLENGES.filter((c) => c.skill === skill) : CHALLENGES;
  const shuffle = (arr: Challenge[]) => [...arr].sort(() => Math.random() - 0.5);

  if (!difficulty) return shuffle(base).slice(0, Math.min(n, base.length));

  const mix = tierMixForDifficulty(difficulty); // نِسَب كل طبقة
  const out: Challenge[] = [];
  const taken = new Set<number>();
  const byTier = (t: Tier) => shuffle(base.filter((c) => inferTier(c) === t && !taken.has(c.id)));
  for (const [tier, share] of mix) {
    const want = Math.round(n * share);
    for (const c of byTier(tier).slice(0, want)) {
      out.push(c);
      taken.add(c.id);
    }
  }
  // أكمل من الطبقات المفضّلة إن نقص العدد.
  for (const [tier] of mix) {
    if (out.length >= n) break;
    for (const c of byTier(tier).slice(0, n - out.length)) {
      out.push(c);
      taken.add(c.id);
    }
  }

  // احتياطي: أكمل من كامل البنك إن لم تكفِ الطبقات.
  if (out.length < n) {
    const ids = new Set(out.map((c) => c.id));
    out.push(...shuffle(base.filter((c) => !ids.has(c.id))).slice(0, n - out.length));
  }
  return shuffle(out);
}


// ---------- Levels ----------
export function xpForNextLevel(level: number): number {
  return 100 * level;
}
export function totalXpForLevel(level: number): number {
  // sum of 100 * i for i=1..level-1 = 50 * level * (level-1)
  return 50 * level * (level - 1);
}
export function levelFromXp(xp: number): number {
  // solve 50*L*(L-1) <= xp
  let L = 1;
  while (totalXpForLevel(L + 1) <= xp) L++;
  return L;
}
export function levelProgress(xp: number, level: number): number {
  const base = totalXpForLevel(level);
  const need = xpForNextLevel(level);
  return Math.max(0, Math.min(1, (xp - base) / need));
}

// ---------- Achievements ----------
export type Achievement = {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  check: (p: PlayerState) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step",   name: "أول خطوة",   desc: "أكمل تحدياً واحداً",         emoji: "🎉", check: (p) => p.totalCorrect + p.totalWrong >= 1 },
  { id: "ten_correct",  name: "عشرة أهداف",  desc: "١٠ إجابات صحيحة",           emoji: "🎯", check: (p) => p.totalCorrect >= 10 },
  { id: "fifty_correct",name: "خبير",       desc: "٥٠ إجابة صحيحة",            emoji: "🧠", check: (p) => p.totalCorrect >= 50 },
  { id: "level_5",      name: "مستوى ٥",    desc: "بلوغ المستوى ٥",            emoji: "⭐", check: (p) => p.level >= 5 },
  { id: "level_10",     name: "بطل",        desc: "بلوغ المستوى ١٠",           emoji: "🏆", check: (p) => p.level >= 10 },
  { id: "streak_3",     name: "متابع",      desc: "٣ أيام متتالية",            emoji: "🔥", check: (p) => p.streak >= 3 },
  { id: "streak_7",     name: "أسبوع كامل",  desc: "٧ أيام متتالية",            emoji: "💎", check: (p) => p.streak >= 7 },
  { id: "score_500",    name: "خمسمائة",    desc: "أفضل نتيجة ٥٠٠",           emoji: "💯", check: (p) => p.bestScore >= 500 },
  { id: "score_1000",   name: "الألف",       desc: "أفضل نتيجة ١٠٠٠",          emoji: "👑", check: (p) => p.bestScore >= 1000 },
];

// ---------- Player state ----------
export type SkillState = { xp: number; level: number; score: number };
export type PlayerState = {
  name: string;
  avatar: string;
  country: string | null;
  xp: number;
  level: number;
  score: number;
  lives: number;
  bestScore: number;
  streak: number;
  lastPlayDay: number | null;
  lastDailyDay: number | null;
  dailyBest: number;
  totalCorrect: number;
  totalWrong: number;
  skills: Record<SkillKey, SkillState>;
  achievements: string[];
};

export const AVATARS = ["🦊", "🦁", "🐼", "🐨", "🐯", "🐸", "🦉", "🐵", "🦄", "🐙"];

const KEY = "tahaddi-player";
const LB_KEY = "tahaddi-leaderboard";

function defaultPlayer(): PlayerState {
  const emptySkills = (Object.keys(SKILLS) as SkillKey[]).reduce((acc, k) => {
    acc[k] = { xp: 0, level: 1, score: 0 };
    return acc;
  }, {} as Record<SkillKey, SkillState>);
  return {
    name: "لاعب",
    avatar: "🦊",
    country: null,
    xp: 0,
    level: 1,
    score: 0,
    lives: 3,
    bestScore: 0,
    streak: 0,
    lastPlayDay: null,
    lastDailyDay: null,
    dailyBest: 0,
    totalCorrect: 0,
    totalWrong: 0,
    skills: emptySkills,
    achievements: [],
  };
}

export function loadPlayer(): PlayerState {
  if (typeof window === "undefined") return defaultPlayer();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayerState>;
      return { ...defaultPlayer(), ...parsed, skills: { ...defaultPlayer().skills, ...(parsed.skills ?? {}) } };
    }
  } catch {}
  return defaultPlayer();
}

export function savePlayer(p: PlayerState) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
  if (typeof window !== "undefined") {
    // Fire-and-forget cloud sync when signed in.
    import("./auth").then(({ maybePushProgress }) => maybePushProgress(p)).catch(() => {});
  }
}

export function updateStreak(p: PlayerState): PlayerState {
  const today = Math.floor(Date.now() / 86400000);
  if (p.lastPlayDay === today) return p;
  const streak = p.lastPlayDay === today - 1 ? p.streak + 1 : 1;
  return { ...p, streak, lastPlayDay: today };
}

export function grantAchievements(p: PlayerState): { player: PlayerState; unlocked: Achievement[] } {
  const unlocked: Achievement[] = [];
  const owned = new Set(p.achievements);
  ACHIEVEMENTS.forEach((a) => {
    if (!owned.has(a.id) && a.check(p)) {
      owned.add(a.id);
      unlocked.push(a);
    }
  });
  return { player: { ...p, achievements: Array.from(owned) }, unlocked };
}

// ---------- Leaderboard ----------
export type LBEntry = { name: string; score: number; date: number; avatar?: string; country?: string | null };
export type LBRange = "daily" | "weekly" | "monthly" | "all";

export function loadLeaderboard(): LBEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const now = Date.now();
  const seed: LBEntry[] = [
    { name: "أحمد",  score: 780, date: now - 1 * 86400000, avatar: "🦁", country: "EG" },
    { name: "فاطمة", score: 650, date: now - 2 * 86400000, avatar: "🦄", country: "SA" },
    { name: "خالد",  score: 540, date: now - 3 * 86400000, avatar: "🐯", country: "AE" },
    { name: "ليلى",  score: 430, date: now - 6 * 86400000, avatar: "🐨", country: "LB" },
    { name: "يوسف",  score: 380, date: now - 8 * 86400000, avatar: "🦉", country: "JO" },
    { name: "سارة",  score: 320, date: now - 12 * 86400000, avatar: "🐼", country: "KW" },
    { name: "عمر",   score: 280, date: now - 20 * 86400000, avatar: "🦊", country: "MA" },
    { name: "منى",   score: 210, date: now - 40 * 86400000, avatar: "🐸", country: "QA" },
  ];
  try { localStorage.setItem(LB_KEY, JSON.stringify(seed)); } catch {}
  return seed;
}

export function saveLeaderboard(entries: LBEntry[]) {
  try { localStorage.setItem(LB_KEY, JSON.stringify(entries.slice(0, 50))); } catch {}
}

export function addLeaderboardEntry(name: string, score: number, avatar?: string, country?: string | null) {
  const list = loadLeaderboard();
  list.push({ name: name || "لاعب", score, date: Date.now(), avatar, country });
  list.sort((a, b) => b.score - a.score);
  saveLeaderboard(list.slice(0, 50));
}

export function filterLB(list: LBEntry[], range: LBRange): LBEntry[] {
  const now = Date.now();
  const cutoff =
    range === "daily"   ? now - 1  * 86400000 :
    range === "weekly"  ? now - 7  * 86400000 :
    range === "monthly" ? now - 30 * 86400000 : 0;
  const filtered = list.filter((e) => e.date >= cutoff);
  return filtered.sort((a, b) => b.score - a.score).slice(0, 20);
}

// ---- Back-compat aliases (old routes/imports) ----
export type Question = Challenge;
export const QUESTIONS = CHALLENGES;
export function pickQuestions(n: number) { return pickChallenges(n); }
