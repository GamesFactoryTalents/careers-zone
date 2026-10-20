import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Check, Plus, X, Linkedin, Github, Globe, Video, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import XPBar from "@/components/XPBar";
import { useProfile } from "@/hooks/useProfile";
import { GAME_ROLES, EXPERIENCE_LEVELS, SKILLS, GENRES, WORK_MODES, STUDIO_SIZES, AVAILABILITY_OPTIONS, LANGUAGES } from "@/types/profile";
import { toast } from "sonner";
import PremiumBanner from "@/components/PremiumBanner";
import AccountSignOutButton from "@/components/AccountSignOutButton";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { profile, updateProfile, profileCompleteness } = useProfile();
  const { demoAccountType } = useAuth();
  const [skillInput, setSkillInput] = useState("");
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large - max 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ profilePicture: reader.result as string });
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  const initials = profile.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      updateProfile({ skills: [...profile.skills, skill] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateProfile({ skills: profile.skills.filter(s => s !== skill) });
  };

  const toggleGenre = (genre: string) => {
    const genres = profile.preferredGenres.includes(genre)
      ? profile.preferredGenres.filter(g => g !== genre)
      : [...profile.preferredGenres, genre];
    updateProfile({ preferredGenres: genres });
  };

  const handleSave = () => {
    if (demoAccountType) {
      toast.info("Demo changes aren't saved. Create an account to save your profile.");
      return;
    }
    setSaved(true);
    toast.success("Profile saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-wider">{title}</h3>
      {children}
    </div>
  );

  const IconInput = ({ icon: Icon, ...props }: { icon: typeof Globe } & React.ComponentProps<typeof Input>) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input {...props} className="bg-card pl-10" />
    </div>
  );

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-end"><AccountSignOutButton /></div>
      {/* Profile picture + header */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
          <Avatar className="h-20 w-20 border-2 border-border">
            {profile.profilePicture ? (
              <AvatarImage src={profile.profilePicture} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-muted flex items-center justify-center">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          {!profile.profilePicture && (
            <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Plus className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
          {profile.profilePicture && (
            <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-foreground" />
            </div>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div className="text-center">
          <h2 className="font-display text-lg font-bold">{profile.name || "Your Profile"}</h2>
          {profile.role && <p className="text-xs text-muted-foreground">{profile.role}</p>}
        </div>
        <XPBar value={profileCompleteness()} label="Profile Completion" color="accent" />
      </div>

      <Section title="BASIC INFO">
        <Input placeholder="Full Name" value={profile.name} onChange={e => updateProfile({ name: e.target.value })} className="bg-card" />
        <Input placeholder="Location (e.g. Helsinki, Finland)" value={profile.location} onChange={e => updateProfile({ location: e.target.value })} className="bg-card" />
        <IconInput icon={Globe} placeholder="Portfolio URL" value={profile.portfolioUrl} onChange={e => updateProfile({ portfolioUrl: e.target.value })} />
        <IconInput icon={Linkedin} placeholder="LinkedIn URL" value={profile.linkedinUrl} onChange={e => updateProfile({ linkedinUrl: e.target.value })} />
        <IconInput icon={Github} placeholder="GitHub URL" value={profile.githubUrl} onChange={e => updateProfile({ githubUrl: e.target.value })} />
        <IconInput icon={Video} placeholder="Showreel / Demo Reel URL" value={profile.showreelUrl} onChange={e => updateProfile({ showreelUrl: e.target.value })} />
      </Section>

      <Section title="ROLE & EXPERIENCE">
        <Select value={profile.role} onValueChange={v => updateProfile({ role: v })}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Select your role" /></SelectTrigger>
          <SelectContent>
            {GAME_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={profile.experienceLevel} onValueChange={v => updateProfile({ experienceLevel: v })}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Experience level" /></SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={profile.availability} onValueChange={v => updateProfile({ availability: v })}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Availability / notice period" /></SelectTrigger>
          <SelectContent>
            {AVAILABILITY_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </Section>

      <Section title="SALARY EXPECTATIONS">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Min €"
            inputMode="numeric"
            pattern="[0-9]*"
            value={profile.salaryMin}
            onChange={e => updateProfile({ salaryMin: e.target.value.replace(/[^0-9]/g, "") })}
            className="bg-card flex-1"
          />
          <span className="text-xs text-muted-foreground shrink-0">to</span>
          <Input
            placeholder="Max €"
            inputMode="numeric"
            pattern="[0-9]*"
            value={profile.salaryMax}
            onChange={e => updateProfile({ salaryMax: e.target.value.replace(/[^0-9]/g, "") })}
            className="bg-card flex-1"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">Annual gross salary in EUR (optional)</p>
      </Section>

      <Section title="SKILLS & TECH STACK">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSkill(skillInput)}
              className="bg-card"
            />
          </div>
          <Button size="icon" variant="outline" onClick={() => addSkill(skillInput)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map(skill => (
            <Badge key={skill} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeSkill(skill)}>
              {skill} <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {SKILLS.filter(s => !profile.skills.includes(s)).slice(0, 12).map(skill => (
            <Badge
              key={skill}
              variant="outline"
              className="cursor-pointer text-[10px] opacity-60 hover:opacity-100"
              onClick={() => addSkill(skill)}
            >
              + {skill}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="EXPERIENCE & EDUCATION">
        <Textarea
          placeholder="Work experience - e.g. previous studios, roles, and achievements..."
          value={profile.workExperience}
          onChange={e => updateProfile({ workExperience: e.target.value })}
          className="bg-card min-h-[100px]"
        />
        <Textarea
          placeholder="Education - e.g. degree, school, relevant courses..."
          value={profile.education}
          onChange={e => updateProfile({ education: e.target.value })}
          className="bg-card"
        />
      </Section>

      <Section title="SHIPPED TITLES">
        <Textarea
          placeholder="Games you've worked on - e.g. 'Clash Royale (Supercell) - Game Designer, 2019-2021'"
          value={profile.shippedTitles}
          onChange={e => updateProfile({ shippedTitles: e.target.value })}
          className="bg-card min-h-[80px]"
        />
        <p className="text-[10px] text-muted-foreground">List game titles, studio, your role, and years</p>
      </Section>

      <Section title="COVER LETTER">
        <Textarea
          placeholder="Write or paste your cover letter here..."
          value={profile.coverLetter}
          onChange={e => updateProfile({ coverLetter: e.target.value })}
          className="bg-card min-h-[120px]"
        />
      </Section>

      <Section title="PREFERENCES">
        <Select value={profile.workMode} onValueChange={v => updateProfile({ workMode: v })}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Work mode preference" /></SelectTrigger>
          <SelectContent>
            {WORK_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={profile.studioSize} onValueChange={v => updateProfile({ studioSize: v })}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Preferred studio size" /></SelectTrigger>
          <SelectContent>
            {STUDIO_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Preferred country" value={profile.preferredCountry} onChange={e => updateProfile({ preferredCountry: e.target.value })} className="bg-card" />

        <div>
          <p className="text-xs text-muted-foreground mb-2">Languages you speak:</p>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map(lang => (
              <Badge
                key={lang}
                variant={profile.languages.includes(lang) ? "default" : "outline"}
                className={`cursor-pointer text-xs ${
                  profile.languages.includes(lang) ? "bg-primary" : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => {
                  const langs = profile.languages.includes(lang)
                    ? profile.languages.filter(l => l !== lang)
                    : [...profile.languages, lang];
                  updateProfile({ languages: langs });
                }}
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Game genres you're interested in:</p>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map(genre => (
              <Badge
                key={genre}
                variant={profile.preferredGenres.includes(genre) ? "default" : "outline"}
                className={`cursor-pointer text-xs ${
                  profile.preferredGenres.includes(genre) ? "bg-primary" : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      <Section title="FAVORITE GAMES (OPTIONAL)">
        <Textarea
          placeholder="What games do you love? e.g. Elden Ring, Celeste, Hades, Baldur's Gate 3..."
          value={profile.favoriteGames}
          onChange={e => updateProfile({ favoriteGames: e.target.value })}
          className="bg-card min-h-[60px]"
        />
        <p className="text-[10px] text-muted-foreground">Shows your taste and passion - studios love seeing this</p>
      </Section>

      <Button onClick={handleSave} className="w-full gradient-primary glow-primary">
        {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {saved ? "Saved!" : "Save Profile"}
      </Button>

      <PremiumBanner text="Want your profile to stand out? Premium members get priority visibility to studios." />
    </div>
  );
}
