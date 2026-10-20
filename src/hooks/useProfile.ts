import { useState, useEffect, useCallback } from "react";
import { UserProfile, DEFAULT_PROFILE } from "@/types/profile";

const PROFILE_KEY = "levelup_profile";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

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
