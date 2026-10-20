import { useState, useEffect, useCallback } from "react";

const MATCHES_KEY = "levelup_matches";
const DISMISSED_KEY = "levelup_dismissed";

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

  useEffect(() => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }, [dismissed]);

  const addMatch = useCallback((jobId: string) => {
    setMatches(prev => prev.includes(jobId) ? prev : [...prev, jobId]);
  }, []);

  const removeMatch = useCallback((jobId: string) => {
    setMatches(prev => prev.filter(id => id !== jobId));
  }, []);

  const dismissJob = useCallback((jobId: string) => {
    setDismissed(prev => prev.includes(jobId) ? prev : [...prev, jobId]);
  }, []);

  const isMatched = useCallback((jobId: string) => matches.includes(jobId), [matches]);
  const isDismissed = useCallback((jobId: string) => dismissed.includes(jobId), [dismissed]);

  const resetAll = useCallback(() => {
    setMatches([]);
    setDismissed([]);
  }, []);

  return { matches, dismissed, addMatch, removeMatch, dismissJob, isMatched, isDismissed, resetAll };
}
