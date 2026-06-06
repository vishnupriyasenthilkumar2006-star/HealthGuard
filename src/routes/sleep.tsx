import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Plus, Trash2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/sleep")({
  head: () => ({ meta: [{ title: "Sleep Tracker — MediAlert" }] }),
  component: SleepPage,
});

function diffHours(s: string, w: string) {
  const [sh, sm] = s.split(":").map(Number);
  const [wh, wm] = w.split(":").map(Number);
  let mins = wh * 60 + wm - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

function SleepPage() {
  const { sleepLogs, addSleep, deleteSleep } = useStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("06:30");

  const chartData = [...sleepLogs].slice(0, 7).reverse().map((s) => ({ date: new Date(s.date).toLocaleDateString(undefined, { weekday: "short" }), hours: s.hours }));
  const avg = sleepLogs.length ? Math.round((sleepLogs.reduce((a, s) => a + s.hours, 0) / sleepLogs.length) * 10) / 10 : 0;

  const save = () => {
    const hours = diffHours(sleepTime, wakeTime);
    addSleep({ date, sleepTime, wakeTime, hours });
    toast.success(`Logged ${hours}h of sleep`);
  };

  return (
    <AppShell title="Sleep Tracker">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Sleep monitoring</h2>
        <p className="text-muted-foreground">Track your sleep schedule to improve recovery and adherence.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /> Log sleep</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Bedtime</Label><Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} /></div>
              <div><Label>Wake</Label><Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} /></div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold">{diffHours(sleepTime, wakeTime)}h</p>
            </div>
            <Button className="w-full bg-gradient-primary" onClick={save}><Plus className="mr-1 h-4 w-4" /> Save entry</Button>
          </CardContent>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sleep trend</CardTitle>
              <p className="text-sm text-muted-foreground">Avg: <span className="font-semibold text-foreground">{avg}h</span></p>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs><linearGradient id="sleep" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" /><YAxis domain={[0, 12]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="url(#sleep)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader><CardTitle>Recent entries</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {sleepLogs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No entries yet.</p>}
              {sleepLogs.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{new Date(s.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
                    <p className="text-xs text-muted-foreground">{s.sleepTime} → {s.wakeTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{s.hours}h</span>
                    <Button size="icon" variant="ghost" onClick={() => deleteSleep(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
