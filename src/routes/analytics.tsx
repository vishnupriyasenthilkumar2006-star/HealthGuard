import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MediAlert" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { logs, medicines } = useStore();

  const daily = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const date = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.date === date);
    const total = dayLogs.length || medicines.reduce((s, m) => s + m.times.length, 0);
    const taken = dayLogs.filter((l) => l.status === "taken").length;
    const missed = dayLogs.filter((l) => l.status === "missed").length;
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      adherence: total ? Math.round((taken / total) * 100) : 0,
      taken,
      missed,
    };
  });

  const weekly = Array.from({ length: 4 }).map((_, i) => {
    const start = new Date();
    start.setDate(start.getDate() - (7 * (3 - i) + 6));
    const end = new Date();
    end.setDate(end.getDate() - 7 * (3 - i));
    let taken = 0, missed = 0;
    logs.forEach((l) => {
      const d = new Date(l.date);
      if (d >= start && d <= end) {
        if (l.status === "taken") taken++;
        if (l.status === "missed") missed++;
      }
    });
    return { week: `W${i + 1}`, taken, missed };
  });

  const totalTaken = logs.filter((l) => l.status === "taken").length;
  const totalMissed = logs.filter((l) => l.status === "missed").length;
  const overallAdherence = totalTaken + totalMissed ? Math.round((totalTaken / (totalTaken + totalMissed)) * 100) : 0;

  const pieData = [
    { name: "Taken", value: totalTaken, color: "oklch(0.70 0.15 160)" },
    { name: "Missed", value: totalMissed, color: "oklch(0.62 0.22 25)" },
  ];

  const stats = [
    { label: "Overall adherence", value: `${overallAdherence}%`, icon: TrendingUp, tone: "bg-primary/10 text-primary" },
    { label: "Total doses taken", value: totalTaken, icon: CheckCircle2, tone: "bg-success/15 text-success" },
    { label: "Total missed", value: totalMissed, icon: AlertTriangle, tone: "bg-destructive/10 text-destructive" },
    { label: "Active medicines", value: medicines.length, icon: BarChart3, tone: "bg-accent text-accent-foreground" },
  ];

  return (
    <AppShell title="Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Health analytics</h2>
        <p className="text-muted-foreground">Track adherence and progress over time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.tone}`}>
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
          <CardHeader>
            <CardTitle>30-day adherence trend</CardTitle>
            <p className="text-sm text-muted-foreground">Daily adherence percentage</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.16 245)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.58 0.16 245)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="currentColor" fontSize={11} />
                <YAxis stroke="currentColor" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="adherence" stroke="oklch(0.58 0.16 245)" strokeWidth={2} fill="url(#ga)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Taken vs missed</CardTitle>
            <p className="text-sm text-muted-foreground">All-time breakdown</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle>Monthly breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Last 4 weeks</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="week" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              <Legend />
              <Bar dataKey="taken" fill="oklch(0.70 0.15 160)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="missed" fill="oklch(0.62 0.22 25)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </AppShell>
  );
}
