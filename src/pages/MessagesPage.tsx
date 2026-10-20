import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  interest_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profiles, interests } = useMatchmaking();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const accepted = useMemo(() => interests.filter((item) =>
    item.status === "accepted" && (item.sender_id === user?.id || item.receiver_id === user?.id),
  ), [interests, user]);
  const requestedId = searchParams.get("match");
  const selected = requestedId
    ? accepted.find((item) => item.id === requestedId)
    : accepted[0];
  const otherUserId = selected ? (selected.sender_id === user?.id ? selected.receiver_id : selected.sender_id) : "";
  const participant = profiles.find((profile) => profile.user_id === otherUserId);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    let active = true;
    setLoading(true);
    const loadMessages = async () => {
      const { data, error } = await supabase.from("match_messages").select("*")
        .eq("interest_id", selected.id).order("created_at", { ascending: true });
      if (!active) return;
      if (error) {
        toast.error(`Couldn't load messages: ${error.message}`);
      } else {
        setMessages(data ?? []);
      }
      setLoading(false);
    };
    void loadMessages();
    const channel = supabase.channel(`messages-${selected.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "match_messages",
        filter: `interest_id=eq.${selected.id}`,
      }, () => { void loadMessages(); })
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [selected]);

  useEffect(() => {
    if (!requestedId && selected) setSearchParams({ match: selected.id }, { replace: true });
  }, [requestedId, selected, setSearchParams]);

  const send = useCallback(async () => {
    const body = draft.trim();
    if (!selected || !user || !body) return;
    const { error } = await supabase.from("match_messages").insert({
      interest_id: selected.id,
      sender_id: user.id,
      body,
    });
    if (error) {
      toast.error(`Couldn't send message: ${error.message}`);
      return;
    }
    setDraft("");
  }, [draft, selected, user]);

  if (accepted.length === 0) {
    return (
      <div className="space-y-3 py-10 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h1 className="font-display text-xl font-bold">Messages unlock after a match</h1>
        <p className="text-sm text-muted-foreground">When both sides accept an interest, the connection will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="space-y-1">
        <p className="font-display text-xs font-bold tracking-wider text-muted-foreground">MESSAGES</p>
        <h1 className="font-display text-2xl font-bold">Your matches</h1>
      </div>
      <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
        {accepted.map((interest) => {
          const id = interest.sender_id === user?.id ? interest.receiver_id : interest.sender_id;
          const profile = profiles.find((item) => item.user_id === id);
          return (
            <button
              key={interest.id}
              onClick={() => setSearchParams({ match: interest.id })}
              className={`w-full rounded-xl border p-3 text-left ${selected?.id === interest.id ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}
            >
              <p className="font-display text-sm font-bold">{profile?.full_name || profile?.company_name || "Matched connection"}</p>
              <p className="text-[10px] text-muted-foreground">{profile?.headline || "Mutual match"}</p>
            </button>
          );
        })}
      </div>
      {!selected && <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Select one of your accepted matches to open its conversation.</p>}
      {selected && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="font-display text-sm font-bold">{participant?.full_name || participant?.company_name || "Matched connection"}</p>
            <p className="text-[10px] text-muted-foreground">{participant?.headline || "You both accepted this connection"}</p>
          </div>
          <div className="max-h-[45vh] min-h-28 space-y-2 overflow-y-auto">
            {loading ? <p className="text-center text-xs text-muted-foreground">Loading messages…</p> : messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.sender_id === user?.id ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                  {message.body}
                </p>
              </div>
            ))}
            {!loading && messages.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">You matched. Start the conversation.</p>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2">
            <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" maxLength={4000} className="bg-background" />
            <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message"><Send className="h-4 w-4" /></Button>
          </form>
        </section>
      )}
    </div>
  );
}
