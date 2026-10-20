import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ExternalLink, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobCard from "@/components/JobCard";
import { JOBS, JOB_CATEGORIES, JOB_LOCATIONS, type Job } from "@/data/jobs";
import { useMatches } from "@/hooks/useMatches";
import PremiumBanner from "@/components/PremiumBanner";

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [workMode, setWorkMode] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { addMatch, removeMatch, isMatched } = useMatches();

  useEffect(() => {
    const selectedId = searchParams.get("selected");
    if (selectedId) {
      const job = JOBS.find(j => j.id === selectedId);
      if (job) setSelectedJob(job);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    return JOBS.filter(j => {
      if (search && !`${j.title} ${j.company} ${j.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && j.category !== category) return false;
      if (location !== "all" && j.location !== location) return false;
      if (workMode !== "all" && j.workMode !== workMode) return false;
      return true;
    });
  }, [search, category, location, workMode]);

  if (selectedJob) {
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
            <Button
              variant="outline"
              className={isMatched(selectedJob.id) ? "border-xp text-xp" : "border-primary/30"}
              onClick={() => isMatched(selectedJob.id) ? removeMatch(selectedJob.id) : addMatch(selectedJob.id)}
            >
              <Heart className={`h-4 w-4 ${isMatched(selectedJob.id) ? "fill-current" : ""}`} />
            </Button>
          </div>

          <PremiumBanner text="Get an AI-tailored cover letter for this role" buttonLabel="Unlock" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
    </div>
  );
}
