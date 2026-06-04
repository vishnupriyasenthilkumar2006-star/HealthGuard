import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Pill, Bell, History, Users, User, LogOut, Heart, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/history", label: "History", icon: History },
  { to: "/caregivers", label: "Caregivers", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function NavList({ onClick }: { onClick?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((it) => {
        const active = path.startsWith(it.to);
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-card"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 px-4 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-card">
        <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
      </div>
      <div>
        <p className="text-base font-semibold tracking-tight">MediAlert</p>
        <p className="text-[11px] text-muted-foreground">Medicine Reminder</p>
      </div>
    </Link>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { profile, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

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
            <SheetContent side="left" className="w-64 p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
          {title && <h1 className="text-base font-semibold tracking-tight">{title}</h1>}
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
