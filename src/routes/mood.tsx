import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore, type Mood } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/mood")({
  head: () => ({ meta: [{ title: "Mood Tracker — HealthGuard" }] }),
  component: MoodPage,
});

const MOODS: { key: Mood; emoji: string; label: string; color: string }[] = [
  { key: "happy", emoji: "😊", label: "Happy", color: "bg-success/15 text-success" },
  { key: "normal", emoji: "🙂", label: "Normal", color: "bg-primary/15 text-primary" },
  { key: "tired", emoji: "😴", label: "Tired", color: "bg-warning/15 text-warning" },
  { key: "stressed", emoji: "😣", label: "Stressed", color: "bg-warning/15 text-warning" },
  { key: "sick", emoji: "🤒", label: "Sick", color: "bg-destructive/15 text-destructive" },
];

function MoodPage() {
  const { moodLogs, setMood } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayMood = moodLogs.find((m) => m.date === today);
  const [note, setNote] = useState(todayMood?.note ?? "");

  const counts = MOODS.map((m) => ({ ...m, count: moodLogs.filter((l) => l.mood === m.key).length }));
  const total = moodLogs.length || 1;

  return (
    <AppShell title="Mood Tracker">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">How are you feeling today?</h2>
        <p className="text-muted-foreground">Log your daily mood and spot patterns over time.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Today's mood</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {MOODS.map((m) => {
                const active = todayMood?.mood === m.key;
                return (
                  <button key={m.key} onClick={() => { setMood(m.key, note); toast.success(`Mood set to ${m.label}`); }} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${active ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"}`}>
                    <span className="text-4xl">{m.emoji}</span>
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <div>
              <Textarea placeholder="Add a note about how you're feeling..." value={note} onChange={(e) => setNote(e.target.value)} />
              <Button className="mt-2 w-full bg-gradient-primary" onClick={() => { if (todayMood) { setMood(todayMood.mood, note); toast.success("Note saved"); } else toast.error("Select a mood first"); }}>Save note</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader><CardTitle>Weekly analysis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {counts.map((m) => (
              <div key={m.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{m.emoji} {m.label}</span>
                  <span className="font-semibold">{m.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${(m.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-4 divide-y border-t pt-3">
              {moodLogs.slice(0, 7).map((m) => {
                const meta = MOODS.find((x) => x.key === m.mood)!;
                return (
                  <div key={m.date} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-muted-foreground">{new Date(m.date).toLocaleDateString(undefined, { weekday: "long" })}</span>
                    <span>{meta.emoji} {meta.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
