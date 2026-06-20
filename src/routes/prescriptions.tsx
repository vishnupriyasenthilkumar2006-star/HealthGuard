import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Download, Trash2, Calendar } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions — HealthGuard" }] }),
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  const { prescriptions, addPrescription, deletePrescription } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const reset = () => { setTitle(""); setDoctor(""); setDate(new Date().toISOString().slice(0, 10)); setNotes(""); setFile(null); if (fileRef.current) fileRef.current.value = ""; };

  const handleUpload = async () => {
    if (!title || !doctor || !file) { toast.error("Please fill all required fields"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    addPrescription({ title, doctor, date, fileName: file.name, fileType: file.type, fileSize: file.size, dataUrl, notes });
    toast.success("Prescription uploaded");
    reset();
    setOpen(false);
  };

  const download = (p: typeof prescriptions[number]) => {
    if (!p.dataUrl) { toast.error("File not available"); return; }
    const a = document.createElement("a");
    a.href = p.dataUrl;
    a.download = p.fileName;
    a.click();
  };

  return (
    <AppShell title="Prescriptions">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prescriptions & records</h2>
          <p className="text-muted-foreground">Upload, store and access your medical documents securely.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary"><Upload className="mr-1 h-4 w-4" /> Upload prescription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload prescription</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title*</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diabetes follow-up" /></div>
              <div><Label>Doctor*</Label><Input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Name" /></div>
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label>File* (PDF, image — max 5MB)</Label><Input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {prescriptions.map((p) => (
          <Card key={p.id} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.doctor}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> {p.date}</p>
                </div>
              </div>
              {p.notes && <p className="mt-3 text-sm text-muted-foreground">{p.notes}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{p.fileName} · {(p.fileSize / 1024).toFixed(0)} KB</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => download(p)}><Download className="mr-1 h-4 w-4" /> Download</Button>
                <Button size="sm" variant="outline" onClick={() => { deletePrescription(p.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {prescriptions.length === 0 && (
          <p className="md:col-span-2 xl:col-span-3 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No prescriptions yet. Upload your first to keep records in one place.
          </p>
        )}
      </div>
    </AppShell>
  );
}
