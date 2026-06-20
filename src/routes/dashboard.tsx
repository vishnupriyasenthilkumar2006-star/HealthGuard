import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore, getDoseStatus } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, CheckCircle2, AlertTriangle, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HealthGuard" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { medicines, logs, profile, setDoseStatus } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  const todayDoses = medicines.flatMap((m) =>
    m.times.map((t) => ({
      medicine: m,
      time: t,
      status: getDoseStatus(logs, m.id, today, t),
    })),
  ).sort((a, b) => a.time.localeCompare(b.time));

  const upcoming = todayDoses.filter((d) => d.status === "pending");
  const missed = logs.filter((l) => l.status === "missed").length;
  const takenToday = todayDoses.filter((d) => d.status === "taken").length;
  const adherence = todayDoses.length ? Math.round((takenToday / Math.max(1, todayDoses.length)) * 100) : 0;

  // weekly chart data
  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.date === date);
    const total = dayLogs.length || medicines.reduce((s, m) => s + m.times.length, 0);
    const taken = dayLogs.filter((l) => l.status === "taken").length;
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      taken,
      missed: dayLogs.filter((l) => l.status === "missed").length,
      adherence: total ? Math.round((taken / total) * 100) : 0,
    };
  });

  const stats = [
    { label: "Today's doses", value: todayDoses.length, icon: Pill, tone: "bg-accent text-accent-foreground" },
    { label: "Taken today", value: takenToday, icon: CheckCircle2, tone: "bg-success/15 text-success" },
    { label: "Missed (all-time)", value: missed, icon: AlertTriangle, tone: "bg-destructive/10 text-destructive" },
    { label: "Adherence", value: `${adherence}%`, icon: TrendingUp, tone: "bg-primary/10 text-primary" },
  ];

  const hi = new Date().getHours();
  const greet = hi < 12 ? "Good morning" : hi < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell title="Dashboard">
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h2 className="text-2xl font-bold tracking-tight">{greet}, {profile.fullName.split(" ")[0]} 👋</h2>
        <p className="text-muted-foreground">Here's a quick look at your medication day.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", s.tone)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's schedule</CardTitle>
              <p className="text-sm text-muted-foreground">{todayDoses.length} doses · {takenToday} taken</p>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/reminders">All reminders <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayDoses.length === 0 && (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No medicines scheduled yet. Add one to get started.</p>
            )}
            {todayDoses.map((d) => (
              <div key={`${d.medicine.id}-${d.time}`} className="flex items-center gap-4 rounded-xl border bg-background p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.medicine.name} <span className="text-sm font-normal text-muted-foreground">· {d.medicine.dosage}</span></p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {d.time}</p>
                </div>
                <StatusBadge status={d.status} />
                {d.status !== "taken" && (
                  <Button size="sm" variant="outline" onClick={() => setDoseStatus(d.medicine.id, today, d.time, "taken")}>Mark taken</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <p className="text-sm text-muted-foreground">Next reminders today</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">All done for today 🎉</p>}
            {upcoming.slice(0, 5).map((d) => (
              <div key={`${d.medicine.id}-${d.time}`} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Clock className="h-4 w-4" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{d.medicine.name}</p>
                  <p className="text-xs text-muted-foreground">{d.time} · {d.medicine.dosage}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Adherence — last 7 days</CardTitle>
            <p className="text-sm text-muted-foreground">How well you've followed your plan</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.16 245)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.58 0.16 245)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="adherence" stroke="oklch(0.58 0.16 245)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Doses taken vs missed</CardTitle>
            <p className="text-sm text-muted-foreground">Daily breakdown</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="taken" stackId="a" fill="oklch(0.70 0.15 160)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="missed" stackId="a" fill="oklch(0.62 0.22 25)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: "taken" | "missed" | "pending" }) {
  if (status === "taken") return <Badge className="bg-success/15 text-success hover:bg-success/15">Taken</Badge>;
  if (status === "missed") return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/10">Missed</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}
