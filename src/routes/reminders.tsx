import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore, getDoseStatus } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle2, X, Pill } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reminders")({
  head: () => ({ meta: [{ title: "Reminders — HealthGuard" }] }),
  component: RemindersPage,
});

function RemindersPage() {
  const { medicines, logs, setDoseStatus } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const doses = medicines
    .flatMap((m) => m.times.map((t) => {
      const [h, mi] = t.split(":").map(Number);
      return { medicine: m, time: t, minutes: h * 60 + mi, status: getDoseStatus(logs, m.id, today, t) };
    }))
    .sort((a, b) => a.minutes - b.minutes);

  const upcoming = doses.filter((d) => d.minutes >= nowMin && d.status !== "taken");
  const past = doses.filter((d) => d.minutes < nowMin);
  const nextDose = upcoming[0];

  return (
    <AppShell title="Reminders">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Today's reminders</h2>
        <p className="text-muted-foreground">Mark doses as taken or missed to keep your record accurate.</p>
      </div>

      {nextDose && (
        <Card className="mb-6 overflow-hidden border-0 bg-gradient-primary text-primary-foreground shadow-elevated">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur">
                <Bell className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">Next reminder</p>
                <p className="text-2xl font-semibold">{nextDose.medicine.name} · {nextDose.medicine.dosage}</p>
                <p className="text-sm opacity-90 flex items-center gap-1"><Clock className="h-4 w-4" /> {nextDose.time}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setDoseStatus(nextDose.medicine.id, today, nextDose.time, "taken"); toast.success("Marked as taken"); }}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Mark taken
              </Button>
              <Button variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => { setDoseStatus(nextDose.medicine.id, today, nextDose.time, "missed"); toast("Marked as missed"); }}>
                <X className="mr-1 h-4 w-4" /> Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Upcoming today</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No more reminders today. 🎉</p>}
            {upcoming.map((d) => (
              <DoseRow key={`${d.medicine.id}-${d.time}`} dose={d} onAction={(s) => setDoseStatus(d.medicine.id, today, d.time, s)} />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Earlier today</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {past.length === 0 && <p className="text-sm text-muted-foreground">No doses earlier today.</p>}
            {past.map((d) => (
              <DoseRow key={`${d.medicine.id}-${d.time}`} dose={d} onAction={(s) => setDoseStatus(d.medicine.id, today, d.time, s)} />
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function DoseRow({ dose, onAction }: { dose: { medicine: any; time: string; status: "taken" | "missed" | "pending" }; onAction: (s: "taken" | "missed") => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
        <Pill className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{dose.medicine.name}</p>
        <p className="text-xs text-muted-foreground">{dose.time} · {dose.medicine.dosage}</p>
      </div>
      {dose.status === "taken" ? (
        <Badge className="bg-success/15 text-success hover:bg-success/15">Taken</Badge>
      ) : dose.status === "missed" ? (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Missed</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      )}
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={() => onAction("taken")} aria-label="Taken"><CheckCircle2 className="h-4 w-4 text-success" /></Button>
        <Button size="icon" variant="ghost" onClick={() => onAction("missed")} aria-label="Missed"><X className="h-4 w-4 text-destructive" /></Button>
      </div>
    </div>
  );
}
