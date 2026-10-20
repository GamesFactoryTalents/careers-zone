import { CheckCircle2, TrendingUp } from "lucide-react";

interface StrengthsImprovementsProps {
  strengths: string[];
  improvements: string[];
}

export default function StrengthsImprovements({ strengths, improvements }: StrengthsImprovementsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-xp/20 bg-xp/5 p-3 space-y-2">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-xp" />
          <span className="font-display text-[10px] font-bold text-xp uppercase tracking-wider">Strengths</span>
        </div>
        {strengths.map((s, i) => (
          <span
            key={i}
            className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-xp/10 text-xp border border-xp/20 mr-1 mb-1"
          >
            ✓ {s}
          </span>
        ))}
        {strengths.length === 0 && (
          <p className="text-xs text-muted-foreground">Keep improving!</p>
        )}
      </div>
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 space-y-2">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-accent" />
          <span className="font-display text-[10px] font-bold text-accent uppercase tracking-wider">Improve</span>
        </div>
        {improvements.map((s, i) => (
          <span
            key={i}
            className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 mr-1 mb-1"
          >
            → {s}
          </span>
        ))}
      </div>
    </div>
  );
}
