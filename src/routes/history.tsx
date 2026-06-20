import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, History as HistoryIcon, Pill } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Medicine history — HealthGuard" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { medicines, logs, profile } = useStore();
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const medMap = useMemo(() => Object.fromEntries(medicines.map((m) => [m.id, m])), [medicines]);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => l.date >= from && l.date <= to)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [logs, from, to]);

  const taken = filtered.filter((l) => l.status === "taken").length;
  const missed = filtered.filter((l) => l.status === "missed").length;
  const rate = filtered.length ? Math.round((taken / filtered.length) * 100) : 0;

  const downloadReport = () => {
    const rows = [
      ["Patient", profile.fullName],
      ["Email", profile.email],
      ["From", from],
      ["To", to],
      [],
      ["Date", "Time", "Medicine", "Dosage", "Status"],
      ...filtered.map((l) => [l.date, l.time, medMap[l.medicineId]?.name ?? "—", medMap[l.medicineId]?.dosage ?? "—", l.status]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `healthguard-history-${from}-to-${to}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <AppShell title="History">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medicine history</h2>
          <p className="text-muted-foreground">Review past doses and export reports for your doctor.</p>
        </div>
        <Button variant="outline" onClick={downloadReport}><Download className="mr-1 h-4 w-4" /> Download report</Button>
      </div>

      <Card className="mb-6 shadow-card">
        <CardContent className="flex flex-wrap items-end gap-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="ml-auto grid grid-cols-3 gap-3 text-center">
            <Stat label="Logged" value={filtered.length} />
            <Stat label="Taken" value={taken} tone="text-success" />
            <Stat label="Adherence" value={`${rate}%`} tone="text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle>Records</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <HistoryIcon className="h-8 w-8" />
              <p>No history in this date range.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((l) => {
                const m = medMap[l.medicineId];
                return (
                  <div key={l.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Pill className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m?.name ?? "Unknown"} <span className="text-muted-foreground font-normal">· {m?.dosage}</span></p>
                      <p className="text-xs text-muted-foreground">{l.date} · {l.time}</p>
                    </div>
                    {l.status === "taken" ? (
                      <Badge className="bg-success/15 text-success hover:bg-success/15">Taken</Badge>
                    ) : l.status === "missed" ? (
                      <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Missed</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
