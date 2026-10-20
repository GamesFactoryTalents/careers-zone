import type { Job } from "@/data/jobs";
import type { CompanyProfile } from "@/types/company";

/** What the recruiter reviews and edits before publishing. */
export interface JobDraft {
  title: string;
  location: string;
  workMode: Job["workMode"];
  category: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  tags: string[];
  applyUrl: string;
}

export const EMPTY_DRAFT: JobDraft = {
  title: "",
  location: "",
  workMode: "On-site",
  category: "Game Designer",
  experienceLevel: "Mid",
  description: "",
  requirements: [],
  tags: [],
  applyUrl: "",
};

/** Turn a reviewed draft into a live job, always shown under the recruiter's company. */
export function buildPostedJob(draft: JobDraft, company: CompanyProfile, now: Date = new Date()): Job {
  return {
    id: `r-${now.getTime()}`,
    title: draft.title.trim(),
    company: company.name.trim(),
    companyLogo: company.logo || undefined,
    location: draft.location.trim() || company.location.trim() || "Remote",
    workMode: draft.workMode,
    category: draft.category,
    experienceLevel: draft.experienceLevel,
    description: draft.description.trim(),
    requirements: draft.requirements.map((r) => r.trim()).filter(Boolean),
    tags: draft.tags.map((t) => t.trim()).filter(Boolean),
    postedDate: now.toISOString().slice(0, 10),
    applyUrl: draft.applyUrl.trim() || company.website.trim(),
    source: "recruiter",
  };
}

/** Recruiter-published roles come first, followed by the existing job list. */
export function mergeJobs(posted: Job[], base: Job[]): Job[] {
  const ids = new Set(posted.map((j) => j.id));
  return [...posted, ...base.filter((j) => !ids.has(j.id))];
}

/** Keep a role's company in sync when the recruiter edits their company profile. */
export function applyCompanyToJobs(jobs: Job[], company: CompanyProfile): Job[] {
  return jobs.map((j) => ({ ...j, company: company.name.trim() || j.company, companyLogo: company.logo || undefined }));
}
