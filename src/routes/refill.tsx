import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Truck, Pill, AlertTriangle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/refill")({
  head: () => ({ meta: [{ title: "Smart Refill — HealthGuard" }] }),
  component: RefillPage,
});

const PHARMACIES = ["Bayside Pharmacy", "24/7 MedMart", "Metro Drugs", "WellCare Pharmacy"];

const STATUS_COLOR: Record<string, string> = {
  requested: "bg-warning/15 text-warning",
  confirmed: "bg-primary/15 text-primary",
  ready: "bg-accent text-accent-foreground",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

function RefillPage() {
  const { medicines, refills, requestRefill, updateRefill, prefs, updatePrefs } = useStore();

  const enriched = medicines.map((m) => {
    const stock = m.stock ?? 0;
    const daily = m.times.length;
    const daysLeft = daily > 0 ? Math.floor(stock / daily) : 0;
    return { ...m, daysLeft, low: stock <= (m.lowStockThreshold ?? 5) };
  });

  const monthlyUsage = medicines.map((m) => ({ name: m.name, used: m.times.length * 30 }));

  return (
    <AppShell title="Smart Refill">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Truck className="h-6 w-6 text-primary" /> Smart Refill Ordering</h2>
          <p className="text-muted-foreground">Automatic stock monitoring with one-click refill requests.</p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <Label className="text-xs">Preferred pharmacy</Label>
            <Select value={prefs.preferredPharmacy} onValueChange={(v) => updatePrefs({ preferredPharmacy: v })}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>{PHARMACIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {enriched.map((m) => (
          <Card key={m.id} className={`shadow-card ${m.low ? "border-destructive/40" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-primary p-2 text-primary-foreground"><Pill className="h-5 w-5" /></div>
                <div><CardTitle className="text-base">{m.name}</CardTitle><p className="text-xs text-muted-foreground">{m.dosage}</p></div>
              </div>
              {m.low && <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Low</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md bg-muted/50 p-2"><p className="text-xs text-muted-foreground">Remaining</p><p className="text-xl font-bold">{m.stock ?? 0}</p></div>
                <div className="rounded-md bg-muted/50 p-2"><p className="text-xs text-muted-foreground">Days left</p><p className="text-xl font-bold">{m.daysLeft}</p></div>
              </div>
              {m.low && <p className="text-xs text-destructive">Stock running low. Estimated to last {m.daysLeft} more day{m.daysLeft === 1 ? "" : "s"}. Refill soon.</p>}
              <RefillRequestDialog medicineName={m.name} medicineId={m.id} defaultPharmacy={prefs.preferredPharmacy} onSubmit={requestRefill} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Refill history</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {refills.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No refill requests yet.</p>}
            {refills.map((r) => {
              const med = medicines.find((m) => m.id === r.medicineId);
              return (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{med?.name ?? "Medicine"} · {r.quantity} tablets</p>
                    <p className="text-xs text-muted-foreground">{r.pharmacy} · {new Date(r.requestedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLOR[r.status]}>{r.status}</Badge>
                    {r.status !== "delivered" && r.status !== "cancelled" && (
                      <Button size="sm" variant="outline" onClick={() => updateRefill(r.id, { status: r.status === "requested" ? "confirmed" : r.status === "confirmed" ? "ready" : "delivered" })}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Advance</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader><CardTitle>Monthly consumption (est.)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {monthlyUsage.map((u) => (
              <div key={u.name} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span>{u.name}</span>
                <span className="font-semibold">{u.used} tablets / month</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function RefillRequestDialog({ medicineId, medicineName, defaultPharmacy, onSubmit }: { medicineId: string; medicineName: string; defaultPharmacy: string; onSubmit: (r: any) => void }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(30);
  const [pharmacy, setPharmacy] = useState(defaultPharmacy);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary"><ShoppingCart className="mr-1 h-4 w-4" /> Request refill</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Request refill — {medicineName}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Quantity (tablets)</Label><Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || "0"))} /></div>
          <div><Label>Pharmacy</Label>
            <Select value={pharmacy} onValueChange={setPharmacy}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PHARMACIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSubmit({ medicineId, quantity, pharmacy }); toast.success("Refill request sent"); setOpen(false); }}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
