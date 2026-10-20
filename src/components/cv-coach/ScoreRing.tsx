import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 160 }: ScoreRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? "hsl(var(--xp-green))"
      : score >= 40
      ? "hsl(var(--accent))"
      : "hsl(var(--destructive))";

  const glowColor =
    score >= 70
      ? "hsl(142 71% 45% / 0.4)"
      : score >= 40
      ? "hsl(45 93% 58% / 0.4)"
      : "hsl(0 84% 60% / 0.4)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        {/* Animated score ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      {/* Score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-4xl font-black"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          {score}
        </motion.span>
        <span className="font-display text-[10px] text-muted-foreground tracking-widest uppercase">
          XP Score
        </span>
      </div>
    </div>
  );
}
