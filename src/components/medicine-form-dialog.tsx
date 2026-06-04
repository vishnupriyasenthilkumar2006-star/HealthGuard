import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, type Medicine } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  medicine?: Medicine | null;
};

const today = () => new Date().toISOString().slice(0, 10);

export function MedicineFormDialog({ open, onOpenChange, medicine }: Props) {
  const { addMedicine, updateMedicine } = useStore();
  const isEdit = !!medicine;

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(medicine?.name ?? "");
      setDosage(medicine?.dosage ?? "");
      setStartDate(medicine?.startDate ?? today());
      setEndDate(medicine?.endDate ?? today());
      setTimes(medicine?.times ?? ["08:00"]);
      setNotes(medicine?.notes ?? "");
    }
  }, [open, medicine]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || times.length === 0) {
      toast.error("Please fill the medicine name, dosage and at least one time.");
      return;
    }
    const payload = { name, dosage, startDate, endDate, times: times.filter(Boolean), notes };
    if (isEdit && medicine) {
      updateMedicine(medicine.id, payload);
      toast.success(`${name} updated.`);
    } else {
      addMedicine({ ...payload, color: "chart-1" });
      toast.success(`${name} added to your medicines.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit medicine" : "Add a medicine"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details for this prescription." : "Add a new prescription to your daily routine."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Medicine name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metformin" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500 mg" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reminder times</Label>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={t}
                    onChange={(e) => setTimes((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                    className="max-w-[160px]"
                  />
                  {times.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setTimes((a) => a.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setTimes((a) => [...a, "20:00"])}>
                <Plus className="mr-1 h-4 w-4" /> Add time
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Take with food" rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-primary">{isEdit ? "Save changes" : "Add medicine"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
