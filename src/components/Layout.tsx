import { useLocation, useNavigate } from "react-router-dom";
import { Home, Gamepad2, Briefcase, User, Bot, Building2, CalendarDays, MessageSquareText } from "lucide-react";
import { useRecruiter } from "@/context/RecruiterContext";

const talentTabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/match", label: "Match", icon: Gamepad2 },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
  { path: "/events", label: "Events", icon: CalendarDays },
  { path: "/messages", label: "Messages", icon: MessageSquareText },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/ai-coach", label: "Career Coach", icon: Bot },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { viewMode } = useRecruiter();
  const tabs =
    viewMode === "recruiter"
      ? talentTabs.map((t) => {
          if (t.path === "/profile") return { ...t, label: "Company", icon: Building2 };
          if (t.path === "/ai-coach") return { ...t, label: "Recruitment Coach", icon: Bot };
          return t;
        })
      : talentTabs;
  const isMatchPage = location.pathname === "/match";

  return (
    <div className={`flex flex-col bg-background ${isMatchPage ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      {/* Content */}
      <main className={`flex-1 pb-20 ${isMatchPage ? "flex flex-col" : "overflow-y-auto"}`}>
        <div className={`${isMatchPage ? "flex-1 flex flex-col px-4 py-4" : "max-w-lg mx-auto px-4 py-4"}`}>
          {children}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {tabs.map(tab => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 min-h-[44px] justify-center rounded-lg transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(0,72%,51%)]" : ""}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
