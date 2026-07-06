import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useRoles } from "@/hooks/use-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Users, Truck, Megaphone, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — HealthGuard" }] }),
  component: AdminDashboardPage,
});

type Profile = { id: string; full_name: string | null; email: string | null };
type RoleRow = { id: string; user_id: string; role: string };
type Announcement = { id: string; title: string; body: string; audience: string; created_at: string };
type Ambulance = { id: string; patient_name: string; phone: string; address: string; emergency_type: string; scheduled_at: string; status: string };

function AdminDashboardPage() {
  const { isAdmin, loading } = useRoles();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [apptCount, setApptCount] = useState(0);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });

  const load = async () => {
    const [{ data: p }, { data: r }, { count }, { data: amb }, { data: ann }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("user_roles").select("id, user_id, role"),
      supabase.from("doctor_appointments").select("*", { count: "exact", head: true }),
      supabase.from("ambulance_bookings").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles((p ?? []) as Profile[]);
    setRoles((r ?? []) as RoleRow[]);
    setApptCount(count ?? 0);
    setAmbulances((amb ?? []) as Ambulance[]);
    setAnnouncements((ann ?? []) as Announcement[]);
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  if (loading) return <AppShell title="Admin"><p className="text-sm text-muted-foreground">Loading…</p></AppShell>;
  if (!isAdmin) {
    return (
      <AppShell title="Admin Dashboard">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <ShieldAlert className="h-10 w-10 text-warning" />
            <h3 className="text-lg font-semibold">Administrators only</h3>
            <p className="text-sm text-muted-foreground">You need the admin role to view this page.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const rolesByUser = roles.reduce<Record<string, string[]>>((acc, r) => {
    (acc[r.user_id] ??= []).push(r.role);
    return acc;
  }, {});
  const doctorCount = roles.filter((r) => r.role === "doctor").length;

  const setUserRole = async (userId: string, role: "doctor" | "admin" | "patient", enable: boolean) => {
    if (enable) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated.");
    void load();
  };

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return toast.error("Title and body required.");
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) return;
    const { error } = await supabase.from("announcements").insert({
      author_id: uid, title: form.title.trim(), body: form.body.trim(), audience: form.audience,
    });
    if (error) return toast.error(error.message);
    toast.success("Announcement posted.");
    setForm({ title: "", body: "", audience: "all" });
    void load();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    void load();
  };

  const updateAmbulanceStatus = async (id: string, status: string) => {
    await supabase.from("ambulance_bookings").update({ status }).eq("id", id);
    void load();
  };

  return (
    <AppShell title="Admin Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" /> Admin Dashboard
        </h2>
        <p className="text-muted-foreground">Manage users, doctors, emergencies, and announcements.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={profiles.length} />
        <StatCard label="Doctors" value={doctorCount} />
        <StatCard label="Appointments" value={apptCount} />
        <StatCard label="Ambulance requests" value={ambulances.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Users &amp; roles</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {profiles.map((p) => {
              const userRoles = rolesByUser[p.id] ?? [];
              const isDoc = userRoles.includes("doctor");
              const isAdm = userRoles.includes("admin");
              return (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.full_name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    <div className="flex gap-1">
                      {userRoles.map((r) => <Badge key={r} variant="outline" className="capitalize">{r}</Badge>)}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant={isDoc ? "outline" : "secondary"} onClick={() => setUserRole(p.id, "doctor", !isDoc)}>
                      {isDoc ? "Remove doctor" : "Make doctor"}
                    </Button>
                    <Button size="sm" variant={isAdm ? "outline" : "secondary"} onClick={() => setUserRole(p.id, "admin", !isAdm)}>
                      {isAdm ? "Remove admin" : "Make admin"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-4 w-4" /> Emergency requests</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {ambulances.length === 0 && <p className="text-sm text-muted-foreground">No ambulance requests.</p>}
            {ambulances.map((b) => (
              <div key={b.id} className="rounded-md border p-3">
                <div className="flex justify-between">
                  <p className="font-medium">{b.patient_name} · {b.emergency_type}</p>
                  <Badge variant="outline" className="capitalize">{b.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{b.phone} · {new Date(b.scheduled_at).toLocaleString()}</p>
                <p className="text-sm">{b.address}</p>
                <div className="mt-2 flex gap-2">
                  {b.status === "requested" && <Button size="sm" onClick={() => updateAmbulanceStatus(b.id, "confirmed")}>Confirm</Button>}
                  {b.status !== "completed" && b.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => updateAmbulanceStatus(b.id, "completed")}>Mark completed</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={postAnnouncement} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="patients">Patients</SelectItem>
                    <SelectItem value="doctors">Doctors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Message</Label>
                <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </div>
              <Button type="submit" className="bg-gradient-primary sm:col-span-2 sm:w-fit">Post announcement</Button>
            </form>
            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{a.title} <Badge variant="outline" className="ml-2 capitalize">{a.audience}</Badge></p>
                      <p className="text-sm text-muted-foreground">{a.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
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
