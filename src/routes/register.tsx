import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — HealthGuard" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { updateProfile } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: form.fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    updateProfile({ fullName: form.fullName, email: form.email });
    toast.success("Account created! Welcome to HealthGuard.");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="A few details and you're ready to stay on top of your meds."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={form.fullName} onChange={onChange("fullName")} placeholder="Jane Doe" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={onChange("email")} placeholder="you@example.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={onChange("password")} placeholder="At least 6 characters" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" value={form.confirm} onChange={onChange("confirm")} placeholder="Repeat password" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary">{loading ? "Creating…" : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}
