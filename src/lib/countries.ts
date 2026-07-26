// ============================================================
// تحدي العقول — الدول والأعلام
// ============================================================

export type Country = { code: string; name: string; flag: string };

export const COUNTRIES: Country[] = [
  { code: "LB", name: "لبنان", flag: "🇱🇧" },
  { code: "SA", name: "السعودية", flag: "🇸🇦" },
  { code: "AE", name: "الإمارات", flag: "🇦🇪" },
  { code: "EG", name: "مصر", flag: "🇪🇬" },
  { code: "KW", name: "الكويت", flag: "🇰🇼" },
  { code: "QA", name: "قطر", flag: "🇶🇦" },
  { code: "BH", name: "البحرين", flag: "🇧🇭" },
  { code: "OM", name: "عمان", flag: "🇴🇲" },
  { code: "JO", name: "الأردن", flag: "🇯🇴" },
  { code: "SY", name: "سوريا", flag: "🇸🇾" },
  { code: "IQ", name: "العراق", flag: "🇮🇶" },
  { code: "PS", name: "فلسطين", flag: "🇵🇸" },
  { code: "YE", name: "اليمن", flag: "🇾🇪" },
  { code: "MA", name: "المغرب", flag: "🇲🇦" },
  { code: "DZ", name: "الجزائر", flag: "🇩🇿" },
  { code: "TN", name: "تونس", flag: "🇹🇳" },
  { code: "LY", name: "ليبيا", flag: "🇱🇾" },
  { code: "SD", name: "السودان", flag: "🇸🇩" },
  { code: "MR", name: "موريتانيا", flag: "🇲🇷" },
  { code: "SO", name: "الصومال", flag: "🇸🇴" },
  { code: "DJ", name: "جيبوتي", flag: "🇩🇯" },
  { code: "KM", name: "جزر القمر", flag: "🇰🇲" },
  { code: "TR", name: "تركيا", flag: "🇹🇷" },
  { code: "OT", name: "دولة أخرى", flag: "🌍" },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code?: string | null): Country | null {
  if (!code) return null;
  return BY_CODE.get(code) ?? null;
}

export function countryFlag(code?: string | null): string {
  return getCountry(code)?.flag ?? "";
}

export function countryName(code?: string | null): string {
  return getCountry(code)?.name ?? "غير محدد";
}
