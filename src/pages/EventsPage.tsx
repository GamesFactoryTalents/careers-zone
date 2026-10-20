import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, MapPin, MessageSquare, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRecruiter } from "@/context/RecruiterContext";
import { useEvents } from "@/hooks/useEvents";

export default function EventsPage() {
  const navigate = useNavigate();
  const { viewMode } = useRecruiter();
  const { events, attendance, toggleAttendance, openConversation, recommendedMatches } = useEvents();
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? "");

  const selectedEvent = useMemo(
    () => events.find(event => event.id === selectedId) ?? events[0],
    [events, selectedId],
  );

  const isTalent = viewMode === "talent";

  if (!selectedEvent) return null;

  return (
    <div className="space-y-5 pb-24">
      <div className="space-y-1">
        <p className="font-display text-xs font-bold text-muted-foreground tracking-wider">EVENT MATCHMAKING</p>
        <h1 className="font-display text-2xl font-bold">Meet the right people</h1>
      </div>

      <div className="grid gap-3">
        {events.map((event) => {
          const isAttending = !!attendance[event.id];
          const recommended = isTalent ? event.recruiters.slice(0, 2) : event.talents.slice(0, 2);

          return (
            <div
              key={event.id}
              className={`rounded-2xl border p-4 space-y-3 ${selectedEvent.id === event.id ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className="mb-2 bg-accent/15 text-accent border-accent/30">{event.type}</Badge>
                  <h2 className="font-display text-lg font-bold">{event.title}</h2>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
                    {event.date} • <MapPin className="inline h-3.5 w-3.5 mr-1" /> {event.city}
                  </p>
                </div>
                {isAttending && (
                  <span className="flex items-center gap-1 rounded-full border border-xp/40 bg-xp/10 px-2 py-1 text-[10px] font-bold text-xp">
                    <CheckCircle2 className="h-3 w-3" /> Attending
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>

              <div className="flex flex-wrap gap-2">
                {recommended.map((person) => (
                  <span key={person.name} className="rounded-full border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground">
                    {person.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gradient-primary glow-primary" onClick={() => { toggleAttendance(event.id); setSelectedId(event.id); }}>
                  {isAttending ? "Registered" : "Attend event"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setSelectedId(event.id); navigate("/messages"); }}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold text-muted-foreground tracking-wider">MATCHES</p>
            <h3 className="font-display text-xl font-bold">{selectedEvent.title}</h3>
          </div>
          <Sparkles className="h-5 w-5 text-accent" />
        </div>

        <div className="space-y-2">
          {(isTalent ? selectedEvent.recruiters : selectedEvent.talents).map((person, index) => {
            const onsite = attendance[selectedEvent.id] && index === 0;
            return (
              <div key={person.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="font-display text-sm font-bold">{person.name}</p>
                  <p className="text-[10px] text-muted-foreground">{person.role} • {person.company || person.location}</p>
                  {onsite && (
                    <span className="mt-1 inline-flex rounded-full border border-xp/40 bg-xp/10 px-2 py-0.5 text-[9px] font-bold uppercase text-xp">
                      Meet onsite
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={onsite ? "secondary" : "outline"}
                    size="sm"
                    className={onsite ? "border-xp text-xp" : "border-primary/30"}
                    onClick={() => {
                      openConversation(person, selectedEvent);
                      navigate(`/messages?event=${selectedEvent.id}&person=${encodeURIComponent(person.name)}`);
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    {onsite ? "Meet" : "Message"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Users className="inline h-3.5 w-3.5 mr-1 text-primary" />
          {isTalent ? "If you and a recruiter are both attending the event, the app highlights this as a face-to-face opportunity." : "If a talent and a recruiter both RSVP, the event becomes the strongest place for a real-world introduction."}
        </div>
      </div>
    </div>
  );
}
