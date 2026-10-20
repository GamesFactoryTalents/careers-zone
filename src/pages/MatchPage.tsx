import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft, Handshake, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeCard from "@/components/SwipeCard";
import { Badge } from "@/components/ui/badge";
import { useRecruiter } from "@/context/RecruiterContext";
import { useAuth } from "@/hooks/useAuth";
import { useMatchmaking, type MatchInterest } from "@/hooks/useMatchmaking";
import type { Job } from "@/data/jobs";

export default function MatchPage() {
  const { viewMode } = useRecruiter();
  return viewMode === "recruiter" ? <RecruiterMatchReview /> : <TalentMatchReview />;
}

function TalentMatchReview() {
  const navigate = useNavigate();
  const { postedJobs } = useRecruiter();
  const { user, profiles, interests, jobOwners, sendInterest, decideInterest } = useMatchmaking();
  const { demoAccountType } = useAuth();
  const dismissedKey = `levelup_dismissed:${user?.id ?? "guest"}`;
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(dismissedKey) || "[]");
    } catch {
      return [];
    }
  });
  const [showMatches, setShowMatches] = useState(false);
  const [buttonExit, setButtonExit] = useState<"left" | "right" | null>(null);
  useEffect(() => localStorage.setItem(dismissedKey, JSON.stringify(dismissed)), [dismissedKey, dismissed]);
  const dismissJob = useCallback((jobId: string) => setDismissed((previous) => previous.includes(jobId) ? previous : [...previous, jobId]), []);
  const isDismissed = useCallback((jobId: string) => dismissed.includes(jobId), [dismissed]);
  const resetAll = () => setDismissed([]);

  const incoming = interests.filter((interest) =>
    interest.receiver_id === user?.id && interest.interest_type === "talent" && interest.status === "pending",
  );
  const accepted = interests.filter((interest) =>
    interest.status === "accepted" && (interest.receiver_id === user?.id || interest.sender_id === user?.id),
  );
  const availableJobs = useMemo(() => postedJobs.filter((job) => {
    const ownerId = jobOwners[job.id];
    return !!ownerId && !isDismissed(job.id) && !interests.some((interest) =>
      interest.sender_id === user?.id && interest.receiver_id === ownerId &&
      interest.interest_type === "role" && interest.job_id === job.id,
    );
  }), [postedJobs, jobOwners, interests, user, isDismissed]);
  const jobs = availableJobs.slice(0, 2);

  const act = (action: "skip" | "like") => {
    setButtonExit(action === "skip" ? "left" : "right");
    window.setTimeout(() => {
      const job = jobs[0];
      if (job) {
        if (action === "skip") dismissJob(job.id);
        else {
          const ownerId = jobOwners[job.id];
          if (ownerId) void sendInterest(ownerId, "role", job.id);
        }
      }
      setButtonExit(null);
    }, 300);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 shrink-0">
        <h1 className="font-display text-lg font-bold">Match with platform roles</h1>
        <p className="text-xs text-muted-foreground">Like a role or respond to a recruiter request. Messaging unlocks after the other side accepts.</p>
      </div>

      {incoming.length > 0 && (
        <section className="mb-3 space-y-2 rounded-xl border border-xp/30 bg-xp/10 p-3">
          <h2 className="font-display text-[10px] font-bold uppercase tracking-wider text-xp">Recruiter requests</h2>
          {incoming.map((interest) => {
            const recruiter = profiles.find((profile) => profile.user_id === interest.sender_id);
            return (
              <div key={interest.id} className="flex items-center justify-between gap-2">
                <p className="text-sm">{recruiter?.full_name || "A recruiter"} from {recruiter?.company_name || "a studio"} is interested in your profile.</p>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" onClick={() => void decideInterest(interest.id, "accepted")}>Match</Button>
                  <Button size="sm" variant="outline" onClick={() => void decideInterest(interest.id, "declined")}>Decline</Button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <div className="mb-3 flex shrink-0 items-center gap-2">
        <button onClick={() => setShowMatches(false)} className={`rounded-full px-3 py-1.5 font-display text-xs font-bold ${!showMatches ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          Roles
        </button>
        <button onClick={() => setShowMatches(true)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-bold ${showMatches ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          <Heart className="h-3 w-3" /> Matches
          {accepted.length > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{accepted.length}</Badge>}
        </button>
      </div>

      {showMatches ? (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {accepted.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No mutual matches yet. Accepted connections will appear here.</p>
          ) : accepted.map((interest) => {
            const otherId = interest.sender_id === user?.id ? interest.receiver_id : interest.sender_id;
            const person = profiles.find((profile) => profile.user_id === otherId);
            const job = postedJobs.find((item) => item.id === interest.job_id);
            return (
              <div key={interest.id} className="flex items-center justify-between gap-3 rounded-xl border border-xp/30 bg-card p-3">
                <div>
                  <p className="font-display text-sm font-bold">{person?.full_name || person?.company_name || "Matched connection"}</p>
                  <p className="text-[10px] text-muted-foreground">{job?.title || (interest.interest_type === "company" ? "Company interest" : person?.headline || "Recruiter connection")}</p>
                </div>
                {demoAccountType ? (
                  <Badge variant="secondary">Matched</Badge>
                ) : (
                  <Button size="sm" onClick={() => navigate(`/messages?match=${interest.id}`)}><MessageSquare className="mr-1 h-3.5 w-3.5" />Message</Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {jobs.length > 0 ? (
            <>
              <div className="relative min-h-0 flex-1">
                <AnimatePresence>
                  {jobs.map((job, index) => (
                    <SwipeCard
                      key={job.id}
                      job={job}
                      isTop={index === 0}
                      onSwipeRight={() => {
                        const ownerId = jobOwners[job.id];
                        if (ownerId) void sendInterest(ownerId, "role", job.id);
                      }}
                      onSwipeLeft={() => dismissJob(job.id)}
                      externalExit={index === 0 ? buttonExit : null}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex shrink-0 items-start justify-center gap-8 py-4">
                <button onClick={() => act("skip")} aria-label="Not this time" className="flex flex-col items-center gap-1.5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card"><ArrowLeft className="h-6 w-6 text-muted-foreground" /></span>
                  <span className="text-xs text-muted-foreground">Not this time</span>
                </button>
                <button onClick={() => act("like")} aria-label="I'm interested" className="flex flex-col items-center gap-1.5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-xp/60 bg-xp/10"><Handshake className="h-6 w-6 text-xp" /></span>
                  <span className="text-xs">I'm interested</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-12 text-center">
              <Handshake className="h-12 w-12 text-muted-foreground/30" />
              <p className="font-display text-sm font-bold">{postedJobs.length ? "All caught up!" : "No platform roles yet"}</p>
              <p className="text-xs text-muted-foreground">{postedJobs.length ? "You've reviewed all available platform-published roles." : "Company-published roles will appear here when they become available."}</p>
              {postedJobs.length > 0 && <Button variant="outline" size="sm" onClick={resetAll}>Reset skipped roles</Button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecruiterMatchReview() {
  const navigate = useNavigate();
  const { demoAccountType } = useAuth();
  const { postedJobs } = useRecruiter();
  const { user, profiles, interests, decideInterest, loading } = useMatchmaking();
  const incoming = interests.filter((interest) =>
    interest.receiver_id === user?.id && interest.status === "pending" &&
    (interest.interest_type === "role" || interest.interest_type === "company"),
  );
  const accepted = interests.filter((interest) =>
    interest.status === "accepted" && (
      (interest.receiver_id === user?.id && (interest.interest_type === "role" || interest.interest_type === "company")) ||
      (interest.sender_id === user?.id && interest.interest_type === "talent")
    ),
  );
  const profileFor = (interest: MatchInterest) => profiles.find((profile) =>
    profile.user_id === (interest.interest_type === "talent" ? interest.receiver_id : interest.sender_id),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Talent matches</h1>
        <p className="mt-1 text-xs text-muted-foreground">Review talents interested in your roles or company. Accept to unlock messaging.</p>
      </div>
      <InterestList
        title="New talent interest"
        empty="No pending talent interest yet."
        interests={incoming}
        profiles={profiles}
        jobs={postedJobs}
        onDecision={decideInterest}
      />
      <section className="space-y-2">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Matched talents</h2>
        {loading ? <p className="text-sm text-muted-foreground">Loading matches…</p> : accepted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Accepted connections will appear here.</p>
        ) : accepted.map((interest) => {
          const talent = profileFor(interest);
          return (
            <div key={interest.id} className="flex items-center justify-between gap-3 rounded-xl border border-xp/30 bg-card p-3">
              <div>
                <p className="font-display text-sm font-bold">{talent?.full_name || "Talent"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {interest.interest_type === "role" ? "Interested in a role" : interest.interest_type === "company" ? "Interested in your company" : "Accepted your recruiter request"}
                </p>
              </div>
              {demoAccountType ? (
                <Badge variant="secondary">Matched</Badge>
              ) : (
                <Button size="sm" onClick={() => navigate(`/messages?match=${interest.id}`)}><MessageSquare className="mr-1 h-3.5 w-3.5" />Message</Button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function InterestList({
  title,
  empty,
  interests,
  profiles,
  jobs,
  onDecision,
}: {
  title: string;
  empty: string;
  interests: MatchInterest[];
  profiles: ReturnType<typeof useMatchmaking>["profiles"];
  jobs: Job[];
  onDecision: ReturnType<typeof useMatchmaking>["decideInterest"];
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-primary">{title}</h2>
      {interests.length === 0 ? <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{empty}</p> : interests.map((interest) => {
        const talent = profiles.find((profile) => profile.user_id === interest.sender_id);
        const role = jobs.find((job) => job.id === interest.job_id);
        const profileData = talent?.profile ?? {};
        const skills = Array.isArray(profileData.skills) ? profileData.skills.filter((skill): skill is string => typeof skill === "string") : [];
        return (
          <article key={interest.id} className="space-y-3 rounded-xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-sm font-bold">{talent?.full_name || "Talent"}</p>
                <p className="text-xs text-muted-foreground">{talent?.headline || "Game industry professional"} · {talent?.location || "Location not set"}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{interest.interest_type === "role" ? `Interested in ${role?.title || "one of your roles"}` : "Interested in your company"}</p>
              </div>
              <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">New</Badge>
            </div>
            {skills.length > 0 && <div className="flex flex-wrap gap-1">{skills.slice(0, 6).map((skill) => <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>)}</div>}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => void onDecision(interest.id, "accepted")}><Check className="mr-1 h-3.5 w-3.5" />Match</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => void onDecision(interest.id, "declined")}><X className="mr-1 h-3.5 w-3.5" />Decline</Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
