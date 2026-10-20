import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import XPBar from "@/components/XPBar";
import { useState } from "react";

interface Category {
  name: string;
  score: number;
  icon: string;
  feedback: string;
  suggestions: string[];
}

interface CategoryCardsProps {
  categories: Category[];
}

export default function CategoryCards({ categories }: CategoryCardsProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm font-bold">Category Breakdown</h3>
      {categories.map((cat, i) => (
        <CategoryCard key={cat.name} cat={cat} index={i} />
      ))}
    </div>
  );
}

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const [open, setOpen] = useState(false);

  const scoreColor = (s: number) =>
    s >= 70 ? "text-xp" : s >= 40 ? "text-accent" : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <CollapsibleTrigger className="w-full p-3 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="font-display text-xs font-bold">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-display text-sm font-black ${scoreColor(cat.score)}`}>
                  {cat.score}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
              </div>
            </div>
            <XPBar
              value={cat.score}
              showPercent={false}
              size="sm"
              color={cat.score >= 70 ? "xp" : cat.score >= 40 ? "accent" : "primary"}
            />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
              <p className="text-xs text-muted-foreground">{cat.feedback}</p>
              {cat.suggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider">
                    Suggestions
                  </p>
                  {cat.suggestions.map((s, j) => (
                    <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">▸</span> {s}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}
