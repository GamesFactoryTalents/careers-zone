import { Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const PREMIUM_FEATURES = [
  { title: "AI CV Builder", desc: "Recreate your CV from scratch with AI guidance" },
  { title: "AI Cover Letter Generator", desc: "Tailored cover letters for each job application" },
  { title: "Priority Job Matching", desc: "Your profile shown first to employers" },
  { title: "Unlimited AI Analyses", desc: "No daily limits on CV & cover letter reviews" },
  { title: "Interview Prep Coach", desc: "AI mock interviews with real-time feedback" },
  { title: "Salary Negotiation Tips", desc: "Role-specific compensation data & strategies" },
  { title: "LinkedIn Profile Optimizer", desc: "AI review & rewrite of your LinkedIn profile" },
];

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PremiumDialog({ open, onOpenChange }: PremiumDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-lg">Go Premium</DialogTitle>
          <DialogDescription className="text-xs">
            Unlock the full power of your gaming career toolkit
          </DialogDescription>
        </DialogHeader>

        <div className="text-center mb-2">
          <span className="text-3xl font-display font-bold">€4.99</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>

        <div className="space-y-2.5">
          {PREMIUM_FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3 items-start">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">{f.title}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => toast.info("Coming soon! Premium features are under development.")}
          className="w-full mt-3 gradient-primary glow-primary font-display font-bold"
        >
          Start Free Trial
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          7-day free trial - Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}
