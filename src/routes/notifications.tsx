import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Pill, Calendar, AlertTriangle, LifeBuoy, Megaphone, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — HealthGuard" }] }),
  component: NotificationsPage,
});

type NotifType = "medicine" | "appointment" | "health" | "emergency" | "govt";
type Notif = { id: string; type: NotifType; title: string; body: string; when: string };

const icons: Record<NotifType, any> = {
  medicine: Pill, appointment: Calendar, health: AlertTriangle, emergency: LifeBuoy, govt: Megaphone,
};
const tones: Record<NotifType, string> = {
  medicine: "bg-primary/10 text-primary",
  appointment: "bg-accent text-accent-foreground",
  health: "bg-warning/15 text-warning",
  emergency: "bg-destructive/15 text-destructive",
  govt: "bg-success/15 text-success",
};

function NotificationsPage() {
  const { medicines, appointments, logs } = useStore();
  const [read, setRead] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<NotifType | "all">("all");

  const notifs = useMemo<Notif[]>(() => {
    const items: Notif[] = [];
    medicines.slice(0, 3).forEach((m, i) => items.push({
      id: `m-${m.id}`, type: "medicine", title: `Time to take ${m.name}`, body: `${m.dosage} · scheduled at ${m.times?.[0] ?? "—"}`, when: `${i + 1}h ago`,
    }));
    appointments.filter((a) => a.status === "upcoming").slice(0, 2).forEach((a) => items.push({
      id: `a-${a.id}`, type: "appointment", title: `Upcoming: ${a.doctorName}`, body: `${a.date} · ${a.mode ?? "In-person"}`, when: "Today",
    }));
    const missed = logs.filter((l) => l.status === "missed").length;
    if (missed > 0) items.push({ id: "h-1", type: "health", title: "Adherence drop detected", body: `${missed} missed dose(s) this week. Review your schedule.`, when: "2h ago" });
    items.push({ id: "e-1", type: "emergency", title: "SOS test successful", body: "Your emergency contact received the test alert.", when: "Yesterday" });
    items.push({ id: "g-1", type: "govt", title: "Free Cardiac Camp — Nabha", body: "Sat 12 July at Civil Hospital. Register at your PHC.", when: "2d ago" });
    items.push({ id: "g-2", type: "govt", title: "Dengue Prevention Advisory", body: "Empty stagnant water weekly. Report fever + rash immediately.", when: "3d ago" });
    return items;
  }, [medicines, appointments, logs]);

  const shown = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unread = notifs.filter((n) => !read.has(n.id)).length;

  const markAll = () => setRead(new Set(notifs.map((n) => n.id)));

  const filters: { key: NotifType | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "medicine", label: "Medicine" },
    { key: "appointment", label: "Appointments" },
    { key: "health", label: "Health" },
    { key: "emergency", label: "Emergency" },
    { key: "govt", label: "Public health" },
  ];

  return (
    <AppShell title="Notifications">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bell className="h-5 w-5" /></div>
            <div>
              <p className="font-medium">{unread} unread</p>
              <p className="text-xs text-muted-foreground">{notifs.length} total notifications</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={markAll}>
            <CheckCheck className="mr-1 h-4 w-4" />Mark all read
          </Button>
        </Card>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} onClick={() => setFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {shown.map((n) => {
            const Icon = icons[n.type];
            const isRead = read.has(n.id);
            return (
              <Card
                key={n.id}
                className={cn("cursor-pointer p-4 transition-colors", !isRead && "border-primary/30 bg-primary/5")}
                onClick={() => setRead((r) => new Set(r).add(n.id))}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tones[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!isRead && <Badge className="bg-primary text-primary-foreground border-0">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{n.when}</p>
                  </div>
                </div>
              </Card>
            );
          })}
          {shown.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No notifications in this category.</p>}
        </div>
      </div>
    </AppShell>
  );
}
