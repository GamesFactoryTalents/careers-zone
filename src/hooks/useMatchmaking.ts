import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DEMO_INTERESTS_KEY,
  DEMO_JOBS,
  DEMO_PROFILES,
  DEMO_RECRUITER_ID,
  DEMO_TALENT_ID,
  DEMO_RESET_EVENT,
  loadDemoInterests,
} from "@/data/demoMatchmaking";

export interface MatchProfile {
  user_id: string;
  account_type: string;
  full_name: string;
  headline: string;
  location: string;
  profile: Record<string, unknown>;
  company_name: string;
  company: Record<string, unknown>;
}

export interface MatchInterest {
  id: string;
  sender_id: string;
  receiver_id: string;
  job_id: string | null;
  interest_type: "role" | "company" | "talent";
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

export function useMatchmaking() {
  const { user, demoAccountType } = useAuth();
  const demoUserId = demoAccountType === "talent" ? DEMO_TALENT_ID : demoAccountType === "recruiter" ? DEMO_RECRUITER_ID : null;
  const currentUserId = demoUserId ?? user?.id;
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [interests, setInterests] = useState<MatchInterest[]>(loadDemoInterests);
  const [jobOwners, setJobOwners] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (demoAccountType) {
      setProfiles(DEMO_PROFILES);
      setInterests(loadDemoInterests());
      setJobOwners(Object.fromEntries(DEMO_JOBS.map((job) => [job.id, DEMO_RECRUITER_ID])));
      setLoading(false);
      return;
    }
    if (!user) {
      setProfiles([]);
      setInterests([]);
      setJobOwners({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const [profileResult, interestResult, jobsResult] = await Promise.all([
      supabase.from("user_profiles").select("user_id,account_type,full_name,headline,location,profile,company_name,company")
        .neq("user_id", user.id),
      supabase.from("match_interests").select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false }),
      supabase.from("platform_jobs").select("id,recruiter_id"),
    ]);
    const errors = [profileResult.error, interestResult.error, jobsResult.error].filter(Boolean);
    if (errors.length) {
      errors.forEach((error) => toast.error(`Couldn't load matchmaking data: ${error.message}`));
      setLoading(false);
      return;
    }
    setProfiles((profileResult.data ?? []).map((profile) => ({
      ...profile,
      profile: profile.profile && typeof profile.profile === "object" && !Array.isArray(profile.profile) ? profile.profile as Record<string, unknown> : {},
      company: profile.company && typeof profile.company === "object" && !Array.isArray(profile.company) ? profile.company as Record<string, unknown> : {},
    })));
    setInterests((interestResult.data ?? []) as MatchInterest[]);
    setJobOwners(Object.fromEntries((jobsResult.data ?? []).map((job) => [job.id, job.recruiter_id])));
    setLoading(false);
  }, [demoAccountType, user]);

  useEffect(() => {
    if (demoAccountType) {
      void refresh();
      const reset = () => { void refresh(); };
      window.addEventListener(DEMO_RESET_EVENT, reset);
      return () => window.removeEventListener(DEMO_RESET_EVENT, reset);
    }
    if (!user) {
      void refresh();
      return;
    }
    void refresh();
    const channel = supabase.channel(`matchmaking-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_interests" }, () => { void refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_profiles" }, () => { void refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_jobs" }, () => { void refresh(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [demoAccountType, refresh, user]);

  const sendInterest = useCallback(async (receiverId: string, interestType: MatchInterest["interest_type"], jobId?: string) => {
    if (demoAccountType && demoUserId) {
      const existing = interests.find((item) =>
        item.sender_id === demoUserId && item.receiver_id === receiverId &&
        item.interest_type === interestType && item.job_id === (jobId ?? null));
      if (existing) return true;
      const next = [{
        id: `demo-interest-${Date.now()}`,
        sender_id: demoUserId,
        receiver_id: receiverId,
        interest_type: interestType,
        job_id: jobId ?? null,
        status: "pending" as const,
        created_at: new Date().toISOString(),
      }, ...interests];
      localStorage.setItem(DEMO_INTERESTS_KEY, JSON.stringify(next));
      setInterests(next);
      return true;
    }
    if (!user) {
      toast.error("Sign in to show interest.");
      return false;
    }
    const existing = interests.find((item) =>
      item.sender_id === user.id && item.receiver_id === receiverId &&
      item.interest_type === interestType && item.job_id === (jobId ?? null));
    if (existing) return true;
    const { error } = await supabase.from("match_interests").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      interest_type: interestType,
      job_id: jobId ?? null,
    });
    if (error) {
      toast.error(`Couldn't send interest: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  }, [demoAccountType, demoUserId, interests, refresh, user]);

  const decideInterest = useCallback(async (interestId: string, status: "accepted" | "declined") => {
    if (demoAccountType) {
      const next = interests.map((interest) => interest.id === interestId ? { ...interest, status } : interest);
      localStorage.setItem(DEMO_INTERESTS_KEY, JSON.stringify(next));
      setInterests(next);
      return true;
    }
    const { error } = await supabase.from("match_interests").update({ status }).eq("id", interestId).eq("status", "pending");
    if (error) {
      toast.error(`Couldn't update the match: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  }, [demoAccountType, interests, refresh]);

  const interestFor = useCallback((receiverId: string, interestType: MatchInterest["interest_type"], jobId?: string) => {
    if (!currentUserId) return undefined;
    return interests.find((item) =>
      item.sender_id === currentUserId && item.receiver_id === receiverId &&
      item.interest_type === interestType && item.job_id === (jobId ?? null));
  }, [currentUserId, interests]);

  return {
    user: demoUserId ? { id: demoUserId } : user,
    profiles,
    interests,
    jobOwners,
    loading,
    refresh,
    sendInterest,
    decideInterest,
    interestFor,
  };
}
