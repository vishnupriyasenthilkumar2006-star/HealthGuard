import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — HealthGuard" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, updateProfile } = useStore();
  const [form, setForm] = useState(profile);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success("Profile updated");
  };

  return (
    <AppShell title="Profile">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your profile</h2>
        <p className="text-muted-foreground">Keep your details up to date for better care.</p>
      </div>

      <Card className="mb-6 overflow-hidden border-0 bg-gradient-primary text-primary-foreground shadow-elevated">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20 text-3xl font-bold backdrop-blur">
            {form.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-2xl font-semibold">{form.fullName}</p>
            <p className="opacity-90">{form.email}</p>
            <p className="mt-1 text-sm opacity-80">{form.age ? `${form.age} years` : ""} {form.gender ? ` · ${form.gender}` : ""} {form.bloodGroup ? ` · ${form.bloodGroup}` : ""}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={form.age ?? ""} onChange={(e) => setForm({ ...form, age: Number(e.target.value) || undefined })} />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Medical information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Blood group</Label>
              <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" rows={2} value={form.allergies ?? ""} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, peanuts" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conditions">Medical conditions</Label>
              <Textarea id="conditions" rows={3} value={form.conditions ?? ""} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="e.g. Type 2 Diabetes, Hypertension" />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setForm(profile)}>Reset</Button>
          <Button type="submit" className="bg-gradient-primary">Save changes</Button>
        </div>
      </form>
    </AppShell>
  );
}
