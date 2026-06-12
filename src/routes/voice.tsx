import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/voice")({
  head: () => ({ meta: [{ title: "Voice Assistant — MediAlert" }] }),
  component: VoicePage,
});

const COMMANDS = [
  "Show today's medicines",
  "Have I taken my medicine?",
  "Open my prescriptions",
  "Open dashboard",
  "Open reminders",
  "Open calendar",
  "Open emergency",
  "Record that I drank water",
  "Mark exercise as completed",
  "Show my hydration progress",
  "How was my mood this week?",
  "Open wellness",
  "Snooze reminder for 10 minutes",
];

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(u);
}

function VoicePage() {
  const { medicines, logs, addWater } = useStore();
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Tap the mic and say a command. Examples are below.");
  const recRef = useRef<any>(null);

  const handle = (text: string) => {
    const q = text.toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    let r = "Sorry, I didn't catch that. Try one of the example commands.";
    if (q.includes("dashboard")) { r = "Opening dashboard"; navigate({ to: "/dashboard" }); }
    else if (q.includes("reminder")) { r = "Opening reminders"; navigate({ to: "/reminders" }); }
    else if (q.includes("calendar")) { r = "Opening calendar"; navigate({ to: "/calendar" }); }
    else if (q.includes("prescription")) { r = "Opening prescriptions"; navigate({ to: "/prescriptions" }); }
    else if (q.includes("emergency") || q.includes("sos")) { r = "Opening emergency"; navigate({ to: "/emergency" }); }
    else if (q.includes("today") && q.includes("medicine")) r = `You have ${medicines.length} medicines scheduled today: ${medicines.map((m) => m.name).join(", ")}.`;
    else if (q.includes("taken")) { const t = logs.filter((l) => l.date === today && l.status === "taken").length; r = `You have taken ${t} dose${t === 1 ? "" : "s"} today.`; }
    else if (q.includes("water")) { addWater(1); r = "Added one glass of water."; }
    else if (q.includes("snooze")) r = "Reminder snoozed for ten minutes.";
    setResponse(r); speak(r);
  };

  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice recognition not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setTranscript(t); handle(t); };
    rec.onerror = () => { setListening(false); toast.error("Voice error"); };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec; setListening(true);
  };
  const stop = () => { recRef.current?.stop(); setListening(false); };

  return (
    <AppShell title="Voice Assistant">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Hands-free voice assistant</h2>
        <p className="text-muted-foreground">Operate MediAlert with your voice — great for accessibility.</p>
      </div>
      <Card className="mb-6 shadow-card">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <button
            onClick={listening ? stop : start}
            className={`flex h-32 w-32 items-center justify-center rounded-full shadow-lg transition ${listening ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-gradient-primary text-primary-foreground"}`}
            aria-label={listening ? "Stop listening" : "Start listening"}
          >
            {listening ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
          </button>
          <p className="text-sm font-medium">{listening ? "Listening..." : "Tap to speak"}</p>
          {transcript && <p className="rounded-lg bg-muted px-3 py-2 text-sm">"{transcript}"</p>}
          <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
            <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{response}</span>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader><CardTitle>Example commands</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {COMMANDS.map((c) => (
              <button key={c} onClick={() => handle(c)} className="rounded-lg border bg-background p-3 text-left text-sm hover:bg-accent">"{c}"</button>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
