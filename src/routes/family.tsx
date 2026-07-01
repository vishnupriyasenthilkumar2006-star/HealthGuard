import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Users, Pill, Calendar, AlertTriangle, HeartPulse } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "Family Dashboard — HealthGuard" }] }),
  component: FamilyPage,
});

type Member = {
  name: string;
  relation: string;
  age: number;
  adherence: number;
  nextAppointment?: string;
  lastAlert?: string;
  medsCount: number;
  wellness: number;
};

function FamilyPage() {
  const { profile, logs, medicines, appointments, caregivers } = useStore();

  const primary = useMemo<Member>(() => {
    const last7 = logs.filter((l) => new Date(l.date).getTime() >= Date.now() - 7 * 86400000);
    const taken = last7.filter((l) => l.status === "taken").length;
    const adherence = last7.length ? Math.round((taken / last7.length) * 100) : 100;
    const upcoming = appointments
      .filter((a) => a.status === "upcoming")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return {
      name: profile.fullName || "You",
      relation: "Self",
      age: profile.age ?? 0,
      adherence,
      nextAppointment: upcoming ? `${upcoming.doctor} · ${upcoming.date}` : undefined,
      medsCount: medicines.length,
      wellness: adherence,
    };
  }, [profile, logs, medicines, appointments]);

  const family: Member[] = [
    primary,
    { name: "Harpreet Kaur", relation: "Mother", age: 68, adherence: 72, nextAppointment: "Dr. Sandeep · 5 July", lastAlert: "Missed evening BP medicine", medsCount: 4, wellness: 68 },
    { name: "Balbir Singh", relation: "Father", age: 72, adherence: 91, nextAppointment: "Dr. Arjun (Tele) · 10 July", medsCount: 3, wellness: 82 },
    { name: "Simran", relation: "Daughter", age: 12, adherence: 100, medsCount: 1, wellness: 95 },
  ];

  const alerts = family.filter((m) => m.lastAlert || m.adherence < 75);

  return (
    <AppShell title="Family Health Dashboard">
      <div className="mx-auto max-w-6xl space-y-5">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Household</p>
                <p className="text-lg font-semibold">{family.length} members · {caregivers.length} caregivers linked</p>
              </div>
            </div>
            <Badge className="bg-success/15 text-success border-0">All monitored</Badge>
          </div>
        </Card>

        {alerts.length > 0 && (
          <Card className="border-warning/40 bg-warning/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="font-medium">Active Alerts</p>
            </div>
            <ul className="space-y-1 text-sm">
              {alerts.map((a) => (
                <li key={a.name} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{a.name}</span> — {a.lastAlert ?? `Adherence at ${a.adherence}%`}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {family.map((m) => (
            <Card key={m.name} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-semibold">
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.relation} · {m.age} yrs</p>
                  </div>
                </div>
                <Badge variant={m.adherence >= 85 ? "secondary" : "destructive"}>{m.adherence}%</Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><HeartPulse className="h-3 w-3" />Wellness</span>
                    <span className="font-medium">{m.wellness}/100</span>
                  </div>
                  <Progress value={m.wellness} className="h-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="flex items-center gap-1 text-muted-foreground"><Pill className="h-3 w-3" />Medications</p>
                    <p className="mt-0.5 font-semibold">{m.medsCount} active</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />Next visit</p>
                    <p className="mt-0.5 truncate font-semibold">{m.nextAppointment ?? "None"}</p>
                  </div>
                </div>
                {m.lastAlert && (
                  <p className="rounded-md bg-warning/10 p-2 text-xs text-warning-foreground">
                    <AlertTriangle className="mr-1 inline h-3 w-3 text-warning" />
                    {m.lastAlert}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Demo data for non-primary members. Invite family via Caregivers to link real accounts.
        </p>
      </div>
    </AppShell>
  );
}
