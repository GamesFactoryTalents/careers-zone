import { useState } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumDialog from "./PremiumDialog";

interface PremiumBannerProps {
  text: string;
  buttonLabel?: string;
}

export default function PremiumBanner({ text, buttonLabel = "Go Premium" }: PremiumBannerProps) {
  const [showPremium, setShowPremium] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Crown className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowPremium(true)}
          className="shrink-0 text-xs font-display font-bold gradient-primary glow-primary"
        >
          {buttonLabel}
        </Button>
      </div>
      <PremiumDialog open={showPremium} onOpenChange={setShowPremium} />
    </>
  );
}
