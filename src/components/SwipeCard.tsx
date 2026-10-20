import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MapPin, Globe } from "lucide-react";
import type { Job } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";
import { getCategoryVisual } from "@/lib/categoryVisuals";

interface SwipeCardProps {
  job: Job;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  externalExit?: "left" | "right" | null;
}

export default function SwipeCard({ job, onSwipeLeft, onSwipeRight, isTop, externalExit }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacityLeft = useTransform(x, [-150, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 150], [0, 1]);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const activeExit = externalExit || exiting;
  const visual = getCategoryVisual(job.category);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExiting("right");
      setTimeout(onSwipeRight, 200);
    } else if (info.offset.x < -100) {
      setExiting("left");
      setTimeout(onSwipeLeft, 200);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden touch-none select-none"
      style={{ x, rotate, zIndex: isTop ? 10 : 1 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={
        activeExit === "left"
          ? { x: -400, opacity: 0 }
          : activeExit === "right"
          ? { x: 400, opacity: 0 }
          : { scale: isTop ? 1 : 0.95, y: isTop ? 0 : 8 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Full card background image */}
      <img
        src={visual.image}
        alt={job.category}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Swipe indicators */}
      {isTop && (
        <>
          <motion.div
            className="absolute top-8 right-8 z-20 rounded-lg border-2 border-green-400 px-4 py-2 rotate-12"
            style={{ opacity: opacityRight }}
          >
            <span className="font-display text-lg font-bold text-green-400">MATCH</span>
          </motion.div>
          <motion.div
            className="absolute top-8 left-8 z-20 rounded-lg border-2 border-red-400 px-4 py-2 -rotate-12"
            style={{ opacity: opacityLeft }}
          >
            <span className="font-display text-lg font-bold text-red-400">NOPE</span>
          </motion.div>
        </>
      )}

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <h2 className="font-display text-2xl font-bold text-white leading-tight">{job.title}</h2>
        <p className="text-white/80 text-base mt-1">{job.company}</p>

        <div className="flex items-center gap-3 mt-3 text-white/70 text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" /> {job.workMode}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs">
            {job.experienceLevel}
          </Badge>
          {job.tags.slice(0, 2).map(tag => (
            <Badge key={tag} className="bg-white/15 backdrop-blur-sm text-white/90 border-0 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
