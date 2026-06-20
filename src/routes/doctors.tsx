import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Stethoscope, MapPin, Languages, Star, Video, Calendar as CalendarIcon, Search, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctors")({
  head: () => ({ meta: [{ title: "Find a Doctor — HealthGuard" }] }),
  component: DoctorsPage,
});

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  hospital: string;
  district: string;
  languages: string[];
  rating: number;
  experience: number;
  fee: number;
  online: boolean;
  nextSlot: string;
};

const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Priya Sharma", specialty: "General Physician", qualification: "MBBS, MD", hospital: "Nabha Civil Hospital", district: "Nabha, Punjab", languages: ["Hindi", "Punjabi", "English"], rating: 4.8, experience: 12, fee: 200, online: true, nextSlot: "Today 3:30 PM" },
  { id: "d2", name: "Dr. Rajesh Kumar", specialty: "Cardiologist", qualification: "MD, DM Cardiology", hospital: "Rural Health Centre", district: "Patiala", languages: ["Hindi", "English"], rating: 4.9, experience: 18, fee: 500, online: true, nextSlot: "Tomorrow 10:00 AM" },
  { id: "d3", name: "Dr. Anjali Menon", specialty: "Pediatrician", qualification: "MBBS, DCH", hospital: "Community Health Centre", district: "Nabha", languages: ["Malayalam", "Hindi", "English"], rating: 4.7, experience: 9, fee: 250, online: true, nextSlot: "Today 5:00 PM" },
  { id: "d4", name: "Dr. Suresh Reddy", specialty: "Endocrinologist", qualification: "MBBS, MD, DM", hospital: "District Hospital", district: "Patiala", languages: ["Telugu", "Hindi", "English"], rating: 4.6, experience: 15, fee: 600, online: false, nextSlot: "Mon 11:00 AM" },
  { id: "d5", name: "Dr. Kavitha Iyer", specialty: "Gynecologist", qualification: "MBBS, MS", hospital: "Sub-District Hospital", district: "Sangrur", languages: ["Tamil", "Hindi", "English"], rating: 4.9, experience: 14, fee: 400, online: true, nextSlot: "Today 6:30 PM" },
  { id: "d6", name: "Dr. Harpreet Singh", specialty: "Orthopedic", qualification: "MBBS, MS Ortho", hospital: "Nabha Civil Hospital", district: "Nabha", languages: ["Punjabi", "Hindi", "English"], rating: 4.5, experience: 11, fee: 350, online: true, nextSlot: "Tomorrow 2:00 PM" },
  { id: "d7", name: "Dr. Lakshmi Rao", specialty: "Dermatologist", qualification: "MBBS, MD Derm", hospital: "Telemedicine Hub", district: "Online only", languages: ["Kannada", "Hindi", "English"], rating: 4.8, experience: 8, fee: 300, online: true, nextSlot: "Today 4:00 PM" },
  { id: "d8", name: "Dr. Mohit Patel", specialty: "Psychiatrist", qualification: "MBBS, MD Psych", hospital: "Mental Health Wing", district: "Patiala", languages: ["Hindi", "English"], rating: 4.7, experience: 10, fee: 450, online: true, nextSlot: "Wed 1:00 PM" },
];

const SPECIALTIES = ["All", ...Array.from(new Set(DOCTORS.map((d) => d.specialty)))];

function DoctorsPage() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const filtered = useMemo(() => DOCTORS.filter((d) => {
    if (specialty !== "All" && d.specialty !== specialty) return false;
    if (onlineOnly && !d.online) return false;
    if (query && !`${d.name} ${d.specialty} ${d.hospital} ${d.district}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [query, specialty, onlineOnly]);

  return (
    <AppShell title="Find a Doctor">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Telemedicine doctors</h2>
        <p className="text-muted-foreground">Consult certified doctors online or book an in-person visit at a nearby rural health centre.</p>
      </div>

      <Card className="mb-5 shadow-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, specialty, hospital…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>{SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant={onlineOnly ? "default" : "outline"} onClick={() => setOnlineOnly((v) => !v)}>
            <Video className="mr-1 h-4 w-4" /> Online only
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No doctors match those filters.</p>
        )}
      </div>
    </AppShell>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="shadow-card transition-shadow hover:shadow-elevated">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold">{doctor.name}</p>
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{doctor.specialty} · {doctor.experience} yrs</p>
            <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
            <Star className="h-3 w-3 fill-current" /> {doctor.rating}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {doctor.hospital} · {doctor.district}</p>
          <p className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" /> {doctor.languages.join(", ")}</p>
          <p className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> Next: <span className="font-medium text-foreground">{doctor.nextSlot}</span></p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {doctor.online && <Badge className="bg-success/15 text-success hover:bg-success/15"><Video className="mr-1 h-3 w-3" /> Online</Badge>}
          <span className="ml-auto text-sm font-semibold">₹{doctor.fee}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <BookDialog doctor={doctor} mode="online" />
          <BookDialog doctor={doctor} mode="in-person" />
        </div>
      </CardContent>
    </Card>
  );
}

function BookDialog({ doctor, mode }: { doctor: Doctor; mode: "online" | "in-person" }) {
  const { addAppointment } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [reason, setReason] = useState("");

  if (mode === "online" && !doctor.online) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={mode === "online" ? "default" : "outline"} className={mode === "online" ? "flex-1 bg-gradient-primary" : "flex-1"}>
          {mode === "online" ? <><Video className="mr-1 h-4 w-4" /> Consult</> : <><CalendarIcon className="mr-1 h-4 w-4" /> Visit</>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "online" ? "Online consultation" : "In-person visit"} with {doctor.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div className="sm:col-span-2">
            <Label>Reason for visit</Label>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your symptoms…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            addAppointment({
              doctor: doctor.name, specialty: doctor.specialty, date, time,
              location: mode === "in-person" ? `${doctor.hospital}, ${doctor.district}` : "Online consultation",
              notes: reason, status: "upcoming", mode, reason,
            });
            toast.success(mode === "online" ? "Online consultation requested" : "Visit scheduled");
            setOpen(false);
            navigate({ to: mode === "online" ? "/consultations" : "/appointments" });
          }}>Confirm booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
