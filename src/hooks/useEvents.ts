import { useCallback, useEffect, useMemo, useState } from "react";
import { EVENTS, type EventItem } from "@/data/events";

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  participantCompany?: string;
  eventId?: string;
  eventTitle?: string;
  mode: "onsite" | "online";
  messages: ChatMessage[];
}

const ATTENDANCE_KEY = "levelup_event_attendance";
const MESSAGES_KEY = "levelup_event_conversations";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useEvents() {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => loadJson(ATTENDANCE_KEY, {}));
  const [conversations, setConversations] = useState<Conversation[]>(() => loadJson(MESSAGES_KEY, [
    {
      id: "demo-1",
      participantName: "Mila Schmidt",
      participantRole: "Talent Lead",
      participantCompany: "Pixel Forge",
      eventId: "berlin-game-mixer",
      eventTitle: "Berlin Game Mixer",
      mode: "onsite",
      messages: [
        { id: "m1", sender: "them", text: "Hi! I saw your profile matches one of our game design roles. Are you attending the mixer?", createdAt: "2026-11-12T09:00:00.000Z" },
        { id: "m2", sender: "me", text: "Yes, I’ll be there. I’d love to talk about gameplay and UX work.", createdAt: "2026-11-12T09:02:00.000Z" },
      ],
    },
    {
      id: "demo-2",
      participantName: "Lena Kowalski",
      participantRole: "Community Manager",
      participantCompany: "Freelance",
      eventId: "remote-player-circle",
      eventTitle: "Remote Player Circle",
      mode: "online",
      messages: [
        { id: "m3", sender: "them", text: "Would you be open to a quick call after the session?", createdAt: "2026-11-22T15:00:00.000Z" },
        { id: "m4", sender: "me", text: "Absolutely — I’m available Thursday afternoon.", createdAt: "2026-11-22T15:04:00.000Z" },
      ],
    },
  ]));

  useEffect(() => localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance)), [attendance]);
  useEffect(() => localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations)), [conversations]);

  const toggleAttendance = useCallback((eventId: string) => {
    setAttendance(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  }, []);

  const openConversation = useCallback((participant: { name: string; role: string; company?: string; location?: string }, event?: EventItem) => {
    const key = `${participant.name}-${event?.id || "general"}`;
    setConversations(prev => {
      if (prev.some(item => item.id === key)) return prev;
      return [{
        id: key,
        participantName: participant.name,
        participantRole: participant.role,
        participantCompany: participant.company,
        eventId: event?.id,
        eventTitle: event?.title,
        mode: event?.city?.toLowerCase() === "online" ? "online" : "onsite",
        messages: [
          {
            id: `${Date.now()}-welcome`,
            sender: "them",
            text: event ? `Hi! I’m attending ${event.title}. I’d love to connect and learn more about your background.` : "Hi! I’d love to connect and learn more about your profile.",
            createdAt: new Date().toISOString(),
          },
        ],
      }, ...prev];
    });
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    if (!text.trim()) return;
    setConversations(prev => prev.map(item => item.id === conversationId ? {
      ...item,
      messages: [...item.messages, { id: `${Date.now()}-${Math.random()}`, sender: "me", text: text.trim(), createdAt: new Date().toISOString() }],
    } : item));
  }, []);

  const recommendedMatches = useMemo(() => {
    return EVENTS.map(event => ({
      event,
      matches: event.recruiters.slice(0, 2).map((person, index) => ({
        ...person,
        matchScore: 84 + index * 5,
        onsite: attendance[event.id] || index === 0,
      })),
    }));
  }, [attendance]);

  return { events: EVENTS, attendance, toggleAttendance, conversations, openConversation, sendMessage, recommendedMatches };
}
