import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Gamepad2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function DemoPage() {
  const navigate = useNavigate();
  const { demoAccountType, startDemo } = useAuth();

  useEffect(() => {
    if (!demoAccountType) startDemo("talent");
  }, [demoAccountType, startDemo]);

  const enterAs = (accountType: "talent" | "recruiter") => {
    startDemo(accountType);
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">Conference preview</p>
        <h1 className="font-display text-3xl font-bold">See how Careers Zone works</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Explore a CV-informed talent profile, a completed studio profile, platform-published roles, and talent discovery. No account required.
        </p>
      </div>
      <div className="grid gap-3">
        <Button className="h-auto justify-start gap-4 p-4 text-left" onClick={() => enterAs("talent")}>
          <Gamepad2 className="h-6 w-6 shrink-0" />
          <span>
            <span className="block font-display text-base font-bold">Explore as a talent</span>
            <span className="block text-xs font-normal opacity-80">Review a ready-made profile, discover platform roles, and express interest.</span>
          </span>
        </Button>
        <Button variant="outline" className="h-auto justify-start gap-4 p-4 text-left" onClick={() => enterAs("recruiter")}>
          <Building2 className="h-6 w-6 shrink-0" />
          <span>
            <span className="block font-display text-base font-bold">Explore as a recruiter</span>
            <span className="block text-xs font-normal text-muted-foreground">View a sample studio, published roles, and a talent directory.</span>
          </span>
        </Button>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-sm font-bold">Try the matching flow</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
          <li>As a talent, open Match and show interest in a role.</li>
          <li>Switch to Recruiter in the demo banner and accept the request.</li>
          <li>Switch back to Talent and message the studio from Matches.</li>
        </ol>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <RotateCcw className="h-3 w-3" /> Demo decisions are saved only in this browser and can be reset anytime.
        </p>
      </div>
    </div>
  );
}
