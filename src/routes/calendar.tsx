import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pill, CalendarCheck } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Health Calendar — MediAlert" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { medicines, appointments } = useStore();
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const days = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const [selected, setSelected] = useState<string>(new Date().toISOString().slice(0, 10));

  const eventsFor = (dateStr: string) => {
    const meds = medicines.filter((m) => dateStr >= m.startDate && dateStr <= m.endDate);
    const appts = appointments.filter((a) => a.date === dateStr);
    return { meds, appts };
  };

  const sel = eventsFor(selected);

  return (
    <AppShell title="Calendar">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Smart Health Calendar</h2>
        <p className="text-muted-foreground">Your medicines, appointments and check-ups at a glance.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</CardTitle>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (d === null) return <div key={i} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const ev = eventsFor(dateStr);
                const hasAppt = ev.appts.length > 0;
                const hasMed = ev.meds.length > 0;
                const isSel = selected === dateStr;
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                return (
                  <button key={i} onClick={() => setSelected(dateStr)} className={`aspect-square rounded-lg border p-1 text-sm transition ${isSel ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"} ${isToday ? "font-bold" : ""}`}>
                    <div>{d}</div>
                    <div className="mt-1 flex justify-center gap-0.5">
                      {hasMed && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      {hasAppt && <span className="h-1.5 w-1.5 rounded-full bg-warning" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader><CardTitle>{new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1 text-sm font-semibold"><Pill className="h-4 w-4 text-primary" /> Medicines</p>
              {sel.meds.length === 0 ? <p className="text-sm text-muted-foreground">None scheduled.</p> : sel.meds.map((m) => (
                <div key={m.id} className="mb-1 rounded-md border p-2 text-sm"><p className="font-medium">{m.name} · {m.dosage}</p><p className="text-xs text-muted-foreground">{m.times.join(", ")}</p></div>
              ))}
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1 text-sm font-semibold"><CalendarCheck className="h-4 w-4 text-warning" /> Appointments</p>
              {sel.appts.length === 0 ? <p className="text-sm text-muted-foreground">None scheduled.</p> : sel.appts.map((a) => (
                <div key={a.id} className="mb-1 rounded-md border p-2 text-sm"><p className="font-medium">{a.doctor}</p><p className="text-xs text-muted-foreground">{a.specialty} · {a.time} · {a.location}</p></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
