import type { Job } from "@/data/jobs";
import type { CompanyProfile } from "@/types/company";
import type { MatchInterest, MatchProfile } from "@/hooks/useMatchmaking";
import type { UserProfile } from "@/types/profile";

export const DEMO_TALENT_ID = "demo-talent";
export const DEMO_RECRUITER_ID = "demo-recruiter";

export const DEMO_COMPANY: CompanyProfile = {
  logo: "",
  name: "Pixel Forge Studios",
  tagline: "Building vibrant worlds for players everywhere",
  website: "https://example.com",
  location: "Helsinki, Finland",
  size: "Small (20-50)",
  about: "An independent game studio creating colorful co-op adventures for PC and console.",
  recruiterName: "Morgan Lee",
  recruiterTitle: "Talent Partner",
};

const DEMO_ADDITIONAL_JOBS: Job[] = [
  {
    id: "demo-technical-artist",
    title: "Technical Artist",
    company: DEMO_COMPANY.name,
    location: DEMO_COMPANY.location,
    workMode: "Remote",
    category: "Technical Artist",
    experienceLevel: "Senior",
    description: "Bridge art and engineering by building tools, shaders, and efficient content workflows.",
    requirements: ["Experience with Unity or Unreal", "Shader and material authoring", "Python tools or pipeline experience"],
    tags: ["Unreal Engine", "Shaders", "Python", "Pipeline"],
    postedDate: "2026-10-18",
    applyUrl: "https://example.com/careers",
    source: "recruiter",
  },
  {
    id: "demo-game-producer",
    title: "Game Producer",
    company: DEMO_COMPANY.name,
    location: DEMO_COMPANY.location,
    workMode: "Hybrid",
    category: "Producer",
    experienceLevel: "Senior",
    description: "Help a cross-functional team plan, communicate, and deliver a polished cooperative game.",
    requirements: ["Experience producing games", "Strong communication and planning", "Comfortable with agile workflows"],
    tags: ["Production", "Agile", "Jira", "Game Development"],
    postedDate: "2026-10-17",
    applyUrl: "https://example.com/careers",
    source: "recruiter",
  },
];

const DEMO_CORE_JOBS: Job[] = [
  {
    id: "demo-gameplay-programmer",
    title: "Gameplay Programmer",
    company: DEMO_COMPANY.name,
    location: DEMO_COMPANY.location,
    workMode: "Hybrid",
    category: "Gameplay Programmer",
    experienceLevel: "Mid",
    description: "Help build responsive gameplay systems for our next cooperative adventure.",
    requirements: ["3+ years of game programming experience", "Strong C# and Unity skills", "Enjoys working closely with designers and artists"],
    tags: ["Unity", "C#", "Gameplay", "Co-op"],
    postedDate: "2026-10-20",
    applyUrl: "https://example.com/careers",
    source: "recruiter",
  },
  {
    id: "demo-3d-artist",
    title: "3D Environment Artist",
    company: DEMO_COMPANY.name,
    location: DEMO_COMPANY.location,
    workMode: "Hybrid",
    category: "3D Artist",
    experienceLevel: "Mid",
    description: "Create stylized environments and props for a colorful cooperative game world.",
    requirements: ["Experience creating 3D game environments", "Blender or Maya and Substance Painter", "A strong portfolio of stylized work"],
    tags: ["Blender", "Environment Art", "Substance Painter", "PC/Console"],
    postedDate: "2026-10-19",
    applyUrl: "https://example.com/careers",
    source: "recruiter",
  },
];

export const DEMO_JOBS = [...DEMO_CORE_JOBS, ...DEMO_ADDITIONAL_JOBS];

export const DEMO_TALENT_PROFILE: UserProfile = {
  profilePicture: "",
  name: "Alex Rivera",
  location: "Helsinki, Finland",
  portfolioUrl: "https://example.com/alex-portfolio",
  linkedinUrl: "",
  githubUrl: "https://github.com",
  role: "Gameplay Programmer",
  experienceLevel: "Mid",
  skills: ["Unity", "C#", "Gameplay systems", "Git"],
  workExperience: "Gameplay programmer with 4 years of experience. Shipped two PC games and built combat, progression, and UI systems in Unity.",
  education: "BSc in Computer Science",
  showreelUrl: "",
  coverLetter: "",
  preferredGenres: ["Indie", "RPG"],
  studioSize: "Small (20-50)",
  workMode: "Hybrid",
  preferredCountry: "Finland",
  cvFileName: "alex-rivera-gameplay-programmer-cv.pdf",
  salaryMin: "",
  salaryMax: "",
  favoriteGames: "Hades, It Takes Two",
  shippedTitles: "Two indie PC games",
  availability: "1 month notice",
  languages: ["English", "Spanish"],
};

export const DEMO_PROFILES: MatchProfile[] = [
  {
    user_id: DEMO_TALENT_ID,
    account_type: "talent",
    full_name: "Alex Rivera",
    headline: "Mid-level Gameplay Programmer",
    location: "Helsinki, Finland",
    profile: { ...DEMO_TALENT_PROFILE },
    company_name: "",
    company: {},
  },
  {
    user_id: "demo-talent-mika",
    account_type: "talent",
    full_name: "Mika Koskinen",
    headline: "3D Environment Artist",
    location: "Espoo, Finland",
    profile: {
      role: "3D Artist",
      experienceLevel: "Mid",
      skills: ["Blender", "Substance Painter", "Maya", "Environment Art"],
      workExperience: "Created stylized environments and props for two indie games.",
      portfolioUrl: "https://example.com/mika-portfolio",
      shippedTitles: "Northbound, Tiny Harbor",
    },
    company_name: "",
    company: {},
  },
  {
    user_id: "demo-talent-jordan",
    account_type: "talent",
    full_name: "Jordan Kim",
    headline: "Senior Technical Artist",
    location: "Stockholm, Sweden",
    profile: {
      role: "Technical Artist",
      experienceLevel: "Senior",
      skills: ["Unreal Engine", "Shaders", "Python", "Houdini"],
      workExperience: "Built shader libraries and procedural art tools for a cross-platform action game.",
      portfolioUrl: "https://example.com/jordan-portfolio",
      shippedTitles: "Starfall Arena",
    },
    company_name: "",
    company: {},
  },
  {
    user_id: "demo-talent-sam",
    account_type: "talent",
    full_name: "Sam Okafor",
    headline: "Game Producer",
    location: "Berlin, Germany",
    profile: {
      role: "Producer",
      experienceLevel: "Senior",
      skills: ["Production", "Agile", "Jira", "Team Leadership"],
      workExperience: "Produced two indie titles from pre-production through launch across design, art, and engineering teams.",
      linkedinUrl: "https://linkedin.com",
      shippedTitles: "Moonbase Garden, Neon Drift",
    },
    company_name: "",
    company: {},
  },
  {
    user_id: DEMO_RECRUITER_ID,
    account_type: "recruiter",
    full_name: DEMO_COMPANY.recruiterName,
    headline: DEMO_COMPANY.recruiterTitle,
    location: DEMO_COMPANY.location,
    profile: {},
    company_name: DEMO_COMPANY.name,
    company: { ...DEMO_COMPANY },
  },
];

export const DEMO_INTERESTS_KEY = "levelup_demo_match_interests";
export const DEMO_MESSAGES_KEY = "levelup_demo_match_messages";
export const DEMO_RESET_EVENT = "levelup-demo-reset";

export function loadDemoInterests(): MatchInterest[] {
  try {
    const raw = localStorage.getItem(DEMO_INTERESTS_KEY);
    return raw ? JSON.parse(raw) as MatchInterest[] : [];
  } catch {
    return [];
  }
}

export function resetDemoInterests(): void {
  localStorage.removeItem(DEMO_INTERESTS_KEY);
  localStorage.removeItem(DEMO_MESSAGES_KEY);
  window.dispatchEvent(new Event(DEMO_RESET_EVENT));
}
