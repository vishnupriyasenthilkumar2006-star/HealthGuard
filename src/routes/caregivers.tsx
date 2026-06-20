import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Phone, Mail, Trash2, ShieldAlert, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/caregivers")({
  head: () => ({ meta: [{ title: "Caregivers — HealthGuard" }] }),
  component: CaregiversPage,
});

function CaregiversPage() {
  const { caregivers, addCaregiver, deleteCaregiver } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", phone: "", email: "", isEmergency: false });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Name and phone are required.");
    addCaregiver(form);
    toast.success(`${form.name} added.`);
    setForm({ name: "", relation: "", phone: "", email: "", isEmergency: false });
    setOpen(false);
  };

  return (
    <AppShell title="Caregivers">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Caregivers & emergency contacts</h2>
          <p className="text-muted-foreground">Keep your loved ones and doctors close at hand.</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => setOpen(true)}><UserPlus className="mr-1 h-4 w-4" /> Add caregiver</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {caregivers.map((c) => (
          <Card key={c.id} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
                  {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.relation}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => { deleteCaregiver(c.id); toast.success("Removed"); }} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Phone className="h-4 w-4" /> {c.phone}
                </a>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Mail className="h-4 w-4" /> {c.email}
                  </a>
                )}
                {c.isEmergency && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                    <ShieldAlert className="h-3 w-3" /> Emergency contact
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card/50 p-6 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Add new caregiver</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add caregiver</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="relation">Relation</Label>
                <Input id="relation" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="e.g. Daughter, Doctor" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isEmergency} onCheckedChange={(v) => setForm({ ...form, isEmergency: !!v })} />
              Mark as emergency contact
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-primary">Add caregiver</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
