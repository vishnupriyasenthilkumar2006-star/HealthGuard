import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore, type Appointment } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments")({
  head: () => ({ meta: [{ title: "Appointments — HealthGuard" }] }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const upcoming = appointments.filter((a) => a.status === "upcoming").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = appointments.filter((a) => a.status !== "upcoming").sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <AppShell title="Appointments">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Doctor appointments</h2>
          <p className="text-muted-foreground">Schedule visits and view your appointment history.</p>
        </div>
        <AppointmentDialog onSubmit={addAppointment} />
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <List items={upcoming} onUpdate={updateAppointment} onDelete={deleteAppointment} />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <List items={past} onUpdate={updateAppointment} onDelete={deleteAppointment} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function List({ items, onUpdate, onDelete }: { items: Appointment[]; onUpdate: (id: string, a: Partial<Appointment>) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No appointments here.</p>;
  return (
    <div className="grid gap-3">
      {items.map((a) => (
        <Card key={a.id} className="shadow-card">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{a.doctor}</p>
                <Badge variant="secondary">{a.specialty}</Badge>
                {a.status === "completed" && <Badge className="bg-success/15 text-success hover:bg-success/15">Completed</Badge>}
                {a.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {a.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.time}</span>
                {a.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {a.location}</span>}
              </div>
              {a.notes && <p className="mt-2 text-sm">{a.notes}</p>}
            </div>
            <div className="flex gap-2">
              {a.status === "upcoming" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => { onUpdate(a.id, { status: "completed" }); toast.success("Marked completed"); }}><CheckCircle2 className="mr-1 h-4 w-4" /> Done</Button>
                  <Button size="sm" variant="outline" onClick={() => { onUpdate(a.id, { status: "cancelled" }); toast("Cancelled"); }}><XCircle className="mr-1 h-4 w-4" /> Cancel</Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => { onDelete(a.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AppointmentDialog({ onSubmit }: { onSubmit: (a: Omit<Appointment, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => { setDoctor(""); setSpecialty(""); setDate(new Date().toISOString().slice(0, 10)); setTime("10:00"); setLocation(""); setNotes(""); };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary"><Plus className="mr-1 h-4 w-4" /> Schedule</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule appointment</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Doctor*</Label><Input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Name" /></div>
          <div className="sm:col-span-2"><Label>Specialty</Label><Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiologist" /></div>
          <div><Label>Date*</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Time*</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!doctor) { toast.error("Doctor name is required"); return; }
            onSubmit({ doctor, specialty, date, time, location, notes, status: "upcoming" });
            toast.success("Appointment scheduled");
            setOpen(false);
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
