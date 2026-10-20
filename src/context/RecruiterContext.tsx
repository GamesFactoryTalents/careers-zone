import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { JOBS, type Job } from "@/data/jobs";
import { CompanyProfile, DEFAULT_COMPANY, ViewMode } from "@/types/company";
import { applyCompanyToJobs, buildPostedJob, mergeJobs, type JobDraft } from "@/lib/recruiterJobs";

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
  setViewMode: (mode: ViewMode) => void;
  company: CompanyProfile;
  updateCompany: (updates: Partial<CompanyProfile>) => void;
  postedJobs: Job[];
  publishJob: (draft: JobDraft) => Job;
  removeJob: (id: string) => Job | undefined;
  restoreJob: (job: Job) => void;
  allJobs: Job[];
}

const RecruiterContext = createContext<RecruiterContextValue | null>(null);

export function RecruiterProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => load<ViewMode>(VIEW_KEY, "talent"));
  const [company, setCompany] = useState<CompanyProfile>(() => ({ ...DEFAULT_COMPANY, ...load(COMPANY_KEY, {}) }));
  const [postedJobs, setPostedJobs] = useState<Job[]>(() => load<Job[]>(POSTED_KEY, []));

  useEffect(() => localStorage.setItem(VIEW_KEY, JSON.stringify(viewMode)), [viewMode]);
  useEffect(() => localStorage.setItem(COMPANY_KEY, JSON.stringify(company)), [company]);
  useEffect(() => localStorage.setItem(POSTED_KEY, JSON.stringify(postedJobs)), [postedJobs]);

  const updateCompany = useCallback((updates: Partial<CompanyProfile>) => {
    setCompany((prev) => {
      const next = { ...prev, ...updates };
      setPostedJobs((jobs) => applyCompanyToJobs(jobs, next));
      return next;
    });
  }, []);

  const publishJob = useCallback(
    (draft: JobDraft) => {
      const job = buildPostedJob(draft, company);
      setPostedJobs((prev) => [job, ...prev]);
      return job;
    },
    [company]
  );

  const removeJob = useCallback(
    (id: string) => {
      const job = postedJobs.find((j) => j.id === id);
      setPostedJobs((prev) => prev.filter((j) => j.id !== id));
      return job;
    },
    [postedJobs]
  );

  const restoreJob = useCallback((job: Job) => {
    setPostedJobs((prev) => (prev.some((j) => j.id === job.id) ? prev : [job, ...prev]));
  }, []);

  const allJobs = useMemo(() => mergeJobs(postedJobs, JOBS), [postedJobs]);

  return (
    <RecruiterContext.Provider
      value={{ viewMode, setViewMode, company, updateCompany, postedJobs, publishJob, removeJob, restoreJob, allJobs }}
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
