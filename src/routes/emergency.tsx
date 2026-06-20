import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Phone, AlertTriangle, Heart, Droplet, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/emergency")({
  head: () => ({ meta: [{ title: "Emergency — HealthGuard" }] }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { caregivers, profile } = useStore();
  const emergencyContacts = caregivers.filter((c) => c.isEmergency);

  const callSOS = () => {
    toast.success("Emergency alert sent to all caregivers", {
      description: "Your location and health summary have been shared.",
    });
  };

  return (
    <AppShell title="Emergency">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Emergency support</h2>
        <p className="text-muted-foreground">Quick access to critical information and contacts.</p>
      </div>

      <Card className="mb-6 overflow-hidden border-destructive/40 bg-gradient-to-br from-destructive/10 to-destructive/5 shadow-card">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg">
            <LifeBuoy className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold">In an emergency?</h3>
            <p className="text-sm text-muted-foreground">Send your location and health profile to all emergency contacts instantly.</p>
          </div>
          <Button size="lg" variant="destructive" className="h-14 px-10 text-base" onClick={callSOS}>
            <AlertTriangle className="mr-2 h-5 w-5" /> Send SOS alert
          </Button>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <a href="tel:911" className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 font-medium hover:bg-accent"><Phone className="h-3.5 w-3.5" /> Call 911</a>
            {profile.emergencyPhone && (
              <a href={`tel:${profile.emergencyPhone}`} className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 font-medium hover:bg-accent"><Phone className="h-3.5 w-3.5" /> {profile.emergencyPhone}</a>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Critical health info</CardTitle>
            <p className="text-sm text-muted-foreground">Visible to first responders</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={User} label="Name" value={profile.fullName} />
            <InfoRow icon={Heart} label="Age / Gender" value={`${profile.age ?? "—"} · ${profile.gender ?? "—"}`} />
            <InfoRow icon={Droplet} label="Blood group" value={profile.bloodGroup ?? "Not set"} />
            <InfoRow icon={ShieldAlert} label="Allergies" value={profile.allergies || "None recorded"} />
            <InfoRow icon={Heart} label="Conditions" value={profile.conditions || "None recorded"} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Emergency contacts</CardTitle>
            <p className="text-sm text-muted-foreground">Marked as emergency in caregivers</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {emergencyContacts.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No emergency contacts yet. Mark a caregiver as emergency.
              </p>
            )}
            {emergencyContacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.relation} · {c.phone}</p>
                </div>
                <Button size="sm" asChild><a href={`tel:${c.phone}`}><Phone className="mr-1 h-4 w-4" /> Call</a></Button>
              </div>
            ))}
            {caregivers.filter((c) => !c.isEmergency).map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3 opacity-80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.relation} · {c.phone}</p>
                </div>
                <Button size="sm" variant="outline" asChild><a href={`tel:${c.phone}`}><Phone className="mr-1 h-4 w-4" /> Call</a></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
