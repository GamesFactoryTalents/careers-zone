import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ExternalLink, Heart, Building2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobCard from "@/components/JobCard";
import { JOB_CATEGORIES, JOB_LOCATIONS, type Job } from "@/data/jobs";
import PremiumBanner from "@/components/PremiumBanner";
import { useRecruiter } from "@/context/RecruiterContext";
import { useMatchmaking, type MatchProfile, type MatchInterest } from "@/hooks/useMatchmaking";

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [workMode, setWorkMode] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [directory, setDirectory] = useState<"roles" | "companies">("roles");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { viewMode, allJobs } = useRecruiter();
  const { profiles, loading: matchingLoading, jobOwners, sendInterest, interestFor } = useMatchmaking();

  useEffect(() => {
    const selectedId = searchParams.get("selected");
    if (selectedId) {
      const job = allJobs.find(j => j.id === selectedId);
      if (job) setSelectedJob(job);
    }
  }, [allJobs, searchParams]);

  const filtered = useMemo(() => {
    return [...allJobs]
      .filter(j => {
        if (search && !`${j.title} ${j.company} ${j.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (category !== "all" && j.category !== category) return false;
        if (location !== "all" && j.location !== location) return false;
        if (workMode !== "all" && j.workMode !== workMode) return false;
        return true;
      })
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  }, [allJobs, search, category, location, workMode]);

  if (viewMode === "recruiter") {
    return <TalentDirectory profiles={profiles} loading={matchingLoading} sendInterest={sendInterest} interestFor={interestFor} />;
  }

  if (selectedJob) {
    const ownerId = jobOwners[selectedJob.id];
    const roleInterest = ownerId ? interestFor(ownerId, "role", selectedJob.id) : undefined;
    const companyInterest = ownerId ? interestFor(ownerId, "company") : undefined;
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
          ← Back to Jobs
        </Button>

        <div className="space-y-4">
          <div>
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 font-display text-xs">
              {selectedJob.category}
            </Badge>
            <h2 className="font-display text-xl font-bold">{selectedJob.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{selectedJob.company} • {selectedJob.location}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="border-accent/40 text-accent">{selectedJob.experienceLevel}</Badge>
              <Badge variant="outline">{selectedJob.workMode}</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold text-muted-foreground mb-2">DESCRIPTION</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedJob.description}</p>
          </div>

          <div>
            <h3 className="font-display text-xs font-bold text-muted-foreground mb-2">REQUIREMENTS</h3>
            <ul className="space-y-2">
              {selectedJob.requirements.map((req, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">▸</span> {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedJob.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 gradient-primary glow-primary"
              onClick={() => window.open(selectedJob.applyUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Apply Now
            </Button>
            {selectedJob.source === "recruiter" && ownerId && (
              <Button
                variant="outline"
                aria-label={roleInterest ? `${roleInterest.status} interest in this role` : "Show interest in this role"}
                className={roleInterest?.status === "accepted" ? "border-xp text-xp" : "border-primary/30"}
                disabled={roleInterest?.status !== undefined}
                onClick={() => void sendInterest(ownerId, "role", selectedJob.id)}
              >
                <Heart className={`h-4 w-4 ${roleInterest ? "fill-current" : ""}`} />
                <span className="sr-only">{roleInterest?.status ?? "Like role"}</span>
              </Button>
            )}
            {selectedJob.source === "recruiter" && ownerId && (
              <Button
                variant="outline"
                aria-label={companyInterest ? `${companyInterest.status} interest in this company` : "Show interest in this company"}
                className={companyInterest?.status === "accepted" ? "border-xp text-xp" : "border-accent/30"}
                disabled={companyInterest?.status !== undefined}
                onClick={() => void sendInterest(ownerId, "company")}
              >
                <Building2 className={`h-4 w-4 ${companyInterest ? "fill-current" : ""}`} />
                <span className="sr-only">{companyInterest?.status ?? "Like company"}</span>
              </Button>
            )}
          </div>

          <PremiumBanner text="Get an AI-tailored cover letter for this role" buttonLabel="Unlock" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Jobs</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Browse opportunities from across the web and roles published by companies on Careers Zone.
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={directory === "roles" ? "default" : "outline"} onClick={() => setDirectory("roles")}>Roles</Button>
        <Button size="sm" variant={directory === "companies" ? "default" : "outline"} onClick={() => setDirectory("companies")}>Companies</Button>
      </div>
      {directory === "companies" ? (
        <CompanyDirectory
          profiles={profiles}
          loading={matchingLoading}
          search={search}
          onSearch={setSearch}
          sendInterest={sendInterest}
          interestFor={interestFor}
        />
      ) : (
        <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles, companies, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-primary text-primary" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {JOB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-card text-sm"><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {JOB_LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger className="bg-card text-sm"><SelectValue placeholder="Work Mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            {(category !== "all" || location !== "all" || workMode !== "all") && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setCategory("all"); setLocation("all"); setWorkMode("all"); }}>
                <X className="h-3 w-3 mr-1" /> Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground">{filtered.length} roles found</p>

      <div className="space-y-3">
        {filtered.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <JobCard job={job} onClick={() => setSelectedJob(job)} />
          </motion.div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}

function TalentDirectory({
  profiles,
  loading,
  sendInterest,
  interestFor,
}: {
  profiles: MatchProfile[];
  loading: boolean;
  sendInterest: (receiverId: string, interestType: MatchInterest["interest_type"], jobId?: string) => Promise<boolean>;
  interestFor: (receiverId: string, interestType: MatchInterest["interest_type"], jobId?: string) => MatchInterest | undefined;
}) {
  const [search, setSearch] = useState("");
  const talents = profiles.filter((profile) => profile.account_type === "talent").filter((profile) =>
    `${profile.full_name} ${profile.headline} ${profile.location} ${Array.isArray(profile.profile.skills) ? profile.profile.skills.join(" ") : ""}`
      .toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Talent</h1>
        <p className="mt-1 text-xs text-muted-foreground">Browse talent profiles and express interest. They can accept or decline your request.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search talents, roles, skills..." className="bg-card pl-9" />
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading talent profiles…</p>
      ) : talents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No talent profiles found yet. Talents appear here after they create an account and complete their profile.
        </p>
      ) : (
        <div className="space-y-3">
          {talents.map((talent) => {
            const interest = interestFor(talent.user_id, "talent");
            const skills = Array.isArray(talent.profile.skills) ? talent.profile.skills.filter((skill): skill is string => typeof skill === "string") : [];
            return (
              <article key={talent.user_id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-bold">{talent.full_name || "Talent profile"}</h2>
                    <p className="text-xs text-muted-foreground">{talent.headline || "Game industry professional"}</p>
                    {talent.location && <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-3 w-3" />{talent.location}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant={interest ? "secondary" : "outline"}
                    className={interest?.status === "accepted" ? "shrink-0 border-xp text-xp" : "shrink-0 border-primary/30"}
                    disabled={interest?.status !== undefined}
                    onClick={() => void sendInterest(talent.user_id, "talent")}
                  >
                    <Heart className={`mr-1 h-3.5 w-3.5 ${interest ? "fill-current" : ""}`} />
                    {interest ? interest.status === "accepted" ? "Matched" : interest.status === "declined" ? "Declined" : "Requested" : "Show interest"}
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 8).map((skill) => <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompanyDirectory({
  profiles,
  loading,
  search,
  onSearch,
  sendInterest,
  interestFor,
}: {
  profiles: MatchProfile[];
  loading: boolean;
  search: string;
  onSearch: (value: string) => void;
  sendInterest: (receiverId: string, interestType: MatchInterest["interest_type"], jobId?: string) => Promise<boolean>;
  interestFor: (receiverId: string, interestType: MatchInterest["interest_type"], jobId?: string) => MatchInterest | undefined;
}) {
  const companies = profiles.filter((profile) => profile.account_type === "recruiter" && profile.company_name.trim())
    .filter((profile) => `${profile.company_name} ${profile.location} ${String(profile.company.location ?? "")} ${String(profile.company.tagline ?? "")}`
      .toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-bold">Studios</h2>
        <p className="text-xs text-muted-foreground">Show a studio you’re interested even if none of its current roles fit.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search companies..." className="bg-card pl-9" />
      </div>
      {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading companies…</p> : companies.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No company profiles found yet.</p>
      ) : companies.map((company) => {
        const interest = interestFor(company.user_id, "company");
        return (
          <article key={company.user_id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div>
              <h3 className="font-display text-base font-bold">{company.company_name}</h3>
              <p className="text-xs text-muted-foreground">{String(company.company.tagline ?? company.company.location ?? company.location ?? "")}</p>
              {typeof company.company.about === "string" && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{company.company.about}</p>}
            </div>
            <Button
              size="sm"
              variant={interest ? "secondary" : "outline"}
              className="shrink-0"
              disabled={interest?.status !== undefined}
              onClick={() => void sendInterest(company.user_id, "company")}
            >
              <Heart className={`mr-1 h-3.5 w-3.5 ${interest ? "fill-current" : ""}`} />
              {interest ? interest.status === "accepted" ? "Matched" : interest.status === "declined" ? "Declined" : "Requested" : "Like studio"}
            </Button>
          </article>
        );
      })}
    </section>
  );
}
