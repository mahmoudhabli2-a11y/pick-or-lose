import type { Challenge } from "./quiz-data";

/** أسئلة سهلة جداً مخصّصة لوضع المبتدئ (ترحيبية وسريعة). */
export const EASY_CHALLENGES: Challenge[] = [
  // حساب بسيط جداً
  { id: 1300, skill: "math", type: "math", tier: "easy", question: "٢ + ٣ = ؟", answers: ["4", "5", "6", "7"], correct: 1 },
  { id: 1301, skill: "math", type: "math", tier: "easy", question: "٤ + ٤ = ؟", answers: ["6", "7", "8", "9"], correct: 2 },
  { id: 1302, skill: "math", type: "math", tier: "easy", question: "٩ - ٣ = ؟", answers: ["5", "6", "7", "8"], correct: 1 },
  { id: 1303, skill: "math", type: "math", tier: "easy", question: "٥ + ١ = ؟", answers: ["5", "6", "7", "4"], correct: 1 },
  { id: 1304, skill: "math", type: "math", tier: "easy", question: "٧ - ٢ = ؟", answers: ["4", "5", "6", "3"], correct: 1 },
  { id: 1305, skill: "math", type: "math", tier: "easy", question: "٦ + ٢ = ؟", answers: ["7", "8", "9", "10"], correct: 1 },
  { id: 1306, skill: "math", type: "math", tier: "easy", question: "١٠ - ٥ = ؟", answers: ["3", "4", "5", "6"], correct: 2 },
  { id: 1307, skill: "math", type: "math", tier: "easy", question: "٣ + ٦ = ؟", answers: ["8", "9", "10", "7"], correct: 1 },
  { id: 1308, skill: "math", type: "math", tier: "easy", question: "٢ × ٢ = ؟", answers: ["2", "4", "6", "8"], correct: 1 },
  { id: 1309, skill: "math", type: "math", tier: "easy", question: "٥ × ٢ = ؟", answers: ["8", "10", "12", "15"], correct: 1 },
  { id: 1310, skill: "math", type: "math", tier: "easy", question: "١٠ ÷ ٢ = ؟", answers: ["3", "4", "5", "6"], correct: 2 },
  { id: 1311, skill: "math", type: "math", tier: "easy", question: "١ + ١ = ؟", answers: ["1", "2", "3", "0"], correct: 1 },
  { id: 1312, skill: "math", type: "math", tier: "easy", question: "٨ - ٤ = ؟", answers: ["2", "3", "4", "5"], correct: 2 },
  { id: 1313, skill: "math", type: "math", tier: "easy", question: "٧ + ٣ = ؟", answers: ["9", "10", "11", "12"], correct: 1 },
  { id: 1314, skill: "math", type: "sequence", tier: "easy", question: "التالي: ١، ٢، ٣، ؟", answers: ["4", "5", "6", "3"], correct: 0 },
  { id: 1315, skill: "math", type: "sequence", tier: "easy", question: "التالي: ٢، ٤، ٦، ؟", answers: ["7", "8", "9", "10"], correct: 1 },
  { id: 1316, skill: "math", type: "sequence", tier: "easy", question: "التالي: ٥، ١٠، ١٥، ؟", answers: ["18", "20", "25", "16"], correct: 1 },
  { id: 1317, skill: "math", type: "math", tier: "easy", question: "كم عدد أصابع اليد الواحدة؟", answers: ["4", "5", "6", "10"], correct: 1 },
  { id: 1318, skill: "math", type: "math", tier: "easy", question: "كم يوماً في الأسبوع؟", answers: ["5", "6", "7", "8"], correct: 2 },

  // ذاكرة بسيطة
  { id: 1330, skill: "memory", type: "memory", tier: "easy", question: "ما لون السماء صحواً؟", answers: ["أزرق", "أخضر", "أحمر", "أسود"], correct: 0 },
  { id: 1331, skill: "memory", type: "memory", tier: "easy", question: "كم عدد فصول السنة؟", answers: ["٢", "٣", "٤", "٥"], correct: 2 },
  { id: 1332, skill: "memory", type: "memory", tier: "easy", question: "ما أول حرف في الأبجدية العربية؟", answers: ["ب", "أ", "ت", "ج"], correct: 1 },
  { id: 1333, skill: "memory", type: "memory", tier: "easy", question: "ما لون الموز الناضج؟", answers: ["أصفر", "أزرق", "بنفسجي", "أسود"], correct: 0 },

  // منطق مرحّب
  { id: 1340, skill: "logic", type: "tf", tier: "easy", question: "القطة حيوان.", answers: ["صح", "خطأ"], correct: 0 },
  { id: 1341, skill: "logic", type: "tf", tier: "easy", question: "الثلج ساخن.", answers: ["صح", "خطأ"], correct: 1 },
  { id: 1342, skill: "logic", type: "mcq", tier: "easy", question: "أيّها ليس فاكهة؟", answers: ["تفاح", "بطاطس", "موز", "عنب"], correct: 1 },
  { id: 1343, skill: "logic", type: "mcq", tier: "easy", question: "أيّها وسيلة نقل؟", answers: ["كرسي", "سيارة", "قلم", "صحن"], correct: 1 },
  { id: 1344, skill: "logic", type: "mcq", tier: "easy", question: "أيّها ليس لوناً؟", answers: ["أحمر", "أزرق", "كتاب", "أخضر"], correct: 2 },

  // تركيز واضح جداً
  { id: 1350, skill: "focus", type: "odd", tier: "easy", question: "أيّها مختلف؟", answers: ["🍌", "🍌", "🍇", "🍌"], correct: 2 },
  { id: 1351, skill: "focus", type: "odd", tier: "easy", question: "أيّها مختلف؟", answers: ["٧", "٧", "٧", "١"], correct: 3 },
  { id: 1352, skill: "focus", type: "odd", tier: "easy", question: "أيّها مختلف؟", answers: ["★", "☆", "★", "★"], correct: 1 },
  { id: 1353, skill: "focus", type: "odd", tier: "easy", question: "أيّها مختلف؟", answers: ["باب", "باب", "باب", "بات"], correct: 3 },
];

/** أسئلة صعبة متعددة الخطوات لوضع التحدّي. */
export const HARD_CHALLENGES: Challenge[] = [
  { id: 1400, skill: "math", type: "math", tier: "hard", question: "(١٢ × ٧) - (٤٥ ÷ ٩) = ؟", answers: ["79", "80", "84", "89"], correct: 0 },
  { id: 1401, skill: "math", type: "math", tier: "hard", question: "٣٥٪ من ٢٤٠ = ؟", answers: ["72", "84", "96", "78"], correct: 1 },
  { id: 1402, skill: "math", type: "math", tier: "hard", question: "إذا كان ٣س + ٧ = ٢٨ فما قيمة س؟", answers: ["5", "6", "7", "8"], correct: 2 },
  { id: 1403, skill: "math", type: "math", tier: "hard", question: "جذر ٢٢٥ + ٣² = ؟", answers: ["22", "24", "26", "28"], correct: 1 },
  { id: 1404, skill: "math", type: "sequence", tier: "hard", question: "التالي: ٢، ٦، ١٢، ٢٠، ٣٠، ؟", answers: ["40", "42", "44", "38"], correct: 1 },
  { id: 1405, skill: "math", type: "sequence", tier: "hard", question: "التالي: ١، ١، ٢، ٣، ٥، ٨، ؟", answers: ["11", "12", "13", "14"], correct: 2 },
  { id: 1406, skill: "math", type: "math", tier: "hard", question: "سعر سلعة ٢٠٠ ريال، خُصم ٢٠٪ ثم أُضيفت ضريبة ١٥٪. كم السعر النهائي؟", answers: ["176", "184", "180", "190"], correct: 1 },
  { id: 1407, skill: "logic", type: "logic", tier: "hard", question: "ثلاثة عمال يبنون جداراً في ٦ أيام. كم يوماً يحتاج عاملان لبناء الجدار نفسه؟", answers: ["٧", "٨", "٩", "١٢"], correct: 2 },
  { id: 1408, skill: "logic", type: "logic", tier: "hard", question: "ساعة تتأخر ٣ دقائق كل ساعة. بعد ٨ ساعات كم دقيقة تأخّرت؟", answers: ["١٨", "٢١", "٢٤", "٢٧"], correct: 2 },
  { id: 1409, skill: "logic", type: "logic", tier: "hard", question: "في سلة ٣ كرات حمراء و٢ زرقاء. ما احتمال سحب كرة زرقاء؟", answers: ["٢/٥", "٣/٥", "١/٢", "١/٥"], correct: 0 },
  { id: 1410, skill: "logic", type: "logic", tier: "hard", question: "إذا كان اليوم الأربعاء، فما اليوم بعد ١٠٠ يوم؟", answers: ["الاثنين", "الثلاثاء", "الجمعة", "السبت"], correct: 2 },
  { id: 1411, skill: "focus", type: "odd", tier: "hard", question: "أيّ رقم مختلف؟", answers: ["٤٨٧٦٥", "٤٨٧٦٥", "٤٨٧٦٥", "٤٨٧٥٦"], correct: 3 },
  { id: 1412, skill: "focus", type: "odd", tier: "hard", question: "أيّ تسلسل مختلف؟", answers: ["ABBABA", "ABBABA", "ABBAAB", "ABBABA"], correct: 2 },
  { id: 1413, skill: "memory", type: "memory", tier: "hard", question: "تسلسل: ٧ ٣ ٩ ٤ ٢ — ما مجموع الرقمين الأول والأخير؟", answers: ["٨", "٩", "١٠", "١١"], correct: 1 },
  { id: 1414, skill: "memory", type: "memory", tier: "hard", question: "الكلمات: قمر، بحر، جبل، نهر — ما الكلمة الثالثة معكوسة الترتيب؟", answers: ["قمر", "بحر", "جبل", "نهر"], correct: 1 },
  { id: 1415, skill: "speed", type: "reaction", tier: "hard", question: "بسرعة! أيّ ناتج أكبر: ٦×٧ أم ٥×٩؟", answers: ["٦×٧", "٥×٩", "متساويان"], correct: 1 },
  { id: 1416, skill: "speed", type: "reaction", tier: "hard", question: "بسرعة! كم عدد الأعداد الأوّلية بين ١ و٢٠؟", answers: ["٦", "٧", "٨", "٩"], correct: 2 },
];
