import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function AccountSignOutButton() {
  const navigate = useNavigate();
  const { demoAccountType, endDemo } = useAuth();

  const signOut = async () => {
    if (demoAccountType) {
      endDemo();
      navigate("/auth", { replace: true });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Couldn't sign out: ${error.message}`);
      return;
    }
    navigate("/auth", { replace: true });
  };

  return (
    <Button variant="outline" size="sm" onClick={() => void signOut()}>
      <LogOut className="mr-1.5 h-3.5 w-3.5" /> {demoAccountType ? "Exit demo" : "Sign out"}
    </Button>
  );
}
