import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { ViewMode } from "@/types/company";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  demoAccountType: ViewMode | null;
  startDemo: (accountType: ViewMode) => void;
  endDemo: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
