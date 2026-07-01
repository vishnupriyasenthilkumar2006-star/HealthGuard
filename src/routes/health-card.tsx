import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Heart, Printer, Download, Share2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/health-card")({
  head: () => ({
    meta: [
      { title: "Digital Health Card — HealthGuard" },
      { name: "description", content: "Your printable digital health card with QR access to critical medical info." },
    ],
  }),
  component: HealthCardPage,
});

function HealthCardPage() {
  const { profile, medicines, caregivers } = useStore();
  const emergency = caregivers.find((c) => c.isEmergency) ?? caregivers[0];
  const currentMeds = medicines.map((m) => `${m.name} ${m.dosage}`).join("; ");

  const qrPayload = JSON.stringify({
    app: "HealthGuard",
    name: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    bloodGroup: profile.bloodGroup,
    allergies: profile.allergies,
    conditions: profile.conditions,
    emergency: emergency ? { name: emergency.name, phone: emergency.phone } : null,
    meds: medicines.slice(0, 8).map((m) => ({ n: m.name, d: m.dosage, t: m.times })),
    generatedAt: new Date().toISOString(),
  });

  const handlePrint = () => window.print();
  const handleShare = async () => {
    const text = `HealthGuard Health Card\n${profile.fullName} · ${profile.bloodGroup ?? "—"}\nAllergies: ${profile.allergies ?? "None"}\nConditions: ${profile.conditions ?? "None"}\nEmergency: ${emergency?.name ?? "—"} ${emergency?.phone ?? ""}`;
    if (navigator.share) {
      try { await navigator.share({ title: "HealthGuard Card", text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    toast.success("Health card copied to clipboard");
  };
  const handleDownload = () => {
    const svg = document.getElementById("hg-qr");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "healthguard-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Digital Health Card" subtitle="Scan the QR for instant access to critical medical info">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button onClick={handlePrint} variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button onClick={handleDownload} variant="outline"><Download className="mr-2 h-4 w-4" />Download QR</Button>
          <Button onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />Share</Button>
        </div>

        <Card className="overflow-hidden border-2 border-primary/20 shadow-elegant" id="hg-card">
          <div className="bg-gradient-primary p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
                  <Heart className="h-5 w-5" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-80">HealthGuard</p>
                  <p className="text-lg font-semibold">Digital Health Card</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                {profile.bloodGroup ?? "—"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Patient</p>
                <p className="text-xl font-semibold">{profile.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {[profile.age && `${profile.age} yrs`, profile.gender].filter(Boolean).join(" · ")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Blood group" value={profile.bloodGroup} />
                <Field label="Allergies" value={profile.allergies || "None reported"} />
                <Field label="Conditions" value={profile.conditions || "None reported"} />
                <Field label="Emergency contact" value={emergency ? `${emergency.name} · ${emergency.phone}` : "—"} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current medications</p>
                <p className="text-sm">{currentMeds || "None"}</p>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Card ID · HG-{(profile.email || "user").split("@")[0].toUpperCase()} · Generated {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30 p-4">
              <QRCodeSVG id="hg-qr" value={qrPayload} size={160} level="M" includeMargin />
              <p className="text-[10px] text-muted-foreground">Scan for medical info</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
