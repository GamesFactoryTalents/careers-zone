import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, Globe, MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecruiter } from "@/context/RecruiterContext";
import { STUDIO_SIZES } from "@/types/profile";

const COMPANY_SIZES = STUDIO_SIZES.filter((s) => s !== "Any");

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { company, updateCompany } = useRecruiter();
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const initials = company.name ? company.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo too large - max 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateCompany({ logo: reader.result as string });
      toast.success("Logo updated");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!company.name.trim()) {
      toast.error("Add your company name first");
      return;
    }
    setSaved(true);
    toast.success("Company profile saved");
    setTimeout(() => {
      setSaved(false);
      navigate("/");
    }, 700);
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Company profile</h1>
        <p className="text-xs text-muted-foreground mt-1">Talents see this on every role you publish.</p>
      </div>

      {/* Logo + name */}
      <div className="flex items-center gap-4">
        <button onClick={() => logoInputRef.current?.click()} className="relative group shrink-0" aria-label="Upload logo">
          <Avatar className="h-20 w-20 rounded-2xl border border-border">
            <AvatarImage src={company.logo} alt="Company logo" className="object-cover" />
            <AvatarFallback className="rounded-2xl bg-card font-display text-xl font-bold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground">
            <Camera className="h-3.5 w-3.5" />
          </span>
        </button>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="company-name" className="text-xs">Company name *</Label>
          <Input
            id="company-name"
            value={company.name}
            onChange={(e) => updateCompany({ name: e.target.value })}
            placeholder="e.g. Northern Lights Games"
            className="bg-card"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tagline" className="text-xs">Tagline</Label>
          <Input
            id="tagline"
            value={company.tagline}
            onChange={(e) => updateCompany({ tagline: e.target.value })}
            placeholder="e.g. Cozy co-op games made in Helsinki"
            className="bg-card"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={company.location}
                onChange={(e) => updateCompany({ location: e.target.value })}
                placeholder="Helsinki, Finland"
                className="bg-card pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Studio size</Label>
            <Select value={company.size} onValueChange={(v) => updateCompany({ size: v })}>
              <SelectTrigger className="bg-card"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-xs">Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="website"
              value={company.website}
              onChange={(e) => updateCompany({ website: e.target.value })}
              placeholder="https://yourstudio.com"
              className="bg-card pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="about" className="text-xs">About the studio</Label>
          <Textarea
            id="about"
            value={company.about}
            onChange={(e) => updateCompany({ about: e.target.value })}
            placeholder="What you make, what it's like to work with you, the games you've shipped..."
            className="bg-card min-h-[110px]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xs font-bold text-muted-foreground tracking-wider">YOU, THE RECRUITER</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="recruiter-name" className="text-xs">Your name</Label>
            <Input
              id="recruiter-name"
              value={company.recruiterName}
              onChange={(e) => updateCompany({ recruiterName: e.target.value })}
              placeholder="Jane Doe"
              className="bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recruiter-title" className="text-xs">Your title</Label>
            <Input
              id="recruiter-title"
              value={company.recruiterTitle}
              onChange={(e) => updateCompany({ recruiterTitle: e.target.value })}
              placeholder="Talent Partner"
              className="bg-card"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full gradient-primary glow-primary">
        {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {saved ? "Saved" : "Save company profile"}
      </Button>
    </div>
  );
}
