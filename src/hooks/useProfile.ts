import { useState, useEffect, useCallback, useRef } from "react";
import { UserProfile, DEFAULT_PROFILE } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEMO_TALENT_PROFILE } from "@/data/demoMatchmaking";

const PROFILE_KEY = "levelup_profile";

export function useProfile() {
  const { user, demoAccountType } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (demoAccountType) return demoAccountType === "talent" ? DEMO_TALENT_PROFILE : DEFAULT_PROFILE;
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const previousUserId = useRef<string | null>(null);
  const clearLocalProfileOnSignOut = useRef(false);

  useEffect(() => {
    if (demoAccountType) {
      setProfile(demoAccountType === "talent" ? DEMO_TALENT_PROFILE : DEFAULT_PROFILE);
      setLoadedUserId(null);
      return;
    }
    if (!user) {
      if (previousUserId.current) {
        previousUserId.current = null;
        clearLocalProfileOnSignOut.current = true;
        setProfile(DEFAULT_PROFILE);
      }
      setLoadedUserId(null);
      return;
    }
    previousUserId.current = user.id;
    let active = true;
    setLoadedUserId(null);
    supabase.from("user_profiles").select("profile").eq("user_id", user.id).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast.error(`Couldn't load your profile: ${error.message}`);
        } else if (data?.profile && typeof data.profile === "object" && !Array.isArray(data.profile)) {
          setProfile({ ...DEFAULT_PROFILE, ...data.profile });
        }
        setLoadedUserId(user.id);
      });
    return () => { active = false; };
  }, [demoAccountType, user]);

  useEffect(() => {
    if (demoAccountType) return;
    if (!user && clearLocalProfileOnSignOut.current) {
      localStorage.removeItem(PROFILE_KEY);
      clearLocalProfileOnSignOut.current = false;
      return;
    }
    const storageKey = user ? `${PROFILE_KEY}:${user.id}` : PROFILE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(profile));
    if (!user || loadedUserId !== user.id) return;

    const timeout = window.setTimeout(() => {
      supabase.from("user_profiles").update({
        full_name: profile.name,
        headline: profile.role,
        location: profile.location,
        profile: JSON.parse(JSON.stringify(profile)),
      }).eq("user_id", user.id).then(({ error }) => {
        if (error) toast.error(`Couldn't save your profile: ${error.message}`);
      });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [demoAccountType, loadedUserId, profile, user]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const profileCompleteness = (): number => {
    const fields: (keyof UserProfile)[] = [
      "name", "location", "role", "experienceLevel", "workExperience", "education",
    ];
    const filled = fields.filter(f => profile[f] && String(profile[f]).trim() !== "").length;
    const hasSkills = profile.skills.length > 0 ? 1 : 0;
    const hasCv = profile.cvFileName ? 1 : 0;
    return Math.round(((filled + hasSkills + hasCv) / (fields.length + 2)) * 100);
  };

  return { profile, updateProfile, profileCompleteness };
}
