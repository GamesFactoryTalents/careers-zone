import { motion } from "framer-motion";
import { Target } from "lucide-react";
import XPBar from "@/components/XPBar";

interface JobMatch {
  matchPercent: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface JobMatchCardProps {
  jobMatch: JobMatch;
}

export default function JobMatchCard({ jobMatch }: JobMatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold">Job Description Match</h3>
        <span
          className={`ml-auto font-display text-lg font-black ${
            jobMatch.matchPercent >= 70 ? "text-xp" : jobMatch.matchPercent >= 40 ? "text-accent" : "text-destructive"
          }`}
        >
          {jobMatch.matchPercent}%
        </span>
      </div>

      <XPBar
        value={jobMatch.matchPercent}
        showPercent={false}
        size="sm"
        color={jobMatch.matchPercent >= 70 ? "xp" : jobMatch.matchPercent >= 40 ? "accent" : "primary"}
      />

      {/* Matched keywords */}
      {jobMatch.matchedKeywords.length > 0 && (
        <div>
          <p className="text-[10px] font-display font-bold text-xp/70 uppercase tracking-wider mb-1">
            ✓ Matched Keywords
          </p>
          <div className="flex flex-wrap gap-1">
            {jobMatch.matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-xp/10 text-xp border border-xp/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing keywords */}
      {jobMatch.missingKeywords.length > 0 && (
        <div>
          <p className="text-[10px] font-display font-bold text-destructive/70 uppercase tracking-wider mb-1">
            ✗ Missing Keywords
          </p>
          <div className="flex flex-wrap gap-1">
            {jobMatch.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {jobMatch.suggestions.length > 0 && (
        <div className="space-y-1">
          {jobMatch.suggestions.map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="text-accent mt-0.5">▸</span> {s}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
