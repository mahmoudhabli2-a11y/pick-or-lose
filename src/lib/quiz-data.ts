export type Question = {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correct: number; // index
};

export const QUESTIONS: Question[] = [
  { id: 1, category: "معلومات عامة", question: "ما هي عاصمة المملكة العربية السعودية؟", answers: ["جدة", "الرياض", "مكة", "الدمام"], correct: 1 },
  { id: 2, category: "معلومات عامة", question: "من هو مخترع المصباح الكهربائي؟", answers: ["نيوتن", "أديسون", "أينشتاين", "تسلا"], correct: 1 },
  { id: 3, category: "حيوانات", question: "ما هو أسرع حيوان بري في العالم؟", answers: ["الأسد", "الفهد", "الحصان", "الغزال"], correct: 1 },
  { id: 4, category: "حيوانات", question: "كم عدد أرجل العنكبوت؟", answers: ["6", "8", "10", "4"], correct: 1 },
  { id: 5, category: "حيوانات", question: "ما هو أكبر حيوان في العالم؟", answers: ["الفيل", "الحوت الأزرق", "الزرافة", "القرش"], correct: 1 },
  { id: 6, category: "جغرافيا", question: "ما هو أطول نهر في العالم؟", answers: ["النيل", "الأمازون", "المسيسيبي", "اليانغتسي"], correct: 0 },
  { id: 7, category: "جغرافيا", question: "في أي قارة تقع مصر؟", answers: ["آسيا", "أفريقيا", "أوروبا", "أستراليا"], correct: 1 },
  { id: 8, category: "جغرافيا", question: "ما هي أكبر صحراء في العالم؟", answers: ["الصحراء الكبرى", "صحراء غوبي", "القطب الجنوبي", "صحراء العرب"], correct: 2 },
  { id: 9, category: "جغرافيا", question: "ما هي عاصمة اليابان؟", answers: ["بكين", "سيول", "طوكيو", "بانكوك"], correct: 2 },
  { id: 10, category: "أرقام", question: "كم يساوي 7 × 8؟", answers: ["54", "56", "64", "48"], correct: 1 },
  { id: 11, category: "أرقام", question: "ما هو الرقم التالي: 2, 4, 8, 16, ؟", answers: ["24", "32", "20", "18"], correct: 1 },
  { id: 12, category: "أرقام", question: "كم عدد أيام السنة الكبيسة؟", answers: ["365", "366", "364", "360"], correct: 1 },
  { id: 13, category: "أرقام", question: "كم يساوي جذر الرقم 144؟", answers: ["10", "11", "12", "14"], correct: 2 },
  { id: 14, category: "تفكير بصري", question: "أي شكل له ثلاثة أضلاع فقط؟", answers: ["المربع", "المثلث", "الدائرة", "المستطيل"], correct: 1 },
  { id: 15, category: "تفكير بصري", question: "كم وجهاً للمكعب؟", answers: ["4", "6", "8", "12"], correct: 1 },
  { id: 16, category: "تفكير بصري", question: "أي لون ينتج من مزج الأزرق والأصفر؟", answers: ["البنفسجي", "الأخضر", "البرتقالي", "الرمادي"], correct: 1 },
  { id: 17, category: "معلومات عامة", question: "كم عدد ألوان قوس قزح؟", answers: ["5", "6", "7", "8"], correct: 2 },
  { id: 18, category: "حيوانات", question: "أي من هذه الحيوانات ليس من الثدييات؟", answers: ["الدلفين", "الخفاش", "التمساح", "الحصان"], correct: 2 },
  { id: 19, category: "جغرافيا", question: "ما هي أعلى قمة في العالم؟", answers: ["كليمنجارو", "إفرست", "الألب", "K2"], correct: 1 },
  { id: 20, category: "معلومات عامة", question: "في أي عام هبط الإنسان على القمر لأول مرة؟", answers: ["1965", "1969", "1972", "1959"], correct: 1 },
];

export const DAILY_CHALLENGES: Question[] = [
  { id: 101, category: "تحدي اليوم", question: "إذا كان لديك 3 تفاحات وأعطيت 1، ثم اشتريت 5، كم لديك الآن؟", answers: ["6", "7", "8", "9"], correct: 1 },
  { id: 102, category: "تحدي اليوم", question: "ما الكلمة التي تُقرأ نفسها من الاتجاهين؟", answers: ["كتاب", "ليل", "بيت", "قلم"], correct: 1 },
  { id: 103, category: "تحدي اليوم", question: "أي رقم إذا ضربته في نفسه يعطي 81؟", answers: ["7", "8", "9", "11"], correct: 2 },
  { id: 104, category: "تحدي اليوم", question: "ما هو الشيء الذي يزيد كلما أخذت منه؟", answers: ["الحفرة", "الماء", "الطعام", "المال"], correct: 0 },
  { id: 105, category: "تحدي اليوم", question: "كم دقيقة في يوم واحد؟", answers: ["1440", "1240", "1400", "1500"], correct: 0 },
];

export function getDailyChallenge(): Question {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length];
}

// ---- Local storage ----
export type PlayerState = {
  score: number;
  level: number;
  lives: number;
  bestScore: number;
  lastDailyDay: number | null;
};

const KEY = "ekhtar-player";
const LB_KEY = "ekhtar-leaderboard";

export function loadPlayer(): PlayerState {
  if (typeof window === "undefined") return { score: 0, level: 1, lives: 3, bestScore: 0, lastDailyDay: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { score: 0, level: 1, lives: 3, bestScore: 0, lastDailyDay: null };
}

export function savePlayer(s: PlayerState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export type LBEntry = { name: string; score: number; date: number };

export function loadLeaderboard(): LBEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed with sample players
  const seed: LBEntry[] = [
    { name: "أحمد", score: 180, date: Date.now() },
    { name: "فاطمة", score: 150, date: Date.now() },
    { name: "خالد", score: 120, date: Date.now() },
    { name: "ليلى", score: 90, date: Date.now() },
    { name: "يوسف", score: 60, date: Date.now() },
  ];
  try { localStorage.setItem(LB_KEY, JSON.stringify(seed)); } catch {}
  return seed;
}

export function saveLeaderboard(entries: LBEntry[]) {
  try { localStorage.setItem(LB_KEY, JSON.stringify(entries.slice(0, 10))); } catch {}
}

export function addLeaderboardEntry(name: string, score: number) {
  const list = loadLeaderboard();
  list.push({ name: name || "لاعب", score, date: Date.now() });
  list.sort((a, b) => b.score - a.score);
  saveLeaderboard(list.slice(0, 10));
}

export function pickQuestions(n: number): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
