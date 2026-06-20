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
import { Bell, Volume2, Play, Globe, Accessibility, Mic } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — HealthGuard" }] }),
  component: SettingsPage,
});

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "ml", label: "മലയാളം (Malayalam)" },
  { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
];

function SettingsPage() {
  const { alarmSettings, updateAlarmSettings, prefs, updatePrefs } = useStore();
  const s = alarmSettings;

  const test = () => { playAlarmTone(s.defaultSound, s.volume); toast.success("Test alarm played"); };
  const testVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) { toast.error("Voice not supported"); return; }
    const u = new SpeechSynthesisUtterance("This is a sample HealthGuard voice reminder.");
    window.speechSynthesis.speak(u);
  };

  return (
    <AppShell title="Settings">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">App & alarm settings</h2>
        <p className="text-muted-foreground">Customize reminders, language, accessibility and voice.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Alarm behavior</CardTitle>
            <CardDescription>Sound, notifications and repeat behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Row label="Play alarm sound" hint="Audible tone when a dose is due."><Switch checked={s.soundEnabled} onCheckedChange={(v) => updateAlarmSettings({ soundEnabled: v })} /></Row>
            <Row label="Browser notifications" hint="Show system notifications."><Switch checked={s.browserNotifications} onCheckedChange={(v) => updateAlarmSettings({ browserNotifications: v })} /></Row>
            <Row label="Notify caregivers" hint="Alert caregivers when critical doses are missed."><Switch checked={s.notifyCaregivers} onCheckedChange={(v) => updateAlarmSettings({ notifyCaregivers: v })} /></Row>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Volume2 className="h-4 w-4" /> Volume · {Math.round(s.volume * 100)}%</Label>
              <Slider value={[s.volume * 100]} max={100} step={5} onValueChange={(v) => updateAlarmSettings({ volume: v[0] / 100 })} />
            </div>
            <div className="space-y-2">
              <Label>Default alarm sound</Label>
              <div className="flex gap-2">
                <Select value={s.defaultSound} onValueChange={(v) => updateAlarmSettings({ defaultSound: v as any })}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{SOUND_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" onClick={test}><Play className="mr-1 h-4 w-4" /> Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Snooze & repeat</CardTitle><CardDescription>Control snooze duration and repeat reminders.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Default snooze duration</Label>
              <Select value={String(s.defaultSnoozeMinutes)} onValueChange={(v) => updateAlarmSettings({ defaultSnoozeMinutes: Number(v) as 5 | 10 | 15 })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="5">5 minutes</SelectItem><SelectItem value="10">10 minutes</SelectItem><SelectItem value="15">15 minutes</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Repeat unanswered alarm every · {s.repeatMinutes} min</Label>
              <Slider value={[s.repeatMinutes]} min={1} max={10} step={1} onValueChange={(v) => updateAlarmSettings({ repeatMinutes: v[0] })} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Language</CardTitle><CardDescription>Switch between supported languages.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>App language</Label>
              <Select value={prefs.language} onValueChange={(v) => { updatePrefs({ language: v as any }); toast.success("Language updated"); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">UI, notifications and voice reminders will use this language.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /> Accessibility</CardTitle><CardDescription>Elderly-friendly options.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <Row label="Elderly mode" hint="Larger text, bigger buttons, high contrast."><Switch checked={prefs.elderlyMode} onCheckedChange={(v) => { updatePrefs({ elderlyMode: v }); document.documentElement.classList.toggle("elderly-mode", v); }} /></Row>
            <Row label="Voice reminders" hint="Speak medicine alerts aloud."><Switch checked={prefs.voiceEnabled} onCheckedChange={(v) => updatePrefs({ voiceEnabled: v })} /></Row>
            <Button variant="outline" onClick={testVoice}><Mic className="mr-1 h-4 w-4" /> Test voice</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-sm font-medium">{label}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
      {children}
    </div>
  );
}
