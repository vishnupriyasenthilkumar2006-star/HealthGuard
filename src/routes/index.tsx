import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Video, Stethoscope, FileText, Mic, Languages, MapPin, ShieldCheck, ArrowRight, CheckCircle2, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-health.jpg";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import i18n, { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HealthGuard — Smart Telemedicine & Rural Healthcare" },
      { name: "description", content: "Telemedicine for rural India. Consult doctors online, store health records, and get reminders in 6 languages." },
      { property: "og:title", content: "HealthGuard — Smart Telemedicine" },
      { property: "og:description", content: "Telemedicine, health records and multilingual care for rural communities." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: Video, title: "Telemedicine consultations", text: "Connect with certified doctors over secure video — from any village or town." },
    { icon: Stethoscope, title: "Doctor directory", text: "Browse specialists by language, district and availability. Book in seconds." },
    { icon: FileText, title: "Digital health records", text: "Prescriptions, lab reports and vaccination certificates — always with you." },
    { icon: Mic, title: "Voice assistant", text: "Hands-free navigation and reminders for elderly and low-literacy users." },
    { icon: Languages, title: "6 Indian languages", text: "English, Hindi, Tamil, Telugu, Malayalam and Kannada — UI, alerts, voice." },
    { icon: WifiOff, title: "Works offline", text: "View records, reminders and emergency info even with no connectivity." },
    { icon: MapPin, title: "Nearby rural care", text: "Find hospitals, clinics and pharmacies around you with one tap." },
    { icon: ShieldCheck, title: "Emergency SOS", text: "Blood group, allergies and emergency contacts ready for first responders." },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-card">
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-lg font-semibold tracking-tight">{t("appName")}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#trust" className="hover:text-foreground">For rural India</a>
        </nav>
        <div className="flex items-center gap-2">
          <Select defaultValue={i18n.language?.slice(0, 2) || "en"} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="h-9 w-32"><Languages className="mr-1 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
          <Button asChild className="bg-gradient-primary"><Link to="/register">Get started</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-2 lg:gap-16 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            {t("landing.pill")}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("landing.headline")} <span className="bg-gradient-primary bg-clip-text text-transparent">{t("landing.headlineAccent")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t("landing.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elevated">
              <Link to="/register">{t("landing.ctaStart")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/doctors">{t("landing.ctaDemo")}</Link>
            </Button>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {["Works offline in low-network areas", "Available in 6 Indian languages", "Voice-first elderly mode", "Free for rural patients"].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {t}</li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border bg-card shadow-elevated">
            <img src={heroImage} alt="Doctor providing telemedicine consultation to a rural patient" width={1536} height={1152} className="h-auto w-full" />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("landing.featuresTitle")}</h2>
          <p className="mt-4 text-muted-foreground">{t("landing.featuresLead")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { n: "01", t: "Find a doctor", d: "Browse certified physicians by specialty, language and district." },
              { n: "02", t: "Book a video consult", d: "Pick a slot and consult securely — no travel, no waiting rooms." },
              { n: "03", t: "Get care & follow-ups", d: "Prescriptions, reminders and records sync to your digital health card." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-background p-6">
                <span className="text-sm font-semibold text-primary">{s.n}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for rural healthcare access</h2>
        <p className="mt-4 text-muted-foreground">Inspired by the Nabha telemedicine initiative — bringing quality care to every village.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="bg-gradient-primary shadow-elevated"><Link to="/register">Create free account</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/doctors">Browse doctors</Link></Button>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} HealthGuard — Smart Telemedicine & Rural Healthcare.</p>
          <p>Made with care for patients, caregivers and rural clinicians.</p>
        </div>
      </footer>
    </div>
  );
}
