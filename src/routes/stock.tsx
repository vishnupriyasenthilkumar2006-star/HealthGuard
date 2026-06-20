import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Package, Pill, AlertTriangle, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/stock")({
  head: () => ({ meta: [{ title: "Stock — HealthGuard" }] }),
  component: StockPage,
});

function StockPage() {
  const { medicines, refillMedicine, updateMedicine } = useStore();

  const lowStock = medicines.filter((m) => (m.stock ?? 0) <= (m.lowStockThreshold ?? 5));

  return (
    <AppShell title="Stock">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Medicine stock tracker</h2>
        <p className="text-muted-foreground">Track remaining tablets and get refill reminders.</p>
      </div>

      {lowStock.length > 0 && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5 shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">{lowStock.length} medicine(s) running low</p>
              <p className="text-sm text-muted-foreground">Refill soon to avoid missed doses: {lowStock.map((m) => m.name).join(", ")}.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {medicines.map((m) => {
          const stock = m.stock ?? 0;
          const threshold = m.lowStockThreshold ?? 5;
          const max = Math.max(stock, threshold * 3, 30);
          const pct = Math.min(100, Math.round((stock / max) * 100));
          const isLow = stock <= threshold;
          const dailyDoses = m.times.length;
          const daysLeft = dailyDoses > 0 ? Math.floor(stock / dailyDoses) : 0;
          return (
            <Card key={m.id} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{m.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{m.dosage}</p>
                  </div>
                </div>
                {isLow ? <Badge variant="destructive">Low</Badge> : <Badge className="bg-success/15 text-success hover:bg-success/15">OK</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="mb-1 flex items-end justify-between">
                    <span className="text-2xl font-semibold">{stock}</span>
                    <span className="text-xs text-muted-foreground">≈ {daysLeft} days left</span>
                  </div>
                  <Progress value={pct} className={isLow ? "[&>div]:bg-destructive" : ""} />
                  <p className="mt-1 text-xs text-muted-foreground">Refill alert at {threshold} tablets</p>
                </div>
                <div className="flex gap-2">
                  <RefillButton id={m.id} onRefill={refillMedicine} />
                  <ThresholdDialog id={m.id} current={threshold} onSave={(v) => updateMedicine(m.id, { lowStockThreshold: v })} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {medicines.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No medicines yet. Add medicines first to track stock.
        </p>
      )}
    </AppShell>
  );
}

function RefillButton({ id, onRefill }: { id: string; onRefill: (id: string, amt: number) => void }) {
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState(30);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-gradient-primary"><Package className="mr-1 h-4 w-4" /> Refill</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Refill stock</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Tablets added</Label>
          <Input type="number" min={1} value={amt} onChange={(e) => setAmt(parseInt(e.target.value || "0"))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onRefill(id, amt); toast.success(`Added ${amt} tablets`); setOpen(false); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ThresholdDialog({ id, current, onSave }: { id: string; current: number; onSave: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(current);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="mr-1 h-4 w-4" /> Alert</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Low-stock threshold</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label>Notify me when stock falls below</Label>
          <Input type="number" min={0} value={v} onChange={(e) => setV(parseInt(e.target.value || "0"))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSave(v); toast.success("Threshold updated"); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
