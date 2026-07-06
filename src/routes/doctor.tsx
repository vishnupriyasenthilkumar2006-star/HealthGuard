import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useRoles } from "@/hooks/use-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Check, X, Video, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — HealthGuard" }] }),
  component: DoctorDashboardPage,
});

type Appt = {
  id: string;
  user_id: string;
  doctor: string;
  specialty: string | null;
  appointment_date: string;
  appointment_time: string;
  location: string | null;
  notes: string | null;
  status: string;
  mode: string | null;
  reason: string | null;
};

type PatientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string | null;
  conditions: string | null;
};

function DoctorDashboardPage() {
  const { isDoctor, isAdmin, loading } = useRoles();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientProfile>>({});

  const load = async () => {
    const { data } = await supabase
      .from("doctor_appointments")
      .select("*")
      .order("appointment_date", { ascending: true });
    const list = (data ?? []) as Appt[];
    setAppts(list);
    const ids = Array.from(new Set(list.map((a) => a.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
      const map: Record<string, PatientProfile> = {};
      (profs ?? []).forEach((p) => (map[p.id] = p as PatientProfile));
      setPatients(map);
    }
  };

  useEffect(() => {
    if (isDoctor || isAdmin) void load();
  }, [isDoctor, isAdmin]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("doctor_appointments").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Appointment ${status}.`);
      void load();
    }
  };

  if (loading) return <AppShell title="Doctor"><p className="text-sm text-muted-foreground">Loading…</p></AppShell>;

  if (!isDoctor && !isAdmin) {
    return (
      <AppShell title="Doctor Dashboard">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <ShieldAlert className="h-10 w-10 text-warning" />
            <h3 className="text-lg font-semibold">Doctors only</h3>
            <p className="text-sm text-muted-foreground">You need the doctor role to view this page. Ask an administrator to grant access.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todays = appts.filter((a) => a.appointment_date === today);
  const requests = appts.filter((a) => a.status === "upcoming");

  return (
    <AppShell title="Doctor Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" /> Doctor Dashboard
        </h2>
        <p className="text-muted-foreground">Manage appointment requests and patient consultations.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's schedule" value={todays.length} />
        <StatCard label="Pending requests" value={requests.length} />
        <StatCard label="Total patients" value={new Set(appts.map((a) => a.user_id)).size} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Appointment requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {appts.length === 0 && <p className="text-sm text-muted-foreground">No appointments assigned yet.</p>}
            {appts.map((a) => {
              const p = patients[a.user_id];
              return (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{p?.full_name ?? "Patient"} · {a.specialty ?? "General"}</p>
                      <p className="text-sm text-muted-foreground">{a.appointment_date} at {a.appointment_time} · {a.mode ?? "in-person"}</p>
                      {a.reason && <p className="mt-1 text-sm">Reason: {a.reason}</p>}
                    </div>
                    <Badge variant="outline" className="capitalize">{a.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.status === "upcoming" && (
                      <>
                        <Button size="sm" onClick={() => setStatus(a.id, "completed")}><Check className="mr-1 h-3.5 w-3.5" /> Accept &amp; complete</Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "cancelled")}><X className="mr-1 h-3.5 w-3.5" /> Reject</Button>
                      </>
                    )}
                    {a.mode === "online" && a.status !== "cancelled" && (
                      <Button size="sm" variant="secondary"><Video className="mr-1 h-3.5 w-3.5" /> Start consultation</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Assigned patients</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.values(patients).length === 0 && <p className="text-sm text-muted-foreground">No patient records available.</p>}
            {Object.values(patients).map((p) => (
              <div key={p.id} className="rounded-lg border p-3">
                <p className="font-medium">{p.full_name ?? "Unnamed patient"}</p>
                <p className="text-xs text-muted-foreground">{p.email}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Age:</span> {p.age ?? "—"}</p>
                  <p><span className="text-muted-foreground">Gender:</span> {p.gender ?? "—"}</p>
                  <p><span className="text-muted-foreground">Blood:</span> {p.blood_group ?? "—"}</p>
                  <p><span className="text-muted-foreground">Allergies:</span> {p.allergies ?? "—"}</p>
                </div>
                {p.conditions && <p className="mt-2 text-sm"><span className="text-muted-foreground">Conditions:</span> {p.conditions}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
