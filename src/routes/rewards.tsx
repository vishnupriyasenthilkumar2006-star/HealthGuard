import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Award, Target, Droplets } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards — MediAlert" }] }),
  component: RewardsPage,
});

const ALL_BADGES = [
  { name: "First Dose", icon: Star, desc: "Marked your first medicine taken" },
  { name: "3-Day Streak", icon: Flame, desc: "3 days of perfect adherence" },
  { name: "7-Day Streak", icon: Flame, desc: "A full week on schedule" },
  { name: "Hydration Hero", icon: Droplets, desc: "Hit your water goal" },
  { name: "Early Bird", icon: Award, desc: "Took morning dose on time" },
  { name: "Sharpshooter", icon: Target, desc: "Zero missed in a week" },
];

function RewardsPage() {
  const { rewards, logs } = useStore();
  const total = logs.length || 1;
  const taken = logs.filter((l) => l.status === "taken").length;
  const adherence = Math.round((taken / total) * 100);
  const nextLevel = Math.ceil(rewards.points / 500) * 500;

  return (
    <AppShell title="Rewards">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><Trophy className="h-6 w-6 text-warning" /> Rewards & Streaks</h2>
        <p className="text-muted-foreground">Stay consistent and earn points and achievement badges.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="shadow-card"><CardContent className="p-5 text-center"><Trophy className="mx-auto mb-2 h-7 w-7 text-warning" /><p className="text-3xl font-bold">{rewards.points}</p><p className="text-xs text-muted-foreground">Total points</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-5 text-center"><Flame className="mx-auto mb-2 h-7 w-7 text-destructive" /><p className="text-3xl font-bold">{rewards.streak}</p><p className="text-xs text-muted-foreground">Day streak</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-5 text-center"><Award className="mx-auto mb-2 h-7 w-7 text-primary" /><p className="text-3xl font-bold">{rewards.badges.length}</p><p className="text-xs text-muted-foreground">Badges earned</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-5 text-center"><Target className="mx-auto mb-2 h-7 w-7 text-success" /><p className="text-3xl font-bold">{adherence}%</p><p className="text-xs text-muted-foreground">Adherence score</p></CardContent></Card>
      </div>

      <Card className="mb-6 shadow-card">
        <CardHeader><CardTitle>Progress to next level</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{rewards.points} / {nextLevel} pts</span><span className="text-muted-foreground">{nextLevel - rewards.points} pts to go</span></div>
          <Progress value={(rewards.points / nextLevel) * 100} />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle>Achievement badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_BADGES.map((b) => {
              const earned = rewards.badges.includes(b.name);
              const Icon = b.icon;
              return (
                <div key={b.name} className={`flex items-center gap-3 rounded-lg border p-3 ${earned ? "bg-primary/5 border-primary/30" : "opacity-60"}`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${earned ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Icon className="h-6 w-6" /></div>
                  <div><p className="font-semibold">{b.name}</p><p className="text-xs text-muted-foreground">{b.desc}</p></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
