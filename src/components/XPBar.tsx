import { motion } from "framer-motion";

interface XPBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "xp";
}

export default function XPBar({ value, max = 100, label, showPercent = true, size = "md", color = "xp" }: XPBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const h = size === "sm" ? "h-2" : size === "lg" ? "h-5" : "h-3";

  const bgColor = color === "primary"
    ? "bg-primary"
    : color === "accent"
    ? "bg-accent"
    : "bg-xp";

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showPercent && <span className="text-xs font-display font-bold text-foreground">{pct}%</span>}
        </div>
      )}
      <div className={`w-full ${h} rounded-full bg-secondary overflow-hidden`}>
        <motion.div
          className={`${h} rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ boxShadow: `0 0 10px hsl(var(--${color === "xp" ? "xp-green" : color}))` }}
        />
      </div>
    </div>
  );
}
