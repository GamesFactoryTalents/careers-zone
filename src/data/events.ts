export interface DemoPerson {
  name: string;
  role: string;
  company?: string;
  location: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: "Career Fair" | "Hiring Mixer" | "Meetup" | "Remote Roundtable";
  date: string;
  city: string;
  venue: string;
  description: string;
  recruiters: DemoPerson[];
  talents: DemoPerson[];
}

export const EVENTS: EventItem[] = [
  {
    id: "berlin-game-mixer",
    title: "Berlin Game Mixer",
    type: "Hiring Mixer",
    date: "2026-11-12",
    city: "Berlin, Germany",
    venue: "Kreativ Space Hub",
    description: "A cross-studio networking event for game designers, artists, engineers and recruiters looking for strong fits before hiring decisions.",
    recruiters: [
      { name: "Mila Schmidt", role: "Talent Lead", company: "Pixel Forge", location: "Berlin" },
      { name: "Jonas Keller", role: "Recruiting Partner", company: "Northstar Labs", location: "Remote" },
      { name: "Leah Ahmed", role: "Studio Hiring Manager", company: "Questline Games", location: "Berlin" },
    ],
    talents: [
      { name: "Ava Chen", role: "Game Designer", company: "Independent", location: "Berlin" },
      { name: "Mateo Silva", role: "Frontend Programmer", company: "Freelance", location: "Remote" },
      { name: "Naomi Park", role: "3D Artist", company: "Freelance", location: "Stockholm" },
    ],
  },
  {
    id: "helsinki-hiring-day",
    title: "Helsinki Hiring Day",
    type: "Career Fair",
    date: "2026-11-18",
    city: "Helsinki, Finland",
    venue: "Arctic Studio Arena",
    description: "Live interviews, quick portfolio reviews and table-based hiring conversations for Nordic game talent and studios.",
    recruiters: [
      { name: "Sofia Pentti", role: "Recruiter", company: "Arctic Forge", location: "Helsinki" },
      { name: "Topias Aalto", role: "Producer", company: "Moonbyte", location: "Helsinki" },
      { name: "Ella Rinne", role: "Hiring Manager", company: "Cinder Games", location: "Remote" },
    ],
    talents: [
      { name: "Noah Iversen", role: "Technical Artist", company: "Independent", location: "Helsinki" },
      { name: "Sara Nyman", role: "Narrative Designer", company: "Freelance", location: "Rovaniemi" },
      { name: "Mika Laitinen", role: "Gameplay Programmer", company: "Independent", location: "Espoo" },
    ],
  },
  {
    id: "remote-player-circle",
    title: "Remote Player Circle",
    type: "Remote Roundtable",
    date: "2026-11-22",
    city: "Online",
    venue: "Virtual lounge",
    description: "A fully remote roundtable where recruiters and talent meet virtually, discuss roles and start conversations even before the next event.",
    recruiters: [
      { name: "Priya Shah", role: "Talent Partner", company: "Remote Quest", location: "Remote" },
      { name: "Alex Morgan", role: "Recruiter", company: "Signal Play", location: "Remote" },
      { name: "Tariq Hassan", role: "Studio Lead", company: "Forge & Finch", location: "Remote" },
    ],
    talents: [
      { name: "Lena Kowalski", role: "Community Manager", company: "Freelance", location: "Remote" },
      { name: "Dorian Tate", role: "QA Lead", company: "Independent", location: "Remote" },
      { name: "Emil Petrov", role: "Sound Designer", company: "Freelance", location: "Remote" },
    ],
  },
];
