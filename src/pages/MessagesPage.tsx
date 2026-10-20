import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MessageSquare, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENTS } from "@/data/events";
import { useEvents } from "@/hooks/useEvents";

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const { conversations, sendMessage, openConversation } = useEvents();
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const requestedPerson = searchParams.get("person");
  const requestedEvent = searchParams.get("event");

  useEffect(() => {
    if (!requestedPerson) {
      if (!selectedId && conversations[0]) {
        setSelectedId(conversations[0].id);
      }
      return;
    }

    const match = conversations.find((conversation) => {
      if (conversation.participantName !== requestedPerson) return false;
      if (!requestedEvent) return true;
      return conversation.eventId === requestedEvent;
    });

    if (match) {
      setSelectedId(match.id);
      return;
    }

    const event = EVENTS.find((item) => item.id === requestedEvent);
    const participant = event
      ? [...event.recruiters, ...event.talents].find((person) => person.name === requestedPerson)
      : undefined;

    if (!participant) return;

    const key = `${participant.name}-${event?.id || "general"}`;
    openConversation(participant, event);
    setSelectedId(key);
  }, [conversations, openConversation, requestedEvent, requestedPerson, selectedId]);

  const selectedConversation = useMemo(
    () => conversations.find(item => item.id === selectedId) ?? conversations[0],
    [conversations, selectedId],
  );

  if (!selectedConversation) {
    return (
      <div className="space-y-4 py-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No conversations yet. Start a chat from the event matches.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="space-y-1">
        <p className="font-display text-xs font-bold text-muted-foreground tracking-wider">MESSAGES</p>
        <h1 className="font-display text-2xl font-bold">Your conversations</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setSelectedId(conversation.id)}
            className={`w-full rounded-xl border p-3 text-left ${selectedConversation.id === conversation.id ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-sm font-bold">{conversation.participantName}</p>
                <p className="text-[10px] text-muted-foreground">{conversation.participantRole}</p>
              </div>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase text-accent">
                {conversation.mode === "onsite" ? "Meet onsite" : "Online chat"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold">{selectedConversation.participantName}</p>
            <p className="text-[10px] text-muted-foreground">{selectedConversation.participantRole}</p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase text-primary">
            {selectedConversation.eventTitle || "Match"}
          </span>
        </div>

        {(requestedPerson || requestedEvent) && (
          <div className="rounded-xl border border-xp/30 bg-xp/10 p-3 text-xs text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 text-xp" />
            Suggested connection: {requestedPerson || selectedConversation.participantName} • {requestedEvent ? "same event" : "mutual interest"}
          </div>
        )}

        <div className="space-y-2">
          {selectedConversation.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-background border border-border text-foreground"}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write a message…"
            className="bg-background"
          />
          <Button
            size="icon"
            onClick={() => {
              if (!draft.trim()) return;
              sendMessage(selectedConversation.id, draft);
              setDraft("");
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button variant="outline" size="sm" className="border-primary/30">
            <CalendarDays className="h-3.5 w-3.5 mr-1" /> Suggest meeting
          </Button>
          <Button variant="outline" size="sm" className="border-primary/30">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Arrange call
          </Button>
        </div>
      </div>
    </div>
  );
}
