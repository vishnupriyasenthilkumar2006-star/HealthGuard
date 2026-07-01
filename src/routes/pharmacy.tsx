import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Phone, IndianRupee, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/pharmacy")({
  head: () => ({ meta: [{ title: "Medicine Availability — HealthGuard" }] }),
  component: PharmacyPage,
});

type Pharmacy = { name: string; distance: string; phone: string; open: boolean };
type Listing = { pharmacy: Pharmacy; price: number; inStock: boolean };

const pharmacies: Pharmacy[] = [
  { name: "Jan Aushadhi Kendra — Nabha", distance: "0.8 km", phone: "+91 175 220 1122", open: true },
  { name: "Apollo Pharmacy", distance: "1.4 km", phone: "+91 175 222 3344", open: true },
  { name: "MedPlus Bhadson Road", distance: "2.1 km", phone: "+91 175 225 5566", open: true },
  { name: "City Care Chemist", distance: "3.0 km", phone: "+91 175 227 7788", open: false },
  { name: "Rural Health Pharmacy", distance: "4.6 km", phone: "+91 175 229 9900", open: true },
];

const commonMeds = ["Paracetamol 500mg", "Metformin 500mg", "Amlodipine 5mg", "Atorvastatin 10mg", "Amoxicillin 250mg", "Insulin Glargine"];

function PharmacyPage() {
  const [query, setQuery] = useState("Paracetamol 500mg");

  const listings = useMemo<Listing[]>(() => {
    // deterministic pseudo-random
    let seed = query.length;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    return pharmacies.map((p) => ({
      pharmacy: p,
      price: Math.round((15 + rand() * 60) * 100) / 100,
      inStock: p.open && rand() > 0.2,
    })).sort((a, b) => a.price - b.price);
  }, [query]);

  const cheapest = listings.find((l) => l.inStock);

  return (
    <AppShell title="Medicine Availability">
      <div className="mx-auto max-w-4xl space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine…" className="pl-9" />
            </div>
            <Button>Search</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {commonMeds.map((m) => (
              <button
                key={m}
                onClick={() => setQuery(m)}
                className="rounded-full border px-2.5 py-1 text-xs hover:bg-accent"
              >{m}</button>
            ))}
          </div>
        </Card>

        {cheapest && (
          <Card className="border-success/30 bg-success/5 p-4">
            <p className="text-xs uppercase tracking-wider text-success">Best price nearby</p>
            <p className="font-semibold">{cheapest.pharmacy.name} · ₹{cheapest.price.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{cheapest.pharmacy.distance} · {cheapest.pharmacy.phone}</p>
          </Card>
        )}

        <div className="space-y-2">
          {listings.map((l) => (
            <Card key={l.pharmacy.name} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{l.pharmacy.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{l.pharmacy.distance}</span>
                    <a href={`tel:${l.pharmacy.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{l.pharmacy.phone}</a>
                    <Badge variant={l.pharmacy.open ? "secondary" : "outline"}>{l.pharmacy.open ? "Open now" : "Closed"}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="flex items-center justify-end text-lg font-semibold"><IndianRupee className="h-4 w-4" />{l.price.toFixed(2)}</p>
                    {l.inStock ? (
                      <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" />In stock</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" />Out of stock</span>
                    )}
                  </div>
                  <Button size="sm" disabled={!l.inStock}>Reserve</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Prices are prototype estimates for demonstration. Confirm availability by phone before visiting.
        </p>
      </div>
    </AppShell>
  );
}
