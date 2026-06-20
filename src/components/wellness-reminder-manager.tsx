import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

type LastFired = {
  water?: number;
  exercise?: string;
  mood?: string;
  bedtime?: string;
  wake?: string;
};

const STORE_KEY = "healthguard-wellness-last-fired";

function loadLast(): LastFired {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}"); } catch { return {}; }
}
function saveLast(v: LastFired) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch {}
}

function pad(n: number) { return n.toString().padStart(2, "0"); }
function nowHHMM() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

export function WellnessReminderManager() {
  const { prefs, addWater, exerciseLogs, moodLogs } = useStore();
  const lastRef = useRef<LastFired>(loadLast());

  useEffect(() => {
    if (!prefs.wellnessRemindersEnabled) return;

    const tick = () => {
      const last = lastRef.current;
      const now = Date.now();
      const hhmm = nowHHMM();
      const today = todayISO();
      let changed = false;

      // Water — interval based
      if (prefs.waterReminderHours > 0) {
        const intervalMs = prefs.waterReminderHours * 60 * 60 * 1000;
        if (!last.water || now - last.water >= intervalMs) {
          last.water = now;
          changed = true;
          toast("💧 Time to drink a glass of water", {
            description: "Stay hydrated — your body will thank you.",
            duration: 30000,
            action: { label: "Drank water", onClick: () => addWater(1) },
          });
        }
      }

      // Exercise — fires at scheduled time once per day
      if (prefs.exerciseReminderTime && hhmm === prefs.exerciseReminderTime && last.exercise !== today) {
        const doneToday = exerciseLogs.some((e) => e.date === today);
        if (!doneToday) {
          last.exercise = today;
          changed = true;
          toast("🏃 Time for your daily exercise", {
            description: "A short walk or stretch keeps you healthy.",
            duration: 60000,
            action: { label: "Open exercise", onClick: () => (window.location.href = "/exercise") },
          });
        }
      }

      // Mood — daily check-in
      if (prefs.moodReminderTime && hhmm === prefs.moodReminderTime && last.mood !== today) {
        const logged = moodLogs.some((m) => m.date === today);
        if (!logged) {
          last.mood = today;
          changed = true;
          toast("🙂 How are you feeling today?", {
            description: "Take a moment to log your mood.",
            duration: 60000,
            action: { label: "Log mood", onClick: () => (window.location.href = "/mood") },
          });
        }
      }

      // Bedtime
      if (prefs.bedtimeReminder && hhmm === prefs.bedtimeReminder && last.bedtime !== today) {
        last.bedtime = today;
        changed = true;
        toast("🌙 It's your scheduled bedtime", {
          description: "Get enough rest for good health.",
          duration: 60000,
          action: { label: "Sleep tracker", onClick: () => (window.location.href = "/sleep") },
        });
      }

      // Wake-up
      if (prefs.wakeReminder && hhmm === prefs.wakeReminder && last.wake !== today) {
        last.wake = today;
        changed = true;
        toast("☀️ Good morning — time to wake up", {
          description: "Start your day with a glass of water.",
          duration: 60000,
        });
      }

      if (changed) {
        lastRef.current = { ...last };
        saveLast(lastRef.current);
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [prefs, addWater, exerciseLogs, moodLogs]);

  return null;
}
