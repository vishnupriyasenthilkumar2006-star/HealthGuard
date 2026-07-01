import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Syringe, Tent, Megaphone, ExternalLink, Calendar, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [{ title: "Government Healthcare — HealthGuard" }] }),
  component: SchemesPage,
});

const schemes = [
  { name: "Ayushman Bharat PM-JAY", desc: "Health cover up to ₹5 lakh per family/year for secondary and tertiary hospitalization.", tag: "Central", url: "https://pmjay.gov.in" },
  { name: "Punjab Sarbat Sehat Bima Yojana", desc: "Cashless treatment up to ₹5 lakh at empanelled hospitals across Punjab.", tag: "Punjab", url: "https://shapunjab.in" },
  { name: "Janani Suraksha Yojana", desc: "Cash assistance for institutional delivery for rural pregnant women.", tag: "Maternal", url: "https://nhm.gov.in" },
  { name: "PM National Dialysis Programme", desc: "Free dialysis services for BPL patients at district hospitals.", tag: "Chronic", url: "https://nhm.gov.in" },
  { name: "Rashtriya Bal Swasthya Karyakram", desc: "Free health screening and early intervention for children 0–18.", tag: "Child", url: "https://rbsk.gov.in" },
];

const camps = [
  { name: "Free Cardiac Screening Camp", where: "Civil Hospital, Nabha", when: "Sat, 12 July · 9am–2pm", org: "Punjab Health Dept." },
  { name: "Eye Check-up & Cataract Camp", where: "PHC Bhadson, Patiala", when: "Sun, 20 July · 8am–1pm", org: "Sightsavers India" },
  { name: "Diabetes & BP Awareness", where: "Community Hall, Amloh", when: "Wed, 30 July · 10am–4pm", org: "District Health Society" },
];

const vaccines = [
  { name: "Mission Indradhanush 5.0", target: "Children <5 & pregnant women", status: "Ongoing" },
  { name: "COVID-19 Precaution Dose", target: "Adults 60+ and healthcare workers", status: "Available" },
  { name: "HPV Vaccination Drive", target: "Girls 9–14 yrs", status: "Enrolling" },
];

const announcements = [
  { title: "Heatwave Health Advisory", body: "Stay hydrated. Avoid outdoor work between 12–4pm. Watch elderly for dehydration.", date: "1 July 2026" },
  { title: "Dengue Prevention Week", body: "Empty water containers weekly. Report fever + rash to nearest PHC immediately.", date: "28 June 2026" },
];

function SchemesPage() {
  return (
    <AppShell title="Government Healthcare Support">
      <div className="mx-auto max-w-6xl space-y-6">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Health Schemes</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {schemes.map((s) => (
              <Card key={s.name} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{s.name}</p>
                  <Badge variant="secondary">{s.tag}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                <Button asChild variant="ghost" size="sm" className="mt-2 -ml-2">
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    Learn more <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Tent className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Upcoming Free Medical Camps</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {camps.map((c) => (
              <Card key={c.name} className="p-4">
                <p className="font-medium">{c.name}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{c.where}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{c.when}</p>
                <p className="mt-2 text-xs">Organized by <span className="font-medium">{c.org}</span></p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Syringe className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Vaccination Campaigns</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {vaccines.map((v) => (
              <Card key={v.name} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{v.name}</p>
                  <Badge className="bg-success/15 text-success border-0">{v.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{v.target}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Public Health Announcements</h2>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <Card key={a.title} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{a.title}</p>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
