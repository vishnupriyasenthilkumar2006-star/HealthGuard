import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Stethoscope, Clock, FileText, CheckCircle2, XCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/consultations")({
  head: () => ({ meta: [{ title: "Consultations — HealthGuard" }] }),
  component: ConsultationsPage,
});

function ConsultationsPage() {
  const { appointments, updateAppointment } = useStore();
  const online = appointments.filter((a) => a.mode === "online");
  const upcoming = online.filter((a) => a.status === "upcoming").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = online.filter((a) => a.status !== "upcoming").sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <AppShell title="Online Consultations">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Online consultations</h2>
          <p className="text-muted-foreground">Telemedicine visits with your doctors — past and upcoming.</p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link to="/doctors"><Plus className="mr-1 h-4 w-4" /> Book new</Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 && <Empty />}
          {upcoming.map((a) => (
            <Card key={a.id} className="shadow-card">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
                  <Video className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{a.doctor}</p>
                    <Badge variant="secondary">{a.specialty}</Badge>
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Telemedicine</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {a.date} · {a.time}
                  </p>
                  {a.reason && <p className="mt-2 text-sm"><FileText className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" /> {a.reason}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-gradient-primary" onClick={() => toast.success("Joining secure video room…")}>
                    <Video className="mr-1 h-4 w-4" /> Join call
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { updateAppointment(a.id, { status: "completed" }); toast.success("Marked completed"); }}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Done
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { updateAppointment(a.id, { status: "cancelled" }); toast("Cancelled"); }}>
                    <XCircle className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 && <Empty />}
          {past.map((a) => (
            <Card key={a.id} className="shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.doctor} <span className="text-sm text-muted-foreground">· {a.specialty}</span></p>
                  <p className="text-sm text-muted-foreground">{a.date} · {a.time}</p>
                </div>
                {a.status === "completed" && <Badge className="bg-success/15 text-success hover:bg-success/15">Completed</Badge>}
                {a.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Empty() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      No online consultations yet. <Link to="/doctors" className="text-primary underline">Find a doctor</Link>.
    </div>
  );
}
