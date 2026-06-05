import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { playAlarmTone, SOUND_OPTIONS } from "@/components/alarm-manager";
import { Bell, Volume2, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Alarm Settings — MediAlert" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { alarmSettings, updateAlarmSettings } = useStore();
  const s = alarmSettings;

  const test = () => {
    playAlarmTone(s.defaultSound, s.volume);
    toast.success("Test alarm played");
  };

  return (
    <AppShell title="Settings">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Smart alarm settings</h2>
        <p className="text-muted-foreground">Customize how MediAlert reminds you to take your medicines.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Alarm behavior</CardTitle>
            <CardDescription>Sound, notifications and repeat behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Row label="Play alarm sound" hint="Audible tone when a dose is due.">
              <Switch checked={s.soundEnabled} onCheckedChange={(v) => updateAlarmSettings({ soundEnabled: v })} />
            </Row>
            <Row label="Browser notifications" hint="Show system notifications.">
              <Switch checked={s.browserNotifications} onCheckedChange={(v) => updateAlarmSettings({ browserNotifications: v })} />
            </Row>
            <Row label="Notify caregivers" hint="Alert caregivers when critical doses are missed.">
              <Switch checked={s.notifyCaregivers} onCheckedChange={(v) => updateAlarmSettings({ notifyCaregivers: v })} />
            </Row>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Volume2 className="h-4 w-4" /> Volume · {Math.round(s.volume * 100)}%</Label>
              <Slider value={[s.volume * 100]} max={100} step={5} onValueChange={(v) => updateAlarmSettings({ volume: v[0] / 100 })} />
            </div>

            <div className="space-y-2">
              <Label>Default alarm sound</Label>
              <div className="flex gap-2">
                <Select value={s.defaultSound} onValueChange={(v) => updateAlarmSettings({ defaultSound: v as any })}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOUND_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={test}><Play className="mr-1 h-4 w-4" /> Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Snooze & repeat</CardTitle>
            <CardDescription>Control snooze duration and repeat reminders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Default snooze duration</Label>
              <Select value={String(s.defaultSnoozeMinutes)} onValueChange={(v) => updateAlarmSettings({ defaultSnoozeMinutes: Number(v) as 5 | 10 | 15 })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Repeat unanswered alarm every · {s.repeatMinutes} min</Label>
              <Slider value={[s.repeatMinutes]} min={1} max={10} step={1} onValueChange={(v) => updateAlarmSettings({ repeatMinutes: v[0] })} />
              <p className="text-xs text-muted-foreground">If you don't respond, the alarm tone replays at this interval.</p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <p className="font-medium">How smart reminders work</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                <li>An alarm fires at the scheduled time with sound + notification.</li>
                <li>Choose Medicine Taken or Snooze (5 / 10 / 15 min).</li>
                <li>Unanswered alarms repeat every {s.repeatMinutes} minute(s).</li>
                <li>Critical medicines alert your emergency caregiver.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
