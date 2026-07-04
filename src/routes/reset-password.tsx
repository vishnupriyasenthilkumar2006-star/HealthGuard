import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — HealthGuard" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You are signed in.");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you'll remember."
      footer={<span><Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></span>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary">{loading ? "Updating…" : "Update password"}</Button>
      </form>
    </AuthShell>
  );
}
