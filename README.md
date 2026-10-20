# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

---

## 🎮 App Overview

**Name:** Game Talents  
**Published URL:** https://levelupgamestalent.lovable.app  
**Type:** Mobile-first progressive web app for gaming industry job seekers  
**Tagline:** "Your game industry career starts here. Match with studios, get AI coaching, and land your dream role."

---

## 📱 Pages & Features

### 1. Home Page (`/`)
- **Hero section** with animated floating game icons (Gamepad, Code, Palette, Swords, etc.) using Framer Motion
- **Profile XP bar** — gamified profile completeness tracker (0-100%)
- **Stats dashboard** — 3 cards showing: Open Roles count, Matches count, Profile completion %
- **Quick Actions** — "Upload CV" (→ AI Coach), "Start Matching" (→ Match), "Browse All Jobs"
- **Pro Tip** — randomly rotated career tips for game industry job seekers
- **Premium Banner** — upsell CTA for premium subscription

### 2. Match Page (`/match`) — Tinder-style Job Swiping
- **SwipeCard component** with drag gestures (Framer Motion `useMotionValue`):
  - Drag threshold: 100px triggers match/dismiss
  - Visual indicators: "MATCH" (green) and "NOPE" (red) labels appear during drag
  - Cards show category-specific Unsplash background images (mapped via `categoryVisuals.ts`)
  - Card stack shows 2 cards with parallax scaling (back card at 0.95 scale, 8px offset)
- **Action buttons**: Skip (❌) and Match (❤️) with 16x16 rounded buttons
- **Matches tab**: Toggle between Swipe and Matches views; shows matched `JobCard` list
- **State**: `useMatches` hook persists matches/dismissed to `localStorage`

### 3. Jobs Page (`/jobs`)
- **Search** — full-text across title, company, tags
- **Filters** — Category (17 categories), Location (8 locations), Work Mode (Remote/On-site/Hybrid)
- **Job List** — animated `JobCard` components with staggered entry
- **Job Detail View** — full description, requirements list, tags, "Apply Now" (external link), heart/match toggle
- **20 real job listings** from Games Factory Talents covering: Backend Programmer, Game Designer, 3D Artist, Sound Designer, QA Lead, DevOps Engineer, Community Manager, etc.
- **Locations**: Europe (Remote), Berlin, Helsinki, Stockholm, Copenhagen, Warsaw, Riyadh

### 4. Profile Page (`/profile`)
- **Avatar upload** — client-side base64 with 5MB limit
- **Basic Info**: Name, Location, Portfolio/LinkedIn/GitHub/Showreel URLs
- **Role & Experience**: Select from 23 game roles, 5 experience levels, availability/notice period
- **Salary Expectations**: Min/Max annual EUR
- **Skills**: Add/remove chips from 36 predefined skills (Unity, Unreal, C++, Maya, FMOD, etc.) + custom input
- **Experience & Education**: Free-text areas
- **Shipped Titles**: Game credits section
- **Cover Letter**: Dedicated text area
- **Preferences**: Work mode, studio size (Startup to Large 200+), country, 19 languages, 12 game genres
- **Favorite Games**: Optional personality section
- **State**: `useProfile` hook persists everything to `localStorage` under key `levelup_profile`

### 5. AI Coach Page (`/ai-coach`)
- **Two modes**: CV Analysis / Cover Letter Analysis
- **File upload**: PDF (pdfjs-dist), DOCX (mammoth), TXT, JPG/PNG — max 20MB
- **Image support**: Scanned PDFs and photos sent as base64 to Gemini's multimodal vision
- **Paste text**: Collapsible textarea fallback
- **Loading UX**: Rotating carousel of 10 gaming-industry CV tips with progress dots
- **Results dashboard**:
  - **ScoreRing**: Animated SVG circle (color-coded: green ≥70, amber ≥40, red <40)
  - **Skills Radar**: Recharts RadarChart showing 5 category scores
  - **Strengths & Improvements**: Side-by-side pill cards
  - **Category Cards**: 5 collapsible cards with score, XPBar, feedback, suggestions
  - **Rewrite Cards**: "Before vs After" bullet point comparisons with copy-to-clipboard
  - **Job Match Card**: When job description is provided — match %, matched/missing keywords, suggestions
  - **"RECREATE MY CV"**: Premium upsell button → PremiumDialog

### 6. Premium System
- **PremiumBanner**: Appears on Home, Jobs detail, Match, Profile pages
- **PremiumDialog**: Lists 6 premium features at €4.99/month with 7-day free trial
- **Features listed**: AI CV Builder, Priority Matching, Auto-Apply, Unlimited Analysis, Interview Prep, Portfolio Review
- **Status**: All buttons show "Coming Soon" toast

---

## 🧠 AI & Backend

### Edge Function: `analyze-cv`
- **Runtime**: Deno (Supabase Edge Functions), JWT verification disabled
- **AI Model**: `google/gemini-2.5-flash` via Lovable AI Gateway
- **Authentication**: `LOVABLE_API_KEY` environment variable
- **Technique**: OpenAI-compatible function calling (tool_choice forced)
- **CV Rubric** (5 categories, 0-100 each):
  1. Structure & Format
  2. Game Industry Relevance
  3. Portfolio & Proof of Work
  4. Quantified Achievements
  5. ATS Keyword Optimization
- **Cover Letter Rubric** (5 categories):
  1. Hook & Opening
  2. Company Research
  3. Value Proposition
  4. Call to Action
  5. Tone & Voice
- **Output**: Structured JSON with overall score, summary, strengths, improvements, category breakdowns, rewritten sections, and optional job match analysis
- **Error handling**: Rate limiting (429), credit exhaustion (402), generic failures
- **Input limit**: CV text truncated to 12,000 chars; job description to 4,000 chars

---

## 🎨 Design System & Visual Identity

### Colors (HSL, defined in `index.css`)
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `240 10% 6%` | Near-black base |
| `--primary` | `0 72% 51%` | Red — CTAs, active states, glow |
| `--accent` | `45 93% 58%` | Gold/amber — tips, improvements |
| `--xp-green` | `142 71% 45%` | Green — XP bars, strengths |
| `--card` | `240 8% 10%` | Slightly lighter dark |
| `--muted-foreground` | `240 5% 55%` | Gray text |
| 8 category colors | `--cat-*` | Blue, purple, green, orange, pink, cyan, etc. |

### Typography
| Family | Use |
|--------|-----|
| **Rajdhani** (400-700) | Headers (h1-h6), labels, display text (`.font-display`) |
| **Inter** (300-700) | Body text, descriptions |

### Effects
| Effect | Implementation |
|--------|---------------|
| Glow Primary | `box-shadow: 0 0 20px` red halo |
| Glow Accent | Golden halo |
| Glow Text | `text-shadow` neon effects |
| Gradient Hero | 3-stop diagonal gradient with red tint |
| Gradient Card | Vertical dark-to-darker |
| Animations | `pulse-glow`, `float` keyframes + `tailwindcss-animate` |

### Assets
| Asset | Location |
|-------|----------|
| Logo (white "GAME", red "TALENTS") | `src/assets/logo.png`, `public/logo.png` |
| AI Coach background character | `src/assets/ai-coach-bg.png` |
| Category card images | 17 Unsplash URLs mapped in `categoryVisuals.ts` |
| Favicon | `public/favicon.ico` |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + tailwindcss-animate |
| Components | shadcn/ui (60+ components) |
| Animation | Framer Motion 11 |
| Charts | Recharts (RadarChart) |
| Routing | React Router DOM 6 |
| State | React hooks + localStorage |
| File parsing | pdfjs-dist (PDF), mammoth (DOCX) |
| Backend | Supabase Edge Functions (Deno) |
| AI | Gemini 2.5 Flash via Lovable AI Gateway |
| Data fetching | @tanstack/react-query |
| Forms | react-hook-form + zod |
| Toasts | sonner |

---

## 🔧 Architecture Notes

- **No authentication** — all data is localStorage-only
- **No database tables** — Supabase schema is empty (no tables in `types.ts`)
- **Static job data** — 20 jobs hardcoded in `src/data/jobs.ts`
- **No server-side persistence** — profile, matches, dismissals all in localStorage
- **Mobile-first layout** — `max-w-lg mx-auto`, fixed bottom nav with 5 tabs, `safe-bottom` for notch support

---

## 💡 Feature Improvement Suggestions

### 1. **User Authentication + Cloud Persistence** *(Critical)*
Everything is in localStorage — users lose all data on device switch or browser clear. Adding auth with database-backed profiles, matches, and CV analyses would make the app actually usable across devices and sessions.

### 2. **Real Job Feed API Integration** *(High Impact)*
20 static jobs will feel stale within days. Integrate a job scraping pipeline or API (e.g., connect to Zoho Recruit API, or build an admin panel to manage jobs via database).

### 3. **Smart Matching Algorithm** *(High Impact)*
Currently swiping is random — jobs aren't sorted by relevance. Use profile data (role, skills, experience level, location, work mode) to score and rank jobs by match percentage. Show a "Match Score" on each SwipeCard.

### 4. **CV Analysis History + Progress Tracking** *(Medium Impact)*
Save analysis results to the database with timestamps so users can track improvement over time. Show a "Score History" chart — gamify the improvement journey.

### 5. **AI Cover Letter Generator** *(Premium Feature)*
Build an actual AI-powered cover letter generator that takes the user's profile + a specific job listing and generates a tailored cover letter using Gemini.

### 6. **Push Notifications for New Job Matches** *(Engagement)*
Implement job alerts via email when new jobs match profile criteria to drive retention.

### 7. **Employer/Studio Side** *(Platform Play)*
Adding an employer dashboard where studios can post jobs, browse candidate profiles, and see match scores would create a two-sided marketplace.

### 8. **Onboarding Flow** *(UX)*
A guided 3-step onboarding (pick your role → add key skills → upload CV) would dramatically improve activation.

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
