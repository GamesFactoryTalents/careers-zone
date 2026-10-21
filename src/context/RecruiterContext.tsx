import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { JOBS, type Job } from "@/data/jobs";
import { CompanyProfile, DEFAULT_COMPANY, ViewMode } from "@/types/company";
import { applyCompanyToJobs, buildPostedJob, mergeJobs, type JobDraft } from "@/lib/recruiterJobs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEMO_COMPANY, DEMO_JOBS, DEMO_RESET_EVENT } from "@/data/demoMatchmaking";

interface StoredJob {
  ownerId: string;
  job: Job;
}

function isJob(value: unknown): value is Job {
  if (!value || typeof value !== "object") return false;
  const job = value as Record<string, unknown>;
  return typeof job.id === "string" && typeof job.title === "string" &&
    typeof job.company === "string" && typeof job.postedDate === "string";
}

const VIEW_KEY = "levelup_view_mode";
const COMPANY_KEY = "levelup_company";
const POSTED_KEY = "levelup_posted_jobs";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface RecruiterContextValue {
  viewMode: ViewMode;
  accountType: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  company: CompanyProfile;
  updateCompany: (updates: Partial<CompanyProfile>) => void;
  postedJobs: Job[];
  publishJob: (draft: JobDraft) => Promise<Job>;
  removeJob: (id: string) => Promise<Job | undefined>;
  restoreJob: (job: Job) => Promise<void>;
  allJobs: Job[];
}

const RecruiterContext = createContext<RecruiterContextValue | null>(null);

export function RecruiterProvider({ children }: { children: ReactNode }) {
  const { user, demoAccountType } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(() => demoAccountType ?? load<ViewMode>(VIEW_KEY, "talent"));
  const [company, setCompany] = useState<CompanyProfile>(() => demoAccountType === "recruiter" ? DEMO_COMPANY : ({ ...DEFAULT_COMPANY, ...load(COMPANY_KEY, {}) }));
  const [localPostedJobs, setLocalPostedJobs] = useState<Job[]>(() => demoAccountType ? [] : load<Job[]>(POSTED_KEY, []));
  const [storedJobs, setStoredJobs] = useState<StoredJob[]>([]);
  const [loadedCompanyUserId, setLoadedCompanyUserId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<ViewMode>(demoAccountType ?? "talent");
  const previousUserId = useRef<string | null>(null);
  const loadingUserId = useRef<string | null>(null);
  const clearLocalDataOnSignOut = useRef(false);

  const postedJobs = useMemo(() => {
    if (demoAccountType) return DEMO_JOBS;
    if (!user) return localPostedJobs;
    return storedJobs.filter((item) => viewMode === "recruiter" ? item.ownerId === user.id : true).map((item) => item.job);
  }, [demoAccountType, localPostedJobs, storedJobs, user, viewMode]);

  useEffect(() => {
    if (user) {
      previousUserId.current = user.id;
    } else if (previousUserId.current) {
      previousUserId.current = null;
      clearLocalDataOnSignOut.current = true;
      setCompany(DEFAULT_COMPANY);
      setLocalPostedJobs([]);
      setAccountType("talent");
      setViewMode("talent");
    }
  }, [user]);
  useEffect(() => {
    if (!demoAccountType) localStorage.setItem(VIEW_KEY, JSON.stringify(viewMode));
  }, [demoAccountType, viewMode]);
  useEffect(() => {
    if (demoAccountType) return;
    if (!user) {
      if (clearLocalDataOnSignOut.current) {
        localStorage.removeItem(COMPANY_KEY);
        localStorage.removeItem(POSTED_KEY);
        clearLocalDataOnSignOut.current = false;
        return;
      }
      localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
      localStorage.setItem(POSTED_KEY, JSON.stringify(localPostedJobs));
    }
  }, [company, demoAccountType, localPostedJobs, user]);
  useEffect(() => {
    if (demoAccountType) {
      loadingUserId.current = null;
      setLoadedCompanyUserId(null);
      setStoredJobs([]);
      setAccountType(demoAccountType);
      setViewMode(demoAccountType);
      setCompany(demoAccountType === "recruiter" ? DEMO_COMPANY : DEFAULT_COMPANY);
      return;
    }
    if (!user) {
      loadingUserId.current = null;
      setLoadedCompanyUserId(null);
      setStoredJobs([]);
      setAccountType("talent");
      return;
    }
    if (loadingUserId.current !== user.id) {
      loadingUserId.current = user.id;
      setAccountType("talent");
      setViewMode("talent");
      setCompany(DEFAULT_COMPANY);
      setStoredJobs([]);
    }
    let active = true;
    setLoadedCompanyUserId(null);
    Promise.all([
      supabase.from("user_profiles").select("company,account_type").eq("user_id", user.id).maybeSingle(),
      supabase.from("platform_jobs").select("recruiter_id,job").order("posted_at", { ascending: false }),
    ]).then(([companyResult, jobsResult]) => {
      if (!active) return;
      if (companyResult.error) toast.error(`Couldn't load company profile: ${companyResult.error.message}`);
      else {
        const row = companyResult.data;
        if (row?.account_type === "talent" || row?.account_type === "recruiter") {
          setAccountType(row.account_type);
          setViewMode(row.account_type);
        }
        if (row?.company && typeof row.company === "object" && !Array.isArray(row.company)) {
          setCompany({ ...DEFAULT_COMPANY, ...row.company });
        } else setCompany(DEFAULT_COMPANY);
      }
      if (jobsResult.error) {
        toast.error(`Couldn't load platform roles: ${jobsResult.error.message}`);
      } else {
        setStoredJobs(jobsResult.data.flatMap((row) => isJob(row.job) ? [{ ownerId: row.recruiter_id, job: row.job }] : []));
      }
      setLoadedCompanyUserId(user.id);
    });
    return () => { active = false; };
  }, [demoAccountType, user]);
  useEffect(() => {
    const reset = () => {
      setCompany(demoAccountType === "recruiter" ? DEMO_COMPANY : DEFAULT_COMPANY);
    };
    window.addEventListener(DEMO_RESET_EVENT, reset);
    return () => window.removeEventListener(DEMO_RESET_EVENT, reset);
  }, [demoAccountType]);
  useEffect(() => {
    if (demoAccountType || !user || loadedCompanyUserId !== user.id) return;
    if (accountType !== "recruiter") return;
    const timeout = window.setTimeout(() => {
      supabase.from("user_profiles").update({
        full_name: company.recruiterName || user.user_metadata.full_name || "",
        company_name: company.name,
        company: JSON.parse(JSON.stringify(company)),
      }).eq("user_id", user.id).then(({ error }) => {
        if (error) toast.error(`Couldn't save company profile: ${error.message}`);
      });
      const updates = storedJobs.filter((item) => item.ownerId === user.id).map(({ job }) =>
        supabase.from("platform_jobs").update({
          job: JSON.parse(JSON.stringify({ ...job, company: company.name.trim() || job.company, companyLogo: company.logo || undefined })),
        }).eq("id", job.id).eq("recruiter_id", user.id));
      Promise.all(updates).then((results) => {
        const failed = results.find((result) => result.error);
        if (failed?.error) toast.error(`Couldn't update published role: ${failed.error.message}`);
      });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [accountType, company, demoAccountType, loadedCompanyUserId, storedJobs, user]);

  const updateCompany = useCallback((updates: Partial<CompanyProfile>) => {
    setCompany((prev) => {
      const next = { ...prev, ...updates };
      setStoredJobs((jobs) => jobs.map((item) => item.ownerId === user?.id
        ? { ...item, job: { ...item.job, company: next.name.trim() || item.job.company, companyLogo: next.logo || undefined } }
        : item));
      setLocalPostedJobs((jobs) => applyCompanyToJobs(jobs, next));
      return next;
    });
  }, [user]);

  const publishJob = useCallback(async (draft: JobDraft) => {
      if (demoAccountType) throw new Error("Publishing is disabled in the conference demo.");
      if (!user) throw new Error("Create a recruiter account before publishing a role.");
      const job = buildPostedJob(draft, company);
      const { error } = await supabase.from("platform_jobs").insert({
        id: job.id,
        recruiter_id: user.id,
        job: JSON.parse(JSON.stringify(job)),
      });
      if (error) throw error;
      setStoredJobs((prev) => [{ ownerId: user.id, job }, ...prev.filter((item) => item.job.id !== job.id)]);
      return job;
    }, [company, demoAccountType, user]);

  const removeJob = useCallback(async (id: string) => {
      if (demoAccountType) throw new Error("Roles cannot be removed in the conference demo.");
      const job = postedJobs.find((j) => j.id === id);
      if (!job || !user) return undefined;
      const { error } = await supabase.from("platform_jobs").delete().eq("id", id).eq("recruiter_id", user.id);
      if (error) throw error;
      setStoredJobs((prev) => prev.filter((item) => item.ownerId !== user.id || item.job.id !== id));
      return job;
    }, [demoAccountType, postedJobs, user]);

  const restoreJob = useCallback(async (job: Job) => {
    if (demoAccountType) throw new Error("Roles cannot be restored in the conference demo.");
    if (!user) throw new Error("Create a recruiter account before restoring a role.");
    const { error } = await supabase.from("platform_jobs").insert({
      id: job.id,
      recruiter_id: user.id,
      job: JSON.parse(JSON.stringify(job)),
    });
    if (error) throw error;
    setStoredJobs((prev) => (prev.some((item) => item.job.id === job.id) ? prev : [{ ownerId: user.id, job }, ...prev]));
  }, [demoAccountType, user]);

  const allJobs = useMemo(
    () => mergeJobs(user && !demoAccountType ? storedJobs.map((item) => item.job) : postedJobs, JOBS),
    [demoAccountType, postedJobs, storedJobs, user],
  );

  return (
    <RecruiterContext.Provider
      value={{ viewMode, accountType, setViewMode, company, updateCompany, postedJobs, publishJob, removeJob, restoreJob, allJobs }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  const ctx = useContext(RecruiterContext);
  if (!ctx) throw new Error("useRecruiter must be used inside RecruiterProvider");
  return ctx;
}
