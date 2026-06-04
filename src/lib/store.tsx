import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  startDate: string;
  endDate: string;
  times: string[]; // ["08:00", "20:00"]
  notes?: string;
  color?: string;
};

export type DoseLog = {
  id: string;
  medicineId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: "taken" | "missed" | "pending";
  takenAt?: string;
};

export type Caregiver = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  isEmergency?: boolean;
};

export type Profile = {
  fullName: string;
  email: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  conditions?: string;
  avatarUrl?: string;
};

type Store = {
  medicines: Medicine[];
  logs: DoseLog[];
  caregivers: Caregiver[];
  profile: Profile;
  isAuthed: boolean;
  addMedicine: (m: Omit<Medicine, "id">) => void;
  updateMedicine: (id: string, m: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  setDoseStatus: (medicineId: string, date: string, time: string, status: DoseLog["status"]) => void;
  addCaregiver: (c: Omit<Caregiver, "id">) => void;
  deleteCaregiver: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
  login: () => void;
  logout: () => void;
};

const today = new Date().toISOString().slice(0, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const defaultState = {
  medicines: [
    {
      id: "m1",
      name: "Metformin",
      dosage: "500 mg",
      startDate: inDays(-10),
      endDate: inDays(30),
      times: ["08:00", "20:00"],
      notes: "Take with meals",
      color: "chart-1",
    },
    {
      id: "m2",
      name: "Vitamin D3",
      dosage: "1000 IU",
      startDate: inDays(-30),
      endDate: inDays(60),
      times: ["09:00"],
      notes: "Once daily after breakfast",
      color: "chart-3",
    },
    {
      id: "m3",
      name: "Atorvastatin",
      dosage: "10 mg",
      startDate: inDays(-5),
      endDate: inDays(90),
      times: ["21:00"],
      notes: "At bedtime",
      color: "chart-2",
    },
  ] as Medicine[],
  logs: [
    { id: "l1", medicineId: "m1", date: today, time: "08:00", status: "taken", takenAt: new Date().toISOString() },
    { id: "l2", medicineId: "m2", date: today, time: "09:00", status: "taken", takenAt: new Date().toISOString() },
    { id: "l3", medicineId: "m1", date: inDays(-1), time: "20:00", status: "missed" },
    { id: "l4", medicineId: "m3", date: inDays(-1), time: "21:00", status: "taken" },
    { id: "l5", medicineId: "m1", date: inDays(-2), time: "08:00", status: "taken" },
    { id: "l6", medicineId: "m1", date: inDays(-2), time: "20:00", status: "taken" },
  ] as DoseLog[],
  caregivers: [
    { id: "c1", name: "Sarah Johnson", relation: "Daughter", phone: "+1 555-0142", email: "sarah@example.com", isEmergency: true },
    { id: "c2", name: "Dr. Robert Lee", relation: "Family Doctor", phone: "+1 555-0199", email: "dr.lee@clinic.com" },
  ] as Caregiver[],
  profile: {
    fullName: "Alex Morgan",
    email: "alex.morgan@example.com",
    age: 58,
    gender: "Female",
    bloodGroup: "O+",
    allergies: "Penicillin",
    conditions: "Type 2 Diabetes, High Cholesterol",
  } as Profile,
};

const StoreCtx = createContext<Store | null>(null);

const KEY = "medialert-store-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(defaultState.medicines);
  const [logs, setLogs] = useState<DoseLog[]>(defaultState.logs);
  const [caregivers, setCaregivers] = useState<Caregiver[]>(defaultState.caregivers);
  const [profile, setProfile] = useState<Profile>(defaultState.profile);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.medicines) setMedicines(s.medicines);
        if (s.logs) setLogs(s.logs);
        if (s.caregivers) setCaregivers(s.caregivers);
        if (s.profile) setProfile(s.profile);
        if (typeof s.isAuthed === "boolean") setIsAuthed(s.isAuthed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ medicines, logs, caregivers, profile, isAuthed }));
  }, [medicines, logs, caregivers, profile, isAuthed, hydrated]);

  const value: Store = {
    medicines,
    logs,
    caregivers,
    profile,
    isAuthed,
    addMedicine: (m) => setMedicines((p) => [...p, { ...m, id: crypto.randomUUID() }]),
    updateMedicine: (id, m) =>
      setMedicines((p) => p.map((x) => (x.id === id ? { ...x, ...m } : x))),
    deleteMedicine: (id) => {
      setMedicines((p) => p.filter((x) => x.id !== id));
      setLogs((p) => p.filter((x) => x.medicineId !== id));
    },
    setDoseStatus: (medicineId, date, time, status) => {
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.medicineId === medicineId && l.date === date && l.time === time);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], status, takenAt: status === "taken" ? new Date().toISOString() : undefined };
          return next;
        }
        return [
          ...prev,
          { id: crypto.randomUUID(), medicineId, date, time, status, takenAt: status === "taken" ? new Date().toISOString() : undefined },
        ];
      });
    },
    addCaregiver: (c) => setCaregivers((p) => [...p, { ...c, id: crypto.randomUUID() }]),
    deleteCaregiver: (id) => setCaregivers((p) => p.filter((x) => x.id !== id)),
    updateProfile: (p) => setProfile((prev) => ({ ...prev, ...p })),
    login: () => setIsAuthed(true),
    logout: () => setIsAuthed(false),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function getDoseStatus(logs: DoseLog[], medicineId: string, date: string, time: string): DoseLog["status"] {
  const log = logs.find((l) => l.medicineId === medicineId && l.date === date && l.time === time);
  if (log) return log.status;
  // infer: if datetime in the past => missed, else pending
  const dt = new Date(`${date}T${time}:00`);
  return dt.getTime() < Date.now() ? "missed" : "pending";
}
