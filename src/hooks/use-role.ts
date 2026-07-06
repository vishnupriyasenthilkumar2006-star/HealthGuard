import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "doctor" | "patient";

export function useRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (!uid) {
        if (!cancelled) {
          setRoles([]);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (!cancelled) {
        setRoles((data ?? []).map((r) => r.role as AppRole));
        setLoading(false);
      }
    };
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isDoctor: roles.includes("doctor"),
    isPatient: roles.includes("patient") || roles.length === 0,
  };
}
