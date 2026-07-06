import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, AlertTriangle, Sparkles, History as HistoryIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeSymptoms } from "@/lib/api/symptom-checker.functions";

export const Route = createFileRoute("/symptom-checker")({
  head: () => ({ meta: [{ title: "AI Symptom Checker — HealthGuard" }] }),
  component: SymptomCheckerPage,
});

type Analysis = Awaited<ReturnType<typeof analyzeSymptoms>>;

type HistoryRow = {
  id: string;
  symptoms: string;
  analysis: Analysis | null;
  severity: string | null;
  created_at: string;
};

function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const analyze = useServerFn(analyzeSymptoms);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("symptom_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory((data ?? []) as HistoryRow[]);
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const onCheck = async () => {
    if (symptoms.trim().length < 3) {
      toast.error("Please describe your symptoms in a bit more detail.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyze({ data: { symptoms: symptoms.trim() } });
      setResult(analysis);
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (uid) {
        await supabase.from("symptom_history").insert({
          user_id: uid,
          symptoms: symptoms.trim(),
          analysis: analysis as never,
          severity: analysis.severity ?? null,
        });
        await loadHistory();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.includes("429")) toast.error("Rate limit hit. Please try again in a moment.");
      else if (msg.includes("402")) toast.error("AI credits exhausted. Please contact the administrator.");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeHistory = async (id: string) => {
    await supabase.from("symptom_history").delete().eq("id", id);
    setHistory((h) => h.filter((x) => x.id !== id));
  };

  return (
    <AppShell title="AI Symptom Checker">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" /> AI Symptom Checker
        </h2>
        <p className="text-muted-foreground">Describe how you feel and get an AI-guided overview. Not a medical diagnosis.</p>
      </div>

      <Card className="mb-6 border-warning/40 bg-warning/5">
        <CardContent className="flex items-start gap-3 py-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            This tool provides general information only and is <strong>not a medical diagnosis</strong>. Always consult a licensed doctor for medical advice, especially in emergencies.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Describe your symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g. Fever for 2 days, sore throat, mild headache..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <Button onClick={onCheck} disabled={loading} className="bg-gradient-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Analyzing…" : "Check symptoms"}
            </Button>

            {result && (
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Assessed severity:</span>
                  <Badge variant={result.severity === "high" ? "destructive" : result.severity === "moderate" ? "default" : "secondary"}>
                    {result.severity ?? "unknown"}
                  </Badge>
                </div>
                {result.conditions?.length ? (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Possible conditions</p>
                    <div className="space-y-2">
                      {result.conditions.map((c, i) => (
                        <div key={i} className="rounded-md border bg-background p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{c.name}</p>
                            <Badge variant="outline">{c.likelihood}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {result.advice?.length ? (
                  <div>
                    <p className="mb-1 text-sm font-semibold">Suggested next steps</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {result.advice.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                ) : null}
                {result.redFlags?.length ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                    <p className="mb-1 text-sm font-semibold text-destructive">Seek urgent care if you notice:</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {result.redFlags.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                ) : null}
                {result.specialist && (
                  <p className="text-sm"><span className="font-semibold">Recommended specialist:</span> {result.specialist}</p>
                )}
                <p className="text-xs text-muted-foreground">Please consult a doctor — this is not a diagnosis.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HistoryIcon className="h-4 w-4" /> Recent checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.length === 0 && <p className="text-sm text-muted-foreground">No symptom checks yet.</p>}
            {history.map((h) => (
              <div key={h.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.symptoms}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {h.severity && <Badge variant="outline" className="capitalize">{h.severity}</Badge>}
                    <Button size="icon" variant="ghost" onClick={() => removeHistory(h.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
