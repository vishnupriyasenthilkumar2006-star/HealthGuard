import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Bell, Pill, ShieldCheck, Users, LineChart, ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediAlert — Never miss a dose again" },
      { name: "description", content: "MediAlert helps you remember medicines, track adherence, and keep caregivers in the loop." },
      { property: "og:title", content: "MediAlert — Never miss a dose again" },
      { property: "og:description", content: "Smart medicine reminders and health tracking for you and your family." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Bell, title: "Smart reminders", text: "Daily alerts so you never miss a dose, with smart snooze and refill warnings." },
  { icon: Pill, title: "Medicine library", text: "Track dosage, schedule, start and end dates, and notes for every prescription." },
  { icon: LineChart, title: "Adherence insights", text: "Beautiful charts to visualise how well you're following your plan." },
  { icon: Users, title: "Caregiver mode", text: "Loop in family or doctors with emergency contacts and shared visibility." },
  { icon: ShieldCheck, title: "Private & secure", text: "Your health data stays yours. Encrypted, private, and never sold." },
  { icon: Heart, title: "Designed for wellness", text: "A calm, focused interface that supports you on every step of your journey." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-card">
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-lg font-semibold tracking-tight">MediAlert</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#trust" className="hover:text-foreground">Why us</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
          <Button asChild className="bg-gradient-primary"><Link to="/register">Get started</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-2 lg:gap-16 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            Trusted by 50,000+ patients & caregivers
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Never miss a dose <span className="bg-gradient-primary bg-clip-text text-transparent">again.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            MediAlert is your personal medicine companion — smart reminders, a clear health dashboard, and caregiver support all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elevated">
              <Link to="/register">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">View demo</Link>
            </Button>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {["No credit card required", "Works on every device", "HIPAA-aligned design", "Caregiver-friendly"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border bg-card shadow-elevated">
            <img src={heroImage} alt="Doctor and patient with medicine reminders" width={1536} height={1152} className="h-auto w-full" />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to stay on track</h2>
          <p className="mt-4 text-muted-foreground">Designed with patients, caregivers and clinicians — every feature serves your health journey.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              { n: "01", t: "Add your medicines", d: "Set dosage, frequency, and the times you take each prescription." },
              { n: "02", t: "Get gentle reminders", d: "We'll nudge you at the right moments — calm, not noisy." },
              { n: "03", t: "Track your progress", d: "See adherence trends and share reports with your caregiver or doctor." },
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
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start taking better care of your health today</h2>
        <p className="mt-4 text-muted-foreground">Join thousands who trust MediAlert to keep their medication routine on track.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="bg-gradient-primary shadow-elevated">
            <Link to="/register">Create free account</Link>
          </Button>
          <Button asChild size="lg" variant="outline"><Link to="/login">I already have one</Link></Button>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MediAlert. Caring for your health.</p>
          <p>Made with care for patients and caregivers.</p>
        </div>
      </footer>
    </div>
  );
}
