import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ambulance")({
  head: () => ({ meta: [{ title: "Ambulance Booking — HealthGuard" }] }),
  component: AmbulancePage,
});

type Booking = {
  id: string;
  patient_name: string;
  phone: string;
  address: string;
  emergency_type: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const EMERGENCY_TYPES = ["Accident", "Cardiac", "Respiratory", "Pregnancy", "Elderly Care", "Other"];

function AmbulancePage() {
  const [form, setForm] = useState({
    patient_name: "",
    phone: "",
    address: "",
    emergency_type: "Accident",
    scheduled_at: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("ambulance_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings((data ?? []) as Booking[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please fill patient name, phone, and address.");
      return;
    }
    if (!/^[+\d][\d\s\-()]{6,}$/.test(form.phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) {
      toast.error("Please sign in.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("ambulance_bookings").insert({
      user_id: uid,
      patient_name: form.patient_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      emergency_type: form.emergency_type,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ambulance requested — you'll receive confirmation shortly.");
    setForm({ ...form, patient_name: "", phone: "", address: "", notes: "" });
    void load();
  };

  const cancel = async (id: string) => {
    await supabase.from("ambulance_bookings").update({ status: "cancelled" }).eq("id", id);
    toast.success("Booking cancelled.");
    void load();
  };

  return (
    <AppShell title="Ambulance Booking">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" /> Request an Ambulance
        </h2>
        <p className="text-muted-foreground">Book emergency or scheduled ambulance transport.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle>New booking</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Patient name</Label>
                  <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone number</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91…" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Pickup address</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Emergency type</Label>
                  <Select value={form.emergency_type} onValueChange={(v) => setForm({ ...form, emergency_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EMERGENCY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date &amp; time</Label>
                  <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <Button type="submit" disabled={saving} className="bg-gradient-primary">
                {saving ? "Requesting…" : "Request ambulance"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Your bookings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 && <p className="text-sm text-muted-foreground">No ambulance bookings yet.</p>}
            {bookings.map((b) => (
              <div key={b.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{b.patient_name}</p>
                  <Badge
                    variant={b.status === "cancelled" ? "outline" : b.status === "confirmed" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {b.status}
                  </Badge>
                </div>
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {b.phone}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {b.address}</p>
                  <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(b.scheduled_at).toLocaleString()} · {b.emergency_type}</p>
                </div>
                {b.status !== "cancelled" && (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => cancel(b.id)}>Cancel booking</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
