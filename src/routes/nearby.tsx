import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Navigation, Hospital, Stethoscope, Pill } from "lucide-react";

export const Route = createFileRoute("/nearby")({
  head: () => ({ meta: [{ title: "Nearby Healthcare — HealthGuard" }] }),
  component: NearbyPage,
});

type Place = { name: string; type: "hospital" | "clinic" | "pharmacy"; distance: string; rating: number; address: string; phone: string; open: boolean };

const PLACES: Place[] = [
  { name: "Bayside Medical Center", type: "hospital", distance: "1.2 km", rating: 4.6, address: "240 Marine Dr", phone: "+1 555-0110", open: true },
  { name: "Metro Health Hospital", type: "hospital", distance: "3.5 km", rating: 4.4, address: "55 City Sq", phone: "+1 555-0220", open: true },
  { name: "Dr. Lee Family Clinic", type: "clinic", distance: "0.9 km", rating: 4.8, address: "12 Oak St", phone: "+1 555-0199", open: true },
  { name: "Wellness Plus Clinic", type: "clinic", distance: "2.1 km", rating: 4.3, address: "88 Pine Ave", phone: "+1 555-0314", open: false },
  { name: "Bayside Pharmacy", type: "pharmacy", distance: "0.6 km", rating: 4.7, address: "120 Marine Dr", phone: "+1 555-0123", open: true },
  { name: "24/7 MedMart", type: "pharmacy", distance: "1.8 km", rating: 4.2, address: "9 Central Rd", phone: "+1 555-0456", open: true },
];

const ICONS = { hospital: Hospital, clinic: Stethoscope, pharmacy: Pill };

function NearbyPage() {
  const [filter, setFilter] = useState<"all" | Place["type"]>("all");
  const [q, setQ] = useState("");
  const list = PLACES.filter((p) => (filter === "all" || p.type === filter) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="Nearby Healthcare">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Nearby healthcare services</h2>
        <p className="text-muted-foreground">Find hospitals, clinics, and pharmacies around you.</p>
      </div>

      <Card className="mb-6 overflow-hidden shadow-card">
        <div className="relative h-48 bg-gradient-to-br from-primary/10 via-accent to-primary/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(var(--primary)/0.15),_transparent_40%),_radial-gradient(circle_at_70%_70%,_hsl(var(--primary)/0.1),_transparent_40%)]" />
          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <p className="absolute bottom-3 left-3 text-xs text-muted-foreground">Interactive map preview · centered on your location</p>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search by name..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hospital">Hospitals</TabsTrigger>
            <TabsTrigger value="clinic">Clinics</TabsTrigger>
            <TabsTrigger value="pharmacy">Pharmacies</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((p) => {
          const Icon = ICONS[p.type];
          return (
            <Card key={p.name} className="shadow-card">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{p.address} · {p.distance}</p>
                  </div>
                </div>
                <Badge className={p.open ? "bg-success/15 text-success hover:bg-success/15" : "bg-muted"}>{p.open ? "Open" : "Closed"}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm">⭐ {p.rating}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild><a href={`tel:${p.phone}`}><Phone className="mr-1 h-3.5 w-3.5" /> Call</a></Button>
                  <Button size="sm" className="bg-gradient-primary"><Navigation className="mr-1 h-3.5 w-3.5" /> Directions</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
