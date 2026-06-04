import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore, type Medicine } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Plus, Pencil, Trash2, Clock, Calendar, Search } from "lucide-react";
import { MedicineFormDialog } from "@/components/medicine-form-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/medicines")({
  head: () => ({ meta: [{ title: "Medicines — MediAlert" }] }),
  component: MedicinesPage,
});

function MedicinesPage() {
  const { medicines, deleteMedicine } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [confirmDel, setConfirmDel] = useState<Medicine | null>(null);
  const [q, setQ] = useState("");

  const filtered = medicines.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="Medicines">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your medicines</h2>
          <p className="text-muted-foreground">Manage your prescriptions and schedules.</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Add medicine
        </Button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Pill className="h-6 w-6" /></div>
            <p className="font-medium">No medicines yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">Add your first prescription to start receiving reminders and tracking adherence.</p>
            <Button className="bg-gradient-primary" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" /> Add medicine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="shadow-card transition-shadow hover:shadow-elevated">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.dosage}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDel(m)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {m.times.join(" · ")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> {m.startDate} → {m.endDate}
                  </div>
                  {m.notes && <p className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">{m.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MedicineFormDialog open={open} onOpenChange={setOpen} medicine={editing} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the medicine and its history. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDel) {
                  deleteMedicine(confirmDel.id);
                  toast.success(`${confirmDel.name} deleted.`);
                  setConfirmDel(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
