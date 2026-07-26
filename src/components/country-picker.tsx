import { COUNTRIES } from "@/lib/countries";

/** Grid of country flags used in signup and profile setup. */
export function CountryPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string | null;
  onChange: (code: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid ${compact ? "grid-cols-5" : "grid-cols-4"} gap-2 max-h-44 overflow-y-auto pe-1`}>
      {COUNTRIES.map((c) => {
        const active = value === c.code;
        return (
          <button
            type="button"
            key={c.code}
            onClick={() => onChange(c.code)}
            className={`rounded-2xl py-2 px-1 flex flex-col items-center gap-0.5 border-2 transition ${
              active
                ? "bg-gradient-primary text-white border-transparent shadow-card"
                : "bg-muted/50 border-transparent text-foreground"
            }`}
          >
            <span className="text-xl leading-none">{c.flag}</span>
            <span className="text-[10px] font-black leading-tight text-center">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}
