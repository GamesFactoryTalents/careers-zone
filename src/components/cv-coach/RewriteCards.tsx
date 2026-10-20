import { motion } from "framer-motion";
import { Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface RewriteSection {
  original: string;
  rewritten: string;
  reason: string;
}

interface RewriteCardsProps {
  rewrites: RewriteSection[];
}

export default function RewriteCards({ rewrites }: RewriteCardsProps) {
  if (!rewrites || rewrites.length === 0) return null;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ArrowRight className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold">Before → After Rewrites</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Copy these improved versions directly into your CV
      </p>

      {rewrites.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {/* Original */}
          <div className="p-3 bg-destructive/5 border-b border-border">
            <p className="text-[10px] font-display font-bold text-destructive/70 uppercase tracking-wider mb-1">Before</p>
            <p className="text-xs text-muted-foreground line-through decoration-destructive/30">{r.original}</p>
          </div>
          {/* Rewritten */}
          <div className="p-3 bg-xp/5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[10px] font-display font-bold text-xp/70 uppercase tracking-wider mb-1">After</p>
                <p className="text-xs text-foreground">{r.rewritten}</p>
              </div>
              <button
                onClick={() => copyText(r.rewritten)}
                className="shrink-0 p-1.5 rounded-md hover:bg-secondary transition-colors"
                title="Copy rewritten text"
              >
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">💡 {r.reason}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
