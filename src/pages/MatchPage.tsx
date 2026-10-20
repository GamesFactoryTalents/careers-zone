import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Heart, ArrowRight, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeCard from "@/components/SwipeCard";
import JobCard from "@/components/JobCard";
import { JOBS } from "@/data/jobs";
import { useMatches } from "@/hooks/useMatches";
import { Badge } from "@/components/ui/badge";
import PremiumBanner from "@/components/PremiumBanner";

export default function MatchPage() {
  const navigate = useNavigate();
  const { matches, dismissed, addMatch, dismissJob, isMatched, isDismissed, resetAll } = useMatches();
  const [showMatches, setShowMatches] = useState(false);

  const availableJobs = useMemo(
    () => JOBS.filter(j => !isMatched(j.id) && !isDismissed(j.id)),
    [matches, dismissed]
  );

  const matchedJobs = useMemo(
    () => JOBS.filter(j => isMatched(j.id)),
    [matches]
  );

  const currentJobs = availableJobs.slice(0, 2);

  const [buttonExit, setButtonExit] = useState<"left" | "right" | null>(null);

  const handleSkip = () => {
    setButtonExit("left");
    setTimeout(() => {
      if (currentJobs[0]) dismissJob(currentJobs[0].id);
      setButtonExit(null);
    }, 300);
  };

  const handleMatch = () => {
    setButtonExit("right");
    setTimeout(() => {
      if (currentJobs[0]) addMatch(currentJobs[0].id);
      setButtonExit(null);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toggle */}
      <div className="flex items-center gap-2 shrink-0 mb-3">
        <button
          onClick={() => setShowMatches(false)}
          className={`font-display text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
            !showMatches ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Swipe
        </button>
        <button
          onClick={() => setShowMatches(true)}
          className={`font-display text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            showMatches ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className="h-3 w-3" />
          Matches
          {matches.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1">{matches.length}</Badge>
          )}
        </button>
      </div>

      {showMatches ? (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {matchedJobs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No matches yet. Start swiping!</p>
              <Button variant="outline" size="sm" onClick={() => setShowMatches(false)}>
                Start Matching
              </Button>
            </div>
          ) : (
            matchedJobs.map(job => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <JobCard job={job} onClick={() => navigate(`/jobs?selected=${job.id}`)} />
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {currentJobs.length > 0 ? (
            <>
              {/* Card stack */}
              <div className="relative flex-1 min-h-0">
                <AnimatePresence>
                  {currentJobs.map((job, i) => (
                    <SwipeCard
                      key={job.id}
                      job={job}
                      isTop={i === 0}
                      onSwipeRight={() => addMatch(job.id)}
                      onSwipeLeft={() => dismissJob(job.id)}
                      externalExit={i === 0 ? buttonExit : null}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Action buttons - outside card */}
              <div className="shrink-0 py-4 flex justify-center items-start gap-8">
                <button onClick={handleSkip} aria-label="Not this time" className="flex flex-col items-center gap-1.5 group">
                  <span className="h-14 w-14 rounded-full border border-border flex items-center justify-center bg-card group-hover:bg-muted transition-colors">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </span>
                  <span className="text-xs font-display text-muted-foreground">Not this time</span>
                </button>
                <button onClick={handleMatch} aria-label="I'm interested" className="flex flex-col items-center gap-1.5 group">
                  <span className="h-14 w-14 rounded-full border border-xp/60 flex items-center justify-center bg-xp/10 group-hover:bg-xp/20 transition-colors">
                    <Handshake className="h-6 w-6 text-xp" />
                  </span>
                  <span className="text-xs font-display text-foreground">I'm interested</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4 flex-1 flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <RotateCcw className="h-12 w-12 text-muted-foreground/30" />
              </motion.div>
              <div>
                <p className="font-display text-sm font-bold">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You've reviewed all {JOBS.length} jobs.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={resetAll}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset All
                </Button>
                <Button size="sm" onClick={() => setShowMatches(true)}>
                  <Heart className="h-3 w-3 mr-1" /> View Matches ({matches.length})
                </Button>
              </div>
              <div className="w-full max-w-xs mt-2">
                <PremiumBanner text="Get Priority Matching - your profile shown first to employers" buttonLabel="Upgrade" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
