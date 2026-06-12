import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplets, Activity, Smile, Moon, Sun, Bell, Trophy, Flame, ArrowRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/wellness")({
  head: () => ({ meta: [{ title: "Wellness — MediAlert" }] }),
  component: WellnessPage,
});

function WellnessPage() {
  const { prefs, updatePrefs, waterLogs, exerciseLogs, moodLogs, sleepLogs, addWater, addExercise, setMood, rewards } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  const waterToday = waterLogs.find((w) => w.date === today)?.glasses ?? 0;
  const waterPct = Math.min(100, Math.round((waterToday / prefs.waterGoal) * 100));
  const exerciseToday = exerciseLogs.find((e) => e.date === today);
  const moodToday = moodLogs.find((m) => m.date === today);
  const lastSleep = sleepLogs[0];

  // 7-day series
  const series = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      water: waterLogs.find((w) => w.date === date)?.glasses ?? 0,
      exercise: exerciseLogs.filter((e) => e.date === date).reduce((s, e) => s + e.minutes, 0),
      sleep: sleepLogs.find((s) => s.date === date)?.hours ?? 0,
    };
  });

  const exerciseDays7 = series.filter((s) => s.exercise > 0).length;
  const exerciseRate = Math.round((exerciseDays7 / 7) * 100);
  const avgSleep = (series.reduce((s, x) => s + x.sleep, 0) / 7).toFixed(1);

  const moodEmoji: Record<string, string> = { happy: "😊", normal: "🙂", tired: "😴", stressed: "😣", sick: "🤒" };

  return (
    <AppShell title="Wellness">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Smart Wellness Reminders</h2>
        <p className="text-muted-foreground">Build healthy daily habits — hydration, exercise, mood, and sleep in one place.</p>
      </div>

      {/* Snapshot cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Droplets className="h-5 w-5" /></div>
              <Badge variant="secondary">{waterPct}%</Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Water today</p>
              <p className="text-2xl font-semibold">{waterToday} / {prefs.waterGoal}</p>
            </div>
            <Progress value={waterPct} />
            <Button size="sm" className="w-full" onClick={() => { addWater(1); toast.success("Logged 1 glass"); }}>+ Drank water</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success"><Activity className="h-5 w-5" /></div>
              <Badge variant="secondary">{exerciseRate}% / wk</Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Exercise today</p>
              <p className="text-2xl font-semibold">{exerciseToday ? `${exerciseToday.minutes} min` : "Not yet"}</p>
            </div>
            {exerciseToday ? (
              <p className="text-xs text-muted-foreground">{exerciseToday.type} · logged</p>
            ) : (
              <Button size="sm" variant="outline" className="w-full" onClick={() => { addExercise({ date: today, type: "Walk", minutes: 20 }); toast.success("Logged 20 min walk"); }}>Mark completed</Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning"><Smile className="h-5 w-5" /></div>
              <Badge variant="secondary">Today</Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mood</p>
              <p className="text-2xl font-semibold">{moodToday ? `${moodEmoji[moodToday.mood]} ${moodToday.mood}` : "Not set"}</p>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full"><Link to="/mood">Open mood tracker</Link></Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Moon className="h-5 w-5" /></div>
              <Badge variant="secondary">Avg {avgSleep}h</Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Last sleep</p>
              <p className="text-2xl font-semibold">{lastSleep ? `${lastSleep.hours} h` : "—"}</p>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full"><Link to="/sleep">Sleep tracker</Link></Button>
          </CardContent>
        </Card>
      </div>

      {/* Reminder settings */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Reminder schedule</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="wre" className="text-sm">All reminders</Label>
            <Switch id="wre" checked={prefs.wellnessRemindersEnabled} onCheckedChange={(v) => { updatePrefs({ wellnessRemindersEnabled: v }); toast.success(v ? "Reminders enabled" : "Reminders paused"); }} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div>
            <Label className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" /> Water reminder interval</Label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3].map((h) => (
                <Button key={h} type="button" variant={prefs.waterReminderHours === h ? "default" : "outline"} size="sm" onClick={() => updatePrefs({ waterReminderHours: h })}>Every {h} {h === 1 ? "hour" : "hours"}</Button>
              ))}
              <Button type="button" variant={prefs.waterReminderHours === 0 ? "default" : "outline"} size="sm" onClick={() => updatePrefs({ waterReminderHours: 0 })}>Off</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="ex" className="flex items-center gap-2"><Activity className="h-4 w-4 text-success" /> Exercise reminder time</Label>
            <Input id="ex" type="time" value={prefs.exerciseReminderTime} onChange={(e) => updatePrefs({ exerciseReminderTime: e.target.value })} className="mt-2 max-w-[160px]" />
          </div>
          <div>
            <Label htmlFor="md" className="flex items-center gap-2"><Smile className="h-4 w-4 text-warning" /> Mood check-in time</Label>
            <Input id="md" type="time" value={prefs.moodReminderTime} onChange={(e) => updatePrefs({ moodReminderTime: e.target.value })} className="mt-2 max-w-[160px]" />
          </div>
          <div>
            <Label htmlFor="bd" className="flex items-center gap-2"><Moon className="h-4 w-4" /> Bedtime reminder</Label>
            <Input id="bd" type="time" value={prefs.bedtimeReminder} onChange={(e) => updatePrefs({ bedtimeReminder: e.target.value })} className="mt-2 max-w-[160px]" />
          </div>
          <div>
            <Label htmlFor="wk" className="flex items-center gap-2"><Sun className="h-4 w-4 text-warning" /> Wake-up reminder</Label>
            <Input id="wk" type="time" value={prefs.wakeReminder} onChange={(e) => updatePrefs({ wakeReminder: e.target.value })} className="mt-2 max-w-[160px]" />
          </div>
          <div>
            <Label className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Daily water goal</Label>
            <Input type="number" min={1} max={20} value={prefs.waterGoal} onChange={(e) => updatePrefs({ waterGoal: parseInt(e.target.value || "8") })} className="mt-2 max-w-[160px]" />
          </div>
        </CardContent>
      </Card>

      {/* 7-day chart + rewards */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>Wellness trends — last 7 days</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Line type="monotone" dataKey="water" name="Water (glasses)" stroke="oklch(0.58 0.16 245)" strokeWidth={2} />
                <Line type="monotone" dataKey="exercise" name="Exercise (min)" stroke="oklch(0.70 0.15 160)" strokeWidth={2} />
                <Line type="monotone" dataKey="sleep" name="Sleep (h)" stroke="oklch(0.62 0.18 295)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-warning" /> Achievements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-destructive" /><div><p className="text-sm font-medium">Health streak</p><p className="text-xs text-muted-foreground">Consecutive healthy days</p></div></div>
              <span className="text-2xl font-bold">{rewards.streak}</span>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Points earned</p>
              <p className="mt-1 text-2xl font-bold">{rewards.points}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {rewards.badges.map((b) => <Badge key={b} variant="secondary">{b}</Badge>)}
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full"><Link to="/rewards">View all rewards <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick log mood */}
      <Card className="mt-6 shadow-card">
        <CardHeader><CardTitle>Quick mood check-in</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(["happy", "normal", "tired", "stressed", "sick"] as const).map((m) => (
              <button key={m} onClick={() => { setMood(m); toast.success(`Mood logged: ${m}`); }} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${moodToday?.mood === m ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"}`}>
                <span className="text-3xl">{moodEmoji[m]}</span>
                <span className="text-sm font-medium capitalize">{m}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
