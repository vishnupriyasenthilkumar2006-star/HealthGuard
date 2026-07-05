import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Pill, Bell, History, Users, User, LogOut, Heart, Menu, Package, FileText, Calendar, BarChart3, LifeBuoy, Settings, Droplets, Moon, Activity, Smile, Sparkles, Lock, Trophy, MapPin, Mic, Truck, Wifi, WifiOff, HeartPulse, Stethoscope, Video, IdCard, ShieldAlert, Landmark, Store, BellRing } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function useNavGroups() {
  const { t } = useTranslation();
  return [
    {
      label: t("nav.overview"),
      items: [
        { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
        { to: "/calendar", label: t("nav.calendar"), icon: Calendar },
        { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
        { to: "/notifications", label: "Notifications", icon: BellRing },
        { to: "/family", label: "Family", icon: Users },
        { to: "/health-risk", label: "Risk Prediction", icon: ShieldAlert },
      ],
    },
    {
      label: t("nav.telemedicine"),
      items: [
        { to: "/doctors", label: t("nav.doctors"), icon: Stethoscope },
        { to: "/appointments", label: t("nav.appointments"), icon: Calendar },
        { to: "/consultations", label: t("nav.consultations"), icon: Video },
        { to: "/nearby", label: t("nav.nearby"), icon: MapPin },
      ],
    },
    {
      label: t("nav.records"),
      items: [
        { to: "/health-card", label: "Health Card", icon: IdCard },
        { to: "/prescriptions", label: t("nav.prescriptions"), icon: FileText },
        { to: "/vault", label: t("nav.vault"), icon: Lock },
      ],
    },
    {
      label: t("nav.medicines"),
      items: [
        { to: "/medicines", label: t("nav.medicines"), icon: Pill },
        { to: "/reminders", label: t("nav.reminders"), icon: Bell },
        { to: "/stock", label: t("nav.stock"), icon: Package },
        { to: "/refill", label: t("nav.refill"), icon: Truck },
        { to: "/pharmacy", label: "Pharmacy Search", icon: Store },
        { to: "/schemes", label: "Govt. Health", icon: Landmark },
        { to: "/history", label: t("nav.history"), icon: History },
      ],
    },
    {
      label: t("nav.health"),
      items: [
        { to: "/wellness", label: t("nav.wellness"), icon: HeartPulse },
        { to: "/water", label: t("nav.water"), icon: Droplets },
        { to: "/sleep", label: t("nav.sleep"), icon: Moon },
        { to: "/exercise", label: t("nav.exercise"), icon: Activity },
        { to: "/mood", label: t("nav.mood"), icon: Smile },
        { to: "/rewards", label: t("nav.rewards"), icon: Trophy },
      ],
    },
    {
      label: t("nav.support"),
      items: [
        { to: "/assistant", label: t("nav.assistant"), icon: Sparkles },
        { to: "/voice", label: t("nav.voice"), icon: Mic },
        { to: "/caregivers", label: t("nav.caregivers"), icon: Users },
        { to: "/emergency", label: t("nav.emergency"), icon: LifeBuoy },
      ],
    },
    {
      label: t("nav.account"),
      items: [
        { to: "/settings", label: t("nav.settings"), icon: Settings },
        { to: "/profile", label: t("nav.profile"), icon: User },
      ],
    },
  ];
}

function NavList({ onClick }: { onClick?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navGroups = useNavGroups();
  return (
    <nav className="flex flex-col gap-3 p-3">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((it) => {
              const active = path === it.to || path.startsWith(it.to + "/");
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={onClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground shadow-card" : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex items-center gap-2 px-4 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-card">
        <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
      </div>
      <div>
        <p className="text-base font-semibold tracking-tight">{t("appName")}</p>
        <p className="text-[11px] text-muted-foreground">{t("tagline")}</p>
      </div>
    </Link>
  );
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { profile, logout, prefs, isAuthed, hydrated } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const online = useOnline();

  useEffect(() => {
    if (hydrated && !isAuthed) {
      navigate({ to: "/login", replace: true });
    }
  }, [hydrated, isAuthed, navigate]);


  useEffect(() => {
    document.documentElement.classList.toggle("elderly-mode", !!prefs.elderlyMode);
  }, [prefs.elderlyMode]);

  useEffect(() => {
    if (prefs.language && i18n.language !== prefs.language) {
      i18n.changeLanguage(prefs.language);
    }
  }, [prefs.language]);

  const handleLogout = () => { logout(); navigate({ to: "/login" }); };

  const sidebar = (
    <aside className="flex h-full flex-col border-r bg-sidebar">
      <Brand />
      <div className="flex-1 overflow-y-auto">
        <NavList onClick={() => setOpen(false)} />
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
            {profile.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{profile.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );

  if (!hydrated || !isAuthed) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-soft">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading…
        </div>
      </div>
    );
  }

  return (

    <div className="flex min-h-screen w-full bg-gradient-soft">
      <div className="hidden w-64 shrink-0 lg:block">{sidebar}</div>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
          {title && <h1 className="text-base font-semibold tracking-tight">{title}</h1>}
          <div className="ml-auto flex items-center gap-2">
            <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", online ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? t("online") : t("offline")}
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
