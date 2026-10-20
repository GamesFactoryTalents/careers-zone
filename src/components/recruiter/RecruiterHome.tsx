import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, FilePlus2, Globe, MapPin, Pencil, Trash2, Users, Briefcase, Link2, FileText, Bell, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import JobCard from "@/components/JobCard";
import { useRecruiter } from "@/context/RecruiterContext";
import { useMatchmaking } from "@/hooks/useMatchmaking";

export default function RecruiterHome() {
  const navigate = useNavigate();
  const { company, postedJobs, allJobs, removeJob, restoreJob } = useRecruiter();
  const { user, profiles, interests } = useMatchmaking();
  const hasCompany = company.name.trim() !== "";
  const initials = company.name ? company.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const incomingInterests = interests.filter((interest) =>
    interest.receiver_id === user?.id && interest.status === "pending" &&
    (interest.interest_type === "role" || interest.interest_type === "company"),
  );
  const studioInterest = incomingInterests.filter((interest) => interest.interest_type === "company");

  const roleSignals = [...postedJobs]
    .map((job) => ({
      job,
      newInterest: incomingInterests.filter((interest) => interest.interest_type === "role" && interest.job_id === job.id).length,
    }))
    .sort((a, b) => b.newInterest - a.newInterest);

  const handleRemove = async (id: string) => {
    try {
      const removed = await removeJob(id);
      if (!removed) return;
      toast("Role unpublished", {
        description: removed.title,
        action: {
          label: "Undo",
          onClick: () => {
            void restoreJob(removed).catch((error: unknown) => {
              toast.error(error instanceof Error ? error.message : "Couldn't restore this role.");
            });
          },
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't unpublish this role.");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border gradient-hero p-5"
      >
        {hasCompany ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 rounded-xl border border-border">
                <AvatarImage src={company.logo} alt={company.name} className="object-cover" />
                <AvatarFallback className="rounded-xl bg-card font-display text-lg font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold leading-tight truncate">{company.name}</h2>
                {company.tagline && <p className="text-xs text-muted-foreground mt-0.5">{company.tagline}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                  {company.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>
                  )}
                  {company.size && (
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{company.size}</span>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Globe className="h-3 w-3" />Website
                    </a>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/profile")} className="shrink-0 border-primary/30">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
            {company.recruiterName && (
              <p className="text-xs text-muted-foreground border-t border-border pt-3">
                Recruiter: <span className="text-foreground font-medium">{company.recruiterName}</span>
                {company.recruiterTitle && ` · ${company.recruiterTitle}`}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3 py-2">
            <Building2 className="h-10 w-10 mx-auto text-primary" />
            <h2 className="font-display text-xl font-bold">Set up your company</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Talents see your company on every role you publish. Add your logo, a short intro and where you're based.
            </p>
            <Button onClick={() => navigate("/profile")} className="gradient-primary glow-primary">
              Create company profile
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: FilePlus2, label: "Live roles", value: postedJobs.length, color: "text-primary" },
          { icon: Bell, label: "New interest", value: incomingInterests.length, color: "text-accent" },
          { icon: Heart, label: "Studio likes", value: studioInterest.length, color: "text-xp" },
          { icon: Briefcase, label: "Open roles", value: allJobs.length, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-xl border border-border bg-card p-3 text-center"
          >
            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
            <div className="font-display text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/recruiter/publish")}
        className="w-full rounded-2xl gradient-primary glow-primary p-5 text-left text-primary-foreground"
      >
        <div className="flex items-center gap-3">
          <FilePlus2 className="h-8 w-8 shrink-0" />
          <div>
            <div className="font-display text-lg font-bold">Publish a role</div>
            <div className="text-xs opacity-90 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Upload a PDF</span>
              <span className="flex items-center gap-1"><Link2 className="h-3 w-3" />or paste a vacancy link</span>
            </div>
          </div>
        </div>
      </motion.button>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-wider">ROLE FOCUS</h3>
          <span className="text-[10px] text-muted-foreground">Sorted by activity</span>
        </div>
        {roleSignals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
            No published roles yet. Publish a role to start reviewing interest.
          </div>
        ) : (
          <div className="space-y-2">
            {roleSignals.map(({ job, newInterest }) => (
              <div key={job.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-bold">{job.title}</p>
                    <p className="text-[10px] text-muted-foreground">{job.location} • {job.workMode}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {newInterest > 0 && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 font-bold text-primary">
                        {newInterest} new
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(incomingInterests.length > 0 || studioInterest.length > 0) && (
        <section className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display text-xs font-bold text-primary">Candidates to review</h3>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/match")}>Review all</Button>
          </div>
          {incomingInterests.slice(0, 3).map((interest) => {
            const talent = profiles.find((profile) => profile.user_id === interest.sender_id);
            return (
              <p key={interest.id} className="rounded-lg border border-primary/10 bg-background/40 p-2 text-sm">
                <span className="font-medium">{talent?.full_name || "A talent"}</span>
                {interest.interest_type === "company" ? " is interested in your studio." : " is interested in one of your roles."}
              </p>
            );
          })}
        </section>
      )}

      <div className="space-y-3">
        <h3 className="font-display text-xs font-bold text-muted-foreground tracking-wider">YOUR ROLES</h3>
        {postedJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No roles yet. Published roles appear here and in the talents' Jobs and Match pages.
          </div>
        ) : (
          postedJobs.map((job) => (
            <div key={job.id} className="relative">
              <JobCard job={job} onClick={() => navigate(`/jobs?selected=${job.id}`)} />
              <button
                onClick={() => handleRemove(job.id)}
                aria-label={`Unpublish ${job.title}`}
                className="absolute bottom-3 right-3 rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
