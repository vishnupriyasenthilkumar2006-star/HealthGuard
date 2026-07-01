import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, TrendingDown, HeartPulse, Moon, Droplets, Activity, Smile, Pill } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/health-risk")({
  head: () => ({ meta: [{ title: "Health Risk Prediction — HealthGuard" }] }),
  component: HealthRiskPage,
});

type RiskLevel = "low" | "moderate" | "high";
type Signal = { key: string; label: string; icon: any; score: number; level: RiskLevel; detail: string };

function HealthRiskPage() {
  const { logs, waterLogs, sleepLogs, exerciseLogs, moodLogs, medicines } = useStore();

  const signals = useMemo<Signal[]>(() => {
    const last7 = (arr: any[], key = "date") => {
      const cutoff = Date.now() - 7 * 86400000;
      return arr.filter((l) => new Date(l[key]).getTime() >= cutoff);
    };
    const recentDoses = last7(logs);
    const taken = recentDoses.filter((l) => l.status === "taken").length;
    const total = recentDoses.length || 1;
    const adherence = Math.round((taken / total) * 100);

    const water = last7(waterLogs);
    const avgWater = water.length ? water.reduce((s, w) => s + (w.glasses ?? 0), 0) / water.length : 0;

    const sleep = last7(sleepLogs);
    const avgSleep = sleep.length ? sleep.reduce((s, x) => s + (x.hours ?? 0), 0) / sleep.length : 0;

    const exercise = last7(exerciseLogs);
    const exerciseDays = new Set(exercise.map((e) => e.date)).size;

    const mood = last7(moodLogs);
    const avgMood = mood.length ? mood.reduce((s, m) => s + (m.rating ?? 3), 0) / mood.length : 3;

    const grade = (score: number): RiskLevel => (score >= 75 ? "low" : score >= 45 ? "moderate" : "high");

    return [
      { key: "adherence", label: "Medicine Adherence", icon: Pill, score: adherence, level: grade(adherence), detail: `${taken}/${total} doses taken this week` },
      { key: "water", label: "Hydration", icon: Droplets, score: Math.min(100, Math.round((avgWater / 8) * 100)), level: grade(Math.min(100, (avgWater / 8) * 100)), detail: `${avgWater.toFixed(1)} glasses/day avg` },
      { key: "sleep", label: "Sleep Quality", icon: Moon, score: Math.min(100, Math.round((avgSleep / 8) * 100)), level: grade(Math.min(100, (avgSleep / 8) * 100)), detail: `${avgSleep.toFixed(1)} hrs/night avg` },
      { key: "exercise", label: "Activity", icon: Activity, score: Math.min(100, Math.round((exerciseDays / 5) * 100)), level: grade(Math.min(100, (exerciseDays / 5) * 100)), detail: `${exerciseDays} active days this week` },
      { key: "mood", label: "Mental Wellbeing", icon: Smile, score: Math.round((avgMood / 5) * 100), level: grade((avgMood / 5) * 100), detail: `${avgMood.toFixed(1)}/5 mood avg` },
    ];
  }, [logs, waterLogs, sleepLogs, exerciseLogs, moodLogs]);

  const overall = Math.round(signals.reduce((s, x) => s + x.score, 0) / signals.length);
  const overallLevel: RiskLevel = overall >= 75 ? "low" : overall >= 45 ? "moderate" : "high";

  const alerts = signals.filter((s) => s.level !== "low");
  const suggestions: Record<string, string> = {
    adherence: "Enable smart alarms and caregiver alerts for critical medicines.",
    water: "Aim for 8 glasses/day. Set water reminders every 2 hours.",
    sleep: "Target 7–8 hrs. Try a consistent bedtime and reduce screens after 10pm.",
    exercise: "Add 30 min of walking on 5+ days per week.",
    mood: "Log mood daily. Consider a short breathing or mindfulness session.",
  };

  const levelBadge = (l: RiskLevel) => {
    const map = { low: "bg-success/15 text-success", moderate: "bg-warning/15 text-warning", high: "bg-destructive/15 text-destructive" } as const;
    return <Badge className={`${map[l]} border-0`}>{l.toUpperCase()}</Badge>;
  };

  return (
    <AppShell title="Health Risk Prediction">
      <div className="mx-auto max-w-5xl space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Wellness Score</p>
                <p className="text-3xl font-bold">{overall}<span className="text-lg text-muted-foreground">/100</span></p>
              </div>
            </div>
            {levelBadge(overallLevel)}
          </div>
          <Progress value={overall} className="mt-4 h-2" />
          <p className="mt-3 text-sm text-muted-foreground">
            {overallLevel === "low" && "Great job — your habits look healthy this week."}
            {overallLevel === "moderate" && "A few habits need attention. Review the suggestions below."}
            {overallLevel === "high" && "Multiple risk factors detected. Please review alerts and consider consulting a doctor."}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {signals.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.key} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                  </div>
                  {levelBadge(s.level)}
                </div>
                <Progress value={s.score} className="mt-3 h-1.5" />
              </Card>
            );
          })}
        </div>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-semibold">Personalized Alerts & Suggestions</h2>
          </div>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> No risk factors detected. Keep it up!
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.key} className="flex items-start gap-3 rounded-lg border p-3">
                  <TrendingDown className="mt-0.5 h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">{a.label} — {a.level}</p>
                    <p className="text-xs text-muted-foreground">{suggestions[a.key]}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] text-muted-foreground">
            This is a wellness heuristic, not a medical diagnosis. Consult a licensed doctor for medical advice.
          </p>
        </Card>

        {medicines.some((m) => m.critical) && (
          <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Critical medications detected</p>
            <p className="text-xs text-muted-foreground">Missed doses on critical medicines will notify emergency caregivers automatically.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
