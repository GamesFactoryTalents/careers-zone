import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/context/auth-context";
import type { ViewMode } from "@/types/company";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoAccountType, setDemoAccountType] = useState<ViewMode | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Unable to restore authentication session", error);
      } else if (mounted) {
        setSession(data.session);
        if (data.session) setDemoAccountType(null);
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setDemoAccountType(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      demoAccountType,
      startDemo: setDemoAccountType,
      endDemo: () => setDemoAccountType(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
}
