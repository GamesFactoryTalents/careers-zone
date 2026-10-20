import { useCallback, useEffect, useMemo, useState } from "react";
import { EVENTS } from "@/data/events";

const ATTENDANCE_KEY = "levelup_event_attendance";

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

  useEffect(() => localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance)), [attendance]);

  const toggleAttendance = useCallback((eventId: string) => {
    setAttendance(prev => ({ ...prev, [eventId]: !prev[eventId] }));
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

  return { events: EVENTS, attendance, toggleAttendance, recommendedMatches };
}
