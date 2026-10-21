import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { ViewMode } from "@/types/company";

export default function AuthPage() {
  const { user, demoAccountType, startDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<ViewMode>("talent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const returnTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/match";

  useEffect(() => {
    if (user || demoAccountType) navigate(returnTo, { replace: true });
  }, [demoAccountType, navigate, returnTo, user]);

  if (user || demoAccountType) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim(), account_type: accountType } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account, then sign in.");
          setIsSignUp(false);
          return;
        }
        navigate(returnTo, { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate(returnTo, { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-5 py-10">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to see talent, review interest, match, and message.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
        {isSignUp && (
          <>
            <Input required autoComplete="name" placeholder="Full name" value={fullName} onChange={event => setFullName(event.target.value)} />
            <label className="block space-y-1 text-xs text-muted-foreground">
              Account type
              <select
                value={accountType}
                onChange={event => setAccountType(event.target.value as ViewMode)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="talent">Talent</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </label>
          </>
        )}
        <Input required type="email" autoComplete="email" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)} />
        <Input required type="password" minLength={isSignUp ? 8 : undefined} autoComplete={isSignUp ? "new-password" : "current-password"} placeholder={isSignUp ? "Password (at least 8 characters)" : "Password"} value={password} onChange={event => setPassword(event.target.value)} />
        <Button type="submit" disabled={submitting} className="w-full gradient-primary">
          {submitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already registered?" : "New to Careers Zone?"}{" "}
        <button className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => setIsSignUp(value => !value)}>
          {isSignUp ? "Sign in" : "Create account"}
        </button>
      </p>
      <div className="space-y-2 rounded-2xl border border-border bg-card/60 p-4">
        <div className="text-center">
          <p className="font-display text-sm font-bold">Just want to explore?</p>
          <p className="mt-1 text-xs text-muted-foreground">Try the app without creating an account or profile. Demo data isn't sent to Supabase.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => { startDemo("talent"); navigate(returnTo, { replace: true }); }}>
            Talent demo
          </Button>
          <Button type="button" variant="outline" onClick={() => { startDemo("recruiter"); navigate(returnTo, { replace: true }); }}>
            Recruiter demo
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          For a full no-login walkthrough, <Link className="font-medium text-primary underline" to="/demo">open the conference demo</Link>.
        </p>
      </div>
    </div>
  );
}
