import { MapPin, Building2, Globe, Clock } from "lucide-react";
import type { Job } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  job: Job;
  compact?: boolean;
  onClick?: () => void;
}

export default function JobCard({ job, compact, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 ${
        onClick ? "cursor-pointer" : ""
      } ${compact ? "" : "space-y-3"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-bold leading-tight truncate">{job.title}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="text-xs truncate">{job.company}</span>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] border-primary/40 text-primary">
          {job.experienceLevel}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3" /> {job.workMode}
        </span>
        {!compact && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {job.postedDate}
          </span>
        )}
      </div>

      {!compact && (
        <>
          <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 4).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
