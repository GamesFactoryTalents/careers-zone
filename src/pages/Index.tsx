import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Gamepad2, Briefcase, Sparkles, Trophy, Zap, Code, Palette, Target, Music, Swords, Monitor } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import XPBar from "@/components/XPBar";
import PremiumBanner from "@/components/PremiumBanner";
import { useProfile } from "@/hooks/useProfile";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useRecruiter } from "@/context/RecruiterContext";
import ViewModeSwitch from "@/components/ViewModeSwitch";
import RecruiterHome from "@/components/recruiter/RecruiterHome";

const tips = [
  "Always include a portfolio link - 73% of game studios check it before reading your CV.",
  "Tailor your CV to each studio's tech stack - mention Unity or Unreal by name.",
  "Quantify achievements: 'Optimized loading by 40%' beats 'Improved performance'.",
  "Game jams on your CV show passion - studios love self-starters.",
  "Your cover letter should show you know the studio's games. Play them first!",
];

const floatingIcons = [
  { icon: Gamepad2, x: "10%", y: "15%", delay: 0, size: 28 },
  { icon: Code, x: "75%", y: "10%", delay: 0.5, size: 22 },
  { icon: Palette, x: "85%", y: "55%", delay: 1, size: 20 },
  { icon: Swords, x: "15%", y: "65%", delay: 1.5, size: 24 },
  { icon: Monitor, x: "60%", y: "70%", delay: 0.8, size: 18 },
  { icon: Target, x: "40%", y: "10%", delay: 1.2, size: 16 },
  { icon: Music, x: "90%", y: "30%", delay: 0.3, size: 16 },
];

export default function HomePage() {
  const { viewMode } = useRecruiter();
  return (
    <div className="space-y-5">
      <ViewModeSwitch />
      {viewMode === "recruiter" ? <RecruiterHome /> : <TalentHome />}
    </div>
  );
}

function TalentHome() {
  const navigate = useNavigate();
  const { profileCompleteness } = useProfile();
  const { user, profiles, interests } = useMatchmaking();
  const { allJobs } = useRecruiter();
  const completion = profileCompleteness();
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const matches = interests.filter((interest) =>
    interest.status === "accepted" && (interest.sender_id === user?.id || interest.receiver_id === user?.id),
  );
  const recruiterInterest = interests.find((interest) =>
    interest.receiver_id === user?.id && interest.interest_type === "talent" && interest.status === "pending",
  );
  const interestedRecruiter = recruiterInterest
    ? profiles.find((profile) => profile.user_id === recruiterInterest.sender_id)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Hero with floating game icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border gradient-hero py-10 px-6 text-center"
      >
        {/* Floating icons */}
        {floatingIcons.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              className="absolute text-muted-foreground/15"
              style={{ left: item.x, top: item.y }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
            >
              <Icon size={item.size} />
            </motion.div>
          );
        })}

        <div className="relative z-10 space-y-3">
          <img src={logo} alt="Game Talents" className="h-14 mx-auto mb-2" />
          <h2 className="font-display text-2xl font-bold leading-tight">
            Ready to <span className="text-primary glow-text-primary">Level Up</span>?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your game industry career starts here. Match with studios, get AI coaching, and land your dream role.
          </p>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <span className="font-display text-xs font-bold">PROFILE XP</span>
        </div>
        <XPBar value={completion} label="Complete your profile to unlock all features" />
        <p className="text-xs text-muted-foreground">
          {completion < 50
            ? "Fill in your profile to get personalized job matches!"
            : completion < 100
            ? "Almost there! Add more details to maximize your visibility."
            : "Profile complete! You're ready to find your dream role."}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Briefcase, label: "Open Roles", value: allJobs.length, color: "text-primary", path: "/jobs" },
          { icon: Sparkles, label: "Matches", value: matches.length, color: "text-xp", path: "/match" },
          { icon: Zap, label: "Profile", value: `${completion}%`, color: "text-accent", path: "/profile" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => navigate(stat.path)}
            className="rounded-xl border border-border bg-card p-3 text-center cursor-pointer hover:border-primary/40 transition-colors"
          >
            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
            <div className="font-display text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {recruiterInterest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-xp/30 bg-xp/10 p-4"
        >
          <h4 className="font-display text-xs font-bold text-xp mb-2">RECRUITER INTEREST</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {interestedRecruiter?.full_name || "A recruiter"} from {interestedRecruiter?.company_name || "a studio"} is interested in your profile.
            <button onClick={() => navigate("/match")} className="ml-1 font-medium text-primary underline">Review request</button>
          </p>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-display text-xs font-bold text-muted-foreground tracking-wider">QUICK ACTIONS</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/ai-coach")}
            className="h-auto py-4 flex-col gap-2 gradient-primary glow-primary"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs font-display">Upload CV</span>
          </Button>
          <Button
            onClick={() => navigate("/match")}
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-primary/30 hover:bg-primary/10"
          >
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-display">Start Matching</span>
          </Button>
        </div>
        <Button
          onClick={() => navigate("/jobs")}
          variant="outline"
          className="w-full border-accent/30 hover:bg-accent/10"
        >
          <Briefcase className="h-4 w-4 text-accent mr-2" />
          <span className="text-xs font-display">Browse All Jobs</span>
        </Button>
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-accent/20 bg-accent/5 p-4"
      >
        <h4 className="font-display text-xs font-bold text-accent mb-2">PRO TIP</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
      </motion.div>

      {/* Premium upsell */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <PremiumBanner text="Unlock AI CV Builder, priority matching & more" />
      </motion.div>
    </div>
  );
}
