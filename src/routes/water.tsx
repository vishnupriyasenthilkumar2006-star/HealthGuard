import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Plus, Minus, Target } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/water")({
  head: () => ({ meta: [{ title: "Water Tracker — MediAlert" }] }),
  component: WaterPage,
});

function WaterPage() {
  const { waterLogs, prefs, addWater, setWater, updatePrefs } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = waterLogs.find((w) => w.date === today)?.glasses ?? 0;
  const pct = Math.min(100, Math.round((todayLog / prefs.waterGoal) * 100));
  const chartData = [...waterLogs].slice(-7).map((w) => ({ day: new Date(w.date).toLocaleDateString(undefined, { weekday: "short" }), glasses: w.glasses }));

  return (
    <AppShell title="Water Tracker">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Daily hydration</h2>
        <p className="text-muted-foreground">Stay hydrated — track your glasses of water today.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /> Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-5xl font-bold">{todayLog}<span className="text-base font-medium text-muted-foreground"> / {prefs.waterGoal} glasses</span></div>
            <Progress value={pct} />
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="icon" onClick={() => addWater(-1)} disabled={todayLog === 0}><Minus className="h-4 w-4" /></Button>
              <Button className="bg-gradient-primary" onClick={() => { addWater(1); if (todayLog + 1 === prefs.waterGoal) toast.success("Goal reached! 🎉"); }}><Plus className="mr-1 h-4 w-4" /> Add glass</Button>
            </div>
            <div className="grid grid-cols-8 gap-1.5 pt-2">
              {Array.from({ length: prefs.waterGoal }).map((_, i) => (
                <button key={i} onClick={() => setWater(i + 1)} className={`h-10 rounded-md border transition ${i < todayLog ? "border-primary bg-primary/15" : "border-dashed"}`} aria-label={`Set to ${i + 1}`}>
                  <Droplets className={`mx-auto h-5 w-5 ${i < todayLog ? "text-primary" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="glasses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <Label className="flex items-center gap-2"><Target className="h-4 w-4" /> Daily goal (glasses)</Label>
                <Input type="number" min={1} max={20} value={prefs.waterGoal} onChange={(e) => updatePrefs({ waterGoal: parseInt(e.target.value || "8") })} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
