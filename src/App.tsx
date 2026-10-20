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
import NotFound from "@/pages/NotFound";
import { RecruiterProvider, useRecruiter } from "@/context/RecruiterContext";

const queryClient = new QueryClient();

function ProfileRoute() {
  const { viewMode } = useRecruiter();
  return viewMode === "recruiter" ? <CompanyProfilePage /> : <ProfilePage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RecruiterProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/match" element={<MatchPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/profile" element={<ProfileRoute />} />
              <Route path="/recruiter/publish" element={<PublishRolePage />} />
              <Route path="/ai-coach" element={<AICoachPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </RecruiterProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
