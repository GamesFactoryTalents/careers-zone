import { motion } from "framer-motion";
import { Building2, Gamepad2 } from "lucide-react";
import { useRecruiter } from "@/context/RecruiterContext";
import { useAuth } from "@/hooks/useAuth";
import type { ViewMode } from "@/types/company";

const OPTIONS: { value: ViewMode; label: string; icon: typeof Gamepad2 }[] = [
  { value: "talent", label: "Talent view", icon: Gamepad2 },
  { value: "recruiter", label: "Recruiter view", icon: Building2 },
];

export default function ViewModeSwitch() {
  const { viewMode, accountType, setViewMode } = useRecruiter();
  const { user, demoAccountType, startDemo } = useAuth();

  return (
    <div role="tablist" aria-label="Switch view" className="relative grid grid-cols-2 rounded-full border border-border bg-card p-1">
      {OPTIONS.map((opt) => {
        const active = viewMode === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            disabled={!!user && !demoAccountType && opt.value !== accountType}
            onClick={() => demoAccountType ? startDemo(opt.value) : setViewMode(opt.value)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-full py-2 text-xs font-display font-bold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="view-mode-pill"
                className="absolute inset-0 -z-10 rounded-full gradient-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="h-4 w-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
