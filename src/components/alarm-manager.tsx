import { useEffect, useRef, useState } from "react";
import { useStore, type AlarmSound, type Medicine } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Clock, Pill, AlertTriangle, BellOff } from "lucide-react";
import { toast } from "sonner";

type Pending = {
  medicine: Medicine;
  date: string;
  time: string;
  scheduledAt: Date;
  isCritical: boolean;
};

const SOUND_PROFILES: Record<AlarmSound, { freq: number[]; pattern: number; label: string }> = {
  chime: { freq: [880, 1108], pattern: 600, label: "Chime" },
  beep: { freq: [1000], pattern: 250, label: "Beep" },
  bell: { freq: [1568, 1175], pattern: 500, label: "Bell" },
  gentle: { freq: [523, 659], pattern: 900, label: "Gentle" },
  urgent: { freq: [1320, 880, 1320], pattern: 200, label: "Urgent" },
};

export const SOUND_OPTIONS = (Object.keys(SOUND_PROFILES) as AlarmSound[]).map((k) => ({
  value: k,
  label: SOUND_PROFILES[k].label,
}));

let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

export function playAlarmTone(sound: AlarmSound, volume: number) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const profile = SOUND_PROFILES[sound] ?? SOUND_PROFILES.chime;
  const now = ctx.currentTime;
  profile.freq.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const start = now + (i * profile.pattern) / 1000;
    const dur = profile.pattern / 1000;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(Math.min(1, Math.max(0, volume)), start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  });
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export function AlarmManager() {
  const { medicines, logs, alarmSettings, caregivers, setDoseStatus, snoozeDose, acknowledgeDose } = useStore();
  const [active, setActive] = useState<Pending | null>(null);
  const lastRepeatRef = useRef<number>(0);

  // Ask for browser notification permission once user enables it
  useEffect(() => {
    if (!alarmSettings.browserNotifications) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [alarmSettings.browserNotifications]);

  // Poll for due doses
  useEffect(() => {
    const check = () => {
      if (active) return;
      const now = new Date();
      const date = todayStr();
      const nowMs = now.getTime();
      const candidates: Pending[] = [];
      for (const m of medicines) {
        // skip if outside window
        if (m.startDate && date < m.startDate) continue;
        if (m.endDate && date > m.endDate) continue;
        for (const t of m.times) {
          const [h, mi] = t.split(":").map(Number);
          const scheduled = new Date();
          scheduled.setHours(h, mi, 0, 0);
          const log = logs.find((l) => l.medicineId === m.id && l.date === date && l.time === t);
          if (log?.status === "taken" || log?.status === "missed") continue;
          // snoozed?
          if (log?.snoozedUntil && new Date(log.snoozedUntil).getTime() > nowMs) continue;
          // due?
          if (scheduled.getTime() <= nowMs && nowMs - scheduled.getTime() < 12 * 60 * 60 * 1000) {
            candidates.push({ medicine: m, date, time: t, scheduledAt: scheduled, isCritical: !!m.critical });
          }
        }
      }
      if (candidates.length === 0) return;
      // pick most urgent: critical first, then oldest scheduled
      candidates.sort((a, b) => {
        if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
        return a.scheduledAt.getTime() - b.scheduledAt.getTime();
      });
      const pick = candidates[0];
      fire(pick);
    };

    const fire = (p: Pending) => {
      setActive(p);
      lastRepeatRef.current = Date.now();
      if (alarmSettings.soundEnabled) {
        playAlarmTone(p.medicine.alarmSound ?? alarmSettings.defaultSound, alarmSettings.volume);
      }
      if (alarmSettings.browserNotifications && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(`Time for ${p.medicine.name}`, {
            body: `${p.medicine.dosage} · scheduled at ${p.time}`,
            tag: `${p.medicine.id}-${p.date}-${p.time}`,
          });
        } catch {}
      }
      // Caregiver alert for critical meds
      if (p.isCritical && alarmSettings.notifyCaregivers) {
        const emergency = caregivers.find((c) => c.isEmergency) ?? caregivers[0];
        if (emergency) {
          toast.warning(`Caregiver alert sent to ${emergency.name}`, {
            description: `${p.medicine.name} is a critical medication.`,
          });
        }
      }
    };

    check();
    const id = setInterval(check, 15_000);
    return () => clearInterval(id);
  }, [medicines, logs, alarmSettings, caregivers, active]);

  // Repeat alarm while modal is open and unresponsive
  useEffect(() => {
    if (!active) return;
    if (!alarmSettings.soundEnabled) return;
    const repeatMs = Math.max(15, alarmSettings.repeatMinutes * 60) * 1000;
    const id = setInterval(() => {
      playAlarmTone(active.medicine.alarmSound ?? alarmSettings.defaultSound, alarmSettings.volume);
      lastRepeatRef.current = Date.now();
    }, repeatMs);
    return () => clearInterval(id);
  }, [active, alarmSettings]);

  if (!active) return null;

  const handleTaken = () => {
    setDoseStatus(active.medicine.id, active.date, active.time, "taken");
    toast.success(`${active.medicine.name} marked as taken`);
    setActive(null);
  };
  const handleSnooze = (mins: number) => {
    snoozeDose(active.medicine.id, active.date, active.time, mins);
    toast(`Snoozed for ${mins} min`);
    setActive(null);
  };
  const handleSkip = () => {
    setDoseStatus(active.medicine.id, active.date, active.time, "missed");
    acknowledgeDose(active.medicine.id, active.date, active.time);
    toast(`${active.medicine.name} marked as missed`);
    setActive(null);
  };

  const minutesLate = Math.max(0, Math.floor((Date.now() - active.scheduledAt.getTime()) / 60000));

  return (
    <Dialog
      open={!!active}
      onOpenChange={(o) => {
        if (!o) acknowledgeDose(active.medicine.id, active.date, active.time);
        // require explicit action; closing dismisses without marking
        setActive(null);
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className={`relative px-6 pt-6 pb-4 text-primary-foreground ${active.isCritical ? "bg-gradient-to-br from-destructive to-destructive/80" : "bg-gradient-primary"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur animate-pulse">
              {active.isCritical ? <AlertTriangle className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide opacity-90">
                {active.isCritical ? "Critical medication" : "Medicine reminder"}
              </p>
              <DialogTitle className="text-xl">Time for {active.medicine.name}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-3 text-primary-foreground/90">
            Please take your dose to stay on schedule.
          </DialogDescription>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<Pill className="h-4 w-4" />} label="Dosage" value={active.medicine.dosage} />
            <InfoTile icon={<Clock className="h-4 w-4" />} label="Scheduled" value={active.time} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary">{minutesLate === 0 ? "Now" : `${minutesLate} min late`}</Badge>
            {typeof active.medicine.stock === "number" && (
              <Badge variant="outline">{active.medicine.stock} left in stock</Badge>
            )}
            {active.medicine.critical && <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15">Critical</Badge>}
          </div>

          {active.medicine.notes && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes: </span>{active.medicine.notes}
            </p>
          )}

          <div className="space-y-2">
            <Button onClick={handleTaken} className="w-full bg-gradient-primary" size="lg">
              <CheckCircle2 className="mr-2 h-5 w-5" /> Medicine Taken
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => handleSnooze(5)}>Snooze 5m</Button>
              <Button variant="outline" onClick={() => handleSnooze(10)}>Snooze 10m</Button>
              <Button variant="outline" onClick={() => handleSnooze(15)}>Snooze 15m</Button>
            </div>
            <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
              <BellOff className="mr-2 h-4 w-4" /> Skip this dose
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 text-base font-semibold tracking-tight">{value}</p>
    </div>
  );
}
