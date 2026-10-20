import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import HomePage from "@/pages/Index";
import MatchPage from "@/pages/MatchPage";
import JobsPage from "@/pages/JobsPage";
import ProfilePage from "@/pages/ProfilePage";
import CompanyProfilePage from "@/pages/CompanyProfilePage";
import PublishRolePage from "@/pages/PublishRolePage";
import AICoachPage from "@/pages/AICoachPage";
import EventsPage from "@/pages/EventsPage";
import MessagesPage from "@/pages/MessagesPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import { RecruiterProvider, useRecruiter } from "@/context/RecruiterContext";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";

const queryClient = new QueryClient();

function ProfileRoute() {
  const { viewMode } = useRecruiter();
  return (
    <RequireAuth>
      {viewMode === "recruiter" ? <CompanyProfilePage /> : <ProfilePage />}
    </RequireAuth>
  );
}

function JobsRoute() {
  const { viewMode } = useRecruiter();
  return viewMode === "recruiter"
    ? <RequireAuth><JobsPage /></RequireAuth>
    : <JobsPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RecruiterProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/match" element={<RequireAuth><MatchPage /></RequireAuth>} />
                <Route path="/jobs" element={<JobsRoute />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
                <Route path="/profile" element={<ProfileRoute />} />
                <Route path="/recruiter/publish" element={<RequireAuth><PublishRolePage /></RequireAuth>} />
                <Route path="/ai-coach" element={<AICoachPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </RecruiterProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
