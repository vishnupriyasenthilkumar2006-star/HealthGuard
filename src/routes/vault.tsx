import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore, type VaultCategory } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, FlaskConical, Scan, Syringe, Folder, Plus, Trash2, Download, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Medical Records Vault — HealthGuard" }] }),
  component: VaultPage,
});

const CATEGORIES: { key: VaultCategory | "all"; label: string; icon: any }[] = [
  { key: "all", label: "All", icon: Folder },
  { key: "prescription", label: "Prescriptions", icon: FileText },
  { key: "lab", label: "Lab Reports", icon: FlaskConical },
  { key: "scan", label: "Scans", icon: Scan },
  { key: "vaccination", label: "Vaccinations", icon: Syringe },
  { key: "other", label: "Other", icon: Folder },
];

function VaultPage() {
  const { vault, addVault, deleteVault } = useStore();
  const [filter, setFilter] = useState<VaultCategory | "all">("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VaultCategory>("lab");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);

  const items = filter === "all" ? vault : vault.filter((v) => v.category === filter);

  const handleSave = async () => {
    if (!title) return toast.error("Add a title");
    let dataUrl = "";
    let fileName = "manual-entry";
    let fileType = "";
    let fileSize = 0;
    if (file) {
      dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file); });
      fileName = file.name; fileType = file.type; fileSize = file.size;
    }
    addVault({ title, category, date, fileName, fileType, fileSize, dataUrl });
    setTitle(""); setFile(null); setOpen(false);
    toast.success("Record saved securely");
  };

  return (
    <AppShell title="Medical Vault">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Lock className="h-6 w-6 text-primary" /> Medical Records Vault</h2>
          <p className="text-muted-foreground">Securely store prescriptions, lab reports, scans, and vaccination records.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="mr-1 h-4 w-4" /> Add record</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add medical record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blood test - Lipid panel" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as VaultCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.filter((c) => c.key !== "all").map((c) => <SelectItem key={c.key} value={c.key as string}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              </div>
              <div><Label>File (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
        <TabsList className="flex flex-wrap">
          {CATEGORIES.map((c) => <TabsTrigger key={c.key} value={c.key as string}>{c.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && <p className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No records in this category.</p>}
        {items.map((v) => {
          const meta = CATEGORIES.find((c) => c.key === v.category)!;
          const Icon = meta.icon;
          return (
            <Card key={v.id} className="shadow-card">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-base">{v.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{v.date}</p>
                  </div>
                </div>
                <Badge variant="outline">{meta.label}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <p className="truncate text-xs text-muted-foreground">{v.fileName}</p>
                <div className="flex gap-1">
                  {v.dataUrl && <Button size="icon" variant="ghost" asChild><a href={v.dataUrl} download={v.fileName}><Download className="h-4 w-4" /></a></Button>}
                  <Button size="icon" variant="ghost" onClick={() => deleteVault(v.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
