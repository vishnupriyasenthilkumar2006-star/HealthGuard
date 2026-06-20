import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Footprints, Plus, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/exercise")({
  head: () => ({ meta: [{ title: "Exercise Tracker — HealthGuard" }] }),
  component: ExercisePage,
});

const TYPES = ["Walk", "Run", "Yoga", "Cycling", "Strength", "Swim", "Other"];

function ExercisePage() {
  const { exerciseLogs, addExercise, deleteExercise, prefs, updatePrefs } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todays = exerciseLogs.filter((e) => e.date === today);
  const todayMinutes = todays.reduce((a, e) => a + e.minutes, 0);
  const todaySteps = todays.reduce((a, e) => a + (e.steps ?? 0), 0);
  const stepPct = Math.min(100, Math.round((todaySteps / prefs.stepGoal) * 100));

  const [type, setType] = useState("Walk");
  const [minutes, setMinutes] = useState(30);
  const [steps, setSteps] = useState(0);

  const save = () => {
    addExercise({ date: today, type, minutes, steps: steps || undefined });
    toast.success("Activity logged");
    setMinutes(30); setSteps(0);
  };

  return (
    <AppShell title="Exercise Tracker">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Activity & exercise</h2>
        <p className="text-muted-foreground">Stay active to support your health.</p>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="shadow-card"><CardContent className="flex items-center gap-3 p-5"><div className="rounded-lg bg-primary/10 p-3"><Activity className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Today's minutes</p><p className="text-2xl font-bold">{todayMinutes}</p></div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="flex items-center gap-3 p-5"><div className="rounded-lg bg-primary/10 p-3"><Footprints className="h-5 w-5 text-primary" /></div><div className="flex-1"><p className="text-xs text-muted-foreground">Steps · goal {prefs.stepGoal}</p><p className="text-2xl font-bold">{todaySteps}</p><Progress value={stepPct} className="mt-1 h-1.5" /></div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="flex items-center gap-3 p-5"><div className="rounded-lg bg-primary/10 p-3"><Target className="h-5 w-5 text-primary" /></div><div className="flex-1"><Label className="text-xs">Daily step goal</Label><Input type="number" value={prefs.stepGoal} onChange={(e) => updatePrefs({ stepGoal: parseInt(e.target.value || "6000") })} /></div></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle>Log activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Type</Label>
              <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Minutes</Label><Input type="number" min={1} value={minutes} onChange={(e) => setMinutes(parseInt(e.target.value || "0"))} /></div>
              <div><Label>Steps</Label><Input type="number" min={0} value={steps} onChange={(e) => setSteps(parseInt(e.target.value || "0"))} /></div>
            </div>
            <Button className="w-full bg-gradient-primary" onClick={save}><Plus className="mr-1 h-4 w-4" /> Add activity</Button>
          </CardContent>
        </Card>
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>Recent activities</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {exerciseLogs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No activities yet.</p>}
            {exerciseLogs.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2"><Activity className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="font-medium">{e.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()} · {e.minutes} min{e.steps ? ` · ${e.steps} steps` : ""}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteExercise(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
