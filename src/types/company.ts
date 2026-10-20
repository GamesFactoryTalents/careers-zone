export interface CompanyProfile {
  logo: string;
  name: string;
  tagline: string;
  website: string;
  location: string;
  size: string;
  about: string;
  recruiterName: string;
  recruiterTitle: string;
}

export const DEFAULT_COMPANY: CompanyProfile = {
  logo: "",
  name: "",
  tagline: "",
  website: "",
  location: "",
  size: "",
  about: "",
  recruiterName: "",
  recruiterTitle: "",
};

export type ViewMode = "talent" | "recruiter";
