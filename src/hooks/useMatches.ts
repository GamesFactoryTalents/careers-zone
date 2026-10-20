import { useState, useEffect, useCallback } from "react";

const MATCHES_KEY = "levelup_matches";
const DISMISSED_KEY = "levelup_dismissed";
const RECRUITER_NOTIFICATIONS_KEY = "levelup_recruiter_notifications";
const RECRUITER_INTEREST_KEY = "levelup_recruiter_interest";

export interface RecruiterNotification {
  id: string;
  talentName: string;
  talentRole: string;
  jobId: string;
  jobTitle: string;
  company: string;
  createdAt: string;
}

export interface RecruiterInterest {
  id: string;
  candidateName: string;
  candidateRole: string;
  jobId: string;
  jobTitle: string;
  company: string;
  createdAt: string;
}

export function useMatches() {
  const [matches, setMatches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(MATCHES_KEY) || "[]");
    } catch { return []; }
  });

  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
    } catch { return []; }
  });

  const [notifications, setNotifications] = useState<RecruiterNotification[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECRUITER_NOTIFICATIONS_KEY) || "[]");
    } catch { return []; }
  });

  const [recruiterInterest, setRecruiterInterest] = useState<RecruiterInterest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECRUITER_INTEREST_KEY) || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    localStorage.setItem(RECRUITER_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(RECRUITER_INTEREST_KEY, JSON.stringify(recruiterInterest));
  }, [recruiterInterest]);

  const addMatch = useCallback((jobId: string, job?: { title?: string; company?: string }) => {
    setMatches(prev => prev.includes(jobId) ? prev : [...prev, jobId]);

    if (job?.title && job?.company) {
      const savedProfile = (() => {
        try {
          return JSON.parse(localStorage.getItem("levelup_profile") || "{}");
        } catch {
          return {};
        }
      })();

      const talentName = savedProfile.name?.trim() || "A talent";
      const talentRole = savedProfile.role?.trim() || "Game industry candidate";

      setNotifications(prev => {
        const alreadyExists = prev.some(item => item.jobId === jobId && item.talentName === talentName && item.jobTitle === job.title);
        if (alreadyExists) return prev;

        return [{
          id: `interest-${Date.now()}-${jobId}`,
          talentName,
          talentRole,
          jobId,
          jobTitle: job.title,
          company: job.company,
          createdAt: new Date().toISOString(),
        }, ...prev].slice(0, 12);
      });
    }
  }, []);

  const removeMatch = useCallback((jobId: string) => {
    setMatches(prev => prev.filter(id => id !== jobId));
  }, []);

  const dismissJob = useCallback((jobId: string) => {
    setDismissed(prev => prev.includes(jobId) ? prev : [...prev, jobId]);
  }, []);

  const addRecruiterInterest = useCallback((candidate: { name: string; role: string }, job?: { id?: string; title?: string; company?: string }) => {
    const companyName = job?.company || "Your studio";
    const jobId = job?.id || "general";
    const jobTitle = job?.title || "open role";

    setRecruiterInterest(prev => {
      const alreadyExists = prev.some(item => item.candidateName === candidate.name && item.jobId === jobId);
      if (alreadyExists) return prev;

      return [{
        id: `recruiter-interest-${Date.now()}-${candidate.name}`,
        candidateName: candidate.name,
        candidateRole: candidate.role,
        jobId,
        jobTitle,
        company: companyName,
        createdAt: new Date().toISOString(),
      }, ...prev].slice(0, 16);
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearRecruiterInterest = useCallback(() => {
    setRecruiterInterest([]);
  }, []);

  const isMatched = useCallback((jobId: string) => matches.includes(jobId), [matches]);
  const isDismissed = useCallback((jobId: string) => dismissed.includes(jobId), [dismissed]);
  const isRecruiterInterested = useCallback((candidateName: string) => recruiterInterest.some(item => item.candidateName === candidateName), [recruiterInterest]);

  const resetAll = useCallback(() => {
    setMatches([]);
    setDismissed([]);
    setNotifications([]);
    setRecruiterInterest([]);
  }, []);

  return {
    matches,
    dismissed,
    notifications,
    recruiterInterest,
    addMatch,
    removeMatch,
    dismissJob,
    addRecruiterInterest,
    isMatched,
    isDismissed,
    isRecruiterInterested,
    clearNotifications,
    clearRecruiterInterest,
    resetAll,
  };
}
