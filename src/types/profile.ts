export interface UserProfile {
  profilePicture: string;
  name: string;
  location: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  role: string;
  experienceLevel: string;
  skills: string[];
  workExperience: string;
  education: string;
  showreelUrl: string;
  coverLetter: string;
  preferredGenres: string[];
  studioSize: string;
  workMode: string;
  preferredCountry: string;
  cvFileName: string;
  salaryMin: string;
  salaryMax: string;
  favoriteGames: string;
  shippedTitles: string;
  availability: string;
  languages: string[];
}

export const GAME_ROLES = [
  "Game Designer",
  "Level Designer",
  "Narrative Designer",
  "2D Artist",
  "3D Artist",
  "Technical Artist",
  "Animator",
  "Art Director",
  "Gameplay Programmer",
  "Engine Programmer",
  "Tools Programmer",
  "Backend Programmer",
  "Frontend Programmer",
  "Producer",
  "Project Manager",
  "QA Tester",
  "QA Lead",
  "Sound Designer",
  "Composer",
  "Community Manager",
  "Marketing Manager",
  "UA Manager",
  "Data Analyst",
  "DevOps Engineer",
] as const;

export const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior", "Lead", "Director"] as const;

export const SKILLS = [
  "Unity", "Unreal Engine", "Godot", "C++", "C#", "Python", "Java", "JavaScript", "TypeScript",
  "Maya", "Blender", "3ds Max", "ZBrush", "Substance Painter", "Substance Designer",
  "Photoshop", "Illustrator", "After Effects", "Spine", "Houdini",
  "FMOD", "Wwise", "Pro Tools",
  "Git", "Perforce", "Jenkins", "Docker", "AWS", "GCP",
  "Jira", "Confluence", "Notion",
  "React", "Node.js", "Go", "Rust",
  "Machine Learning", "Data Analytics", "SQL",
] as const;

export const GENRES = [
  "Mobile F2P", "PC/Console AAA", "Indie", "VR/AR", "Casual", "Hypercasual",
  "RPG", "FPS", "Strategy", "Simulation", "Puzzle", "Sports",
] as const;

export const WORK_MODES = ["Remote", "On-site", "Hybrid"] as const;
export const STUDIO_SIZES = ["Startup (1-20)", "Small (20-50)", "Mid (50-200)", "Large (200+)", "Any"] as const;
export const AVAILABILITY_OPTIONS = ["Immediately", "1 month notice", "2 months notice", "3+ months notice", "Not actively looking"] as const;
export const LANGUAGES = [
  "English", "Finnish", "Swedish", "German", "French", "Spanish", "Japanese",
  "Korean", "Chinese (Mandarin)", "Portuguese", "Russian", "Polish", "Italian",
  "Dutch", "Norwegian", "Danish", "Arabic", "Hindi", "Turkish",
] as const;

export const DEFAULT_PROFILE: UserProfile = {
  profilePicture: "",
  name: "",
  location: "",
  portfolioUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  role: "",
  experienceLevel: "",
  skills: [],
  workExperience: "",
  education: "",
  showreelUrl: "",
  coverLetter: "",
  preferredGenres: [],
  studioSize: "",
  workMode: "",
  preferredCountry: "",
  cvFileName: "",
  salaryMin: "",
  salaryMax: "",
  favoriteGames: "",
  shippedTitles: "",
  availability: "",
  languages: [],
};
