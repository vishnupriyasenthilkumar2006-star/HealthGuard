import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Health Assistant — MediAlert" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "What medicines do I take today?",
  "Have I taken my morning dose?",
  "What is my next appointment?",
  "Tell me about Metformin side effects",
  "How can I improve adherence?",
];

function reply(input: string, ctx: { meds: string; nextAppt: string; takenToday: number; missed: number }): string {
  const q = input.toLowerCase();
  if (q.includes("today") && q.includes("medicine")) return `Today you have the following scheduled: ${ctx.meds}. You've already taken ${ctx.takenToday} dose(s).`;
  if (q.includes("morning") || q.includes("taken")) return `So far today you have taken ${ctx.takenToday} dose(s). Missed: ${ctx.missed}. Tap Reminders to mark recent doses.`;
  if (q.includes("appointment")) return `Your next appointment: ${ctx.nextAppt}.`;
  if (q.includes("metformin")) return "Metformin is generally well tolerated. Common side effects include mild GI discomfort. Take it with meals to reduce nausea. Always follow your doctor's guidance.";
  if (q.includes("paracetamol") || q.includes("acetaminophen")) return "Paracetamol (acetaminophen) relieves pain and fever. Adult max is typically 4 g/day. Avoid alcohol while using it.";
  if (q.includes("adherence") || q.includes("improve")) return "Tips to improve adherence: set consistent reminder times, link doses to meals, keep medicines visible, enable alarm + caregiver alerts, and review your weekly adherence chart.";
  if (q.includes("water") || q.includes("hydrate")) return "Aim for around 8 glasses (≈2L) per day. Track your intake on the Water page.";
  if (q.includes("sleep")) return "Adults usually need 7–9 hours. Log your sleep in the Sleep Tracker to spot trends.";
  if (q.includes("emergency") || q.includes("sos")) return "For emergencies, open the SOS page — it shares your blood group, allergies, and contacts your emergency caregiver.";
  if (q.includes("hello") || q.includes("hi ") || q === "hi") return "Hello! I can help with your medicines, schedule, and basic health questions. Try one of the suggestions below.";
  return "I can help with your medicines, schedule, appointments, water/sleep tracking, and general medication info. Try one of the suggested questions.";
}

function AssistantPage() {
  const { medicines, logs, appointments } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const meds = medicines.map((m) => `${m.name} ${m.dosage} (${m.times.join(", ")})`).join("; ") || "no medicines scheduled";
  const takenToday = logs.filter((l) => l.date === today && l.status === "taken").length;
  const missed = logs.filter((l) => l.date === today && l.status === "missed").length;
  const next = appointments.filter((a) => a.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextAppt = next ? `${next.doctor} (${next.specialty}) on ${next.date} at ${next.time}` : "none scheduled";

  const [messages, setMessages] = useState<Msg[]>([{ role: "bot", text: "Hi! I'm your MediAlert health assistant. Ask me about your medicines, schedule, or general wellness." }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      const r = reply(text, { meds, nextAppt, takenToday, missed });
      setMessages((m) => [...m, { role: "bot", text: r }]);
    }, 350);
  };

  return (
    <AppShell title="AI Assistant">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> AI Health Assistant</h2>
        <p className="text-muted-foreground">Ask about your medicines, schedule, and general health questions.</p>
      </div>
      <Card className="shadow-card">
        <CardContent className="flex h-[60vh] flex-col p-0">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-4 w-4 text-primary" /></div>}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</div>
                {m.role === "user" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"><User className="h-4 w-4" /></div>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="border-t p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-accent">{s}</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <Input placeholder="Ask a question..." value={input} onChange={(e) => setInput(e.target.value)} />
              <Button type="submit" className="bg-gradient-primary"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
