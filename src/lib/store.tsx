import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AlarmSound = "chime" | "beep" | "bell" | "gentle" | "urgent";

export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  startDate: string;
  endDate: string;
  times: string[];
  notes?: string;
  color?: string;
  stock?: number;
  lowStockThreshold?: number;
  alarmSound?: AlarmSound;
  critical?: boolean;
};

export type DoseLog = {
  id: string;
  medicineId: string;
  date: string;
  time: string;
  status: "taken" | "missed" | "pending";
  takenAt?: string;
  snoozedUntil?: string; // ISO timestamp
  acknowledged?: boolean; // user has interacted with this alarm
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
  emergencyPhone?: string;
  address?: string;
};

export type Prescription = {
  id: string;
  title: string;
  doctor: string;
  date: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  notes?: string;
};

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  status: "upcoming" | "completed" | "cancelled";
};

export type AlarmSettings = {
  soundEnabled: boolean;
  volume: number; // 0..1
  defaultSound: AlarmSound;
  defaultSnoozeMinutes: 5 | 10 | 15;
  repeatMinutes: number; // re-alarm if unresponsive
  notifyCaregivers: boolean;
  browserNotifications: boolean;
};

type Store = {
  medicines: Medicine[];
  logs: DoseLog[];
  caregivers: Caregiver[];
  profile: Profile;
  prescriptions: Prescription[];
  appointments: Appointment[];
  alarmSettings: AlarmSettings;
  isAuthed: boolean;
  addMedicine: (m: Omit<Medicine, "id">) => void;
  updateMedicine: (id: string, m: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  setDoseStatus: (medicineId: string, date: string, time: string, status: DoseLog["status"]) => void;
  snoozeDose: (medicineId: string, date: string, time: string, minutes: number) => void;
  acknowledgeDose: (medicineId: string, date: string, time: string) => void;
  addCaregiver: (c: Omit<Caregiver, "id">) => void;
  deleteCaregiver: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
  addPrescription: (p: Omit<Prescription, "id">) => void;
  deletePrescription: (id: string) => void;
  addAppointment: (a: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, a: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  refillMedicine: (id: string, amount: number) => void;
  updateAlarmSettings: (s: Partial<AlarmSettings>) => void;
  login: () => void;
  logout: () => void;
};

const today = new Date().toISOString().slice(0, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const defaultAlarmSettings: AlarmSettings = {
  soundEnabled: true,
  volume: 0.7,
  defaultSound: "chime",
  defaultSnoozeMinutes: 10,
  repeatMinutes: 2,
  notifyCaregivers: true,
  browserNotifications: true,
};

const defaultState = {
  medicines: [
    { id: "m1", name: "Metformin", dosage: "500 mg", startDate: inDays(-10), endDate: inDays(30), times: ["08:00", "20:00"], notes: "Take with meals", color: "chart-1", stock: 14, lowStockThreshold: 10, alarmSound: "chime" as AlarmSound, critical: false },
    { id: "m2", name: "Vitamin D3", dosage: "1000 IU", startDate: inDays(-30), endDate: inDays(60), times: ["09:00"], notes: "Once daily after breakfast", color: "chart-3", stock: 42, lowStockThreshold: 7, alarmSound: "gentle" as AlarmSound, critical: false },
    { id: "m3", name: "Atorvastatin", dosage: "10 mg", startDate: inDays(-5), endDate: inDays(90), times: ["21:00"], notes: "At bedtime", color: "chart-2", stock: 6, lowStockThreshold: 10, alarmSound: "urgent" as AlarmSound, critical: true },
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
    emergencyPhone: "+1 555-0142",
    address: "1280 Oak Street, Portland, OR",
  } as Profile,
  prescriptions: [
    { id: "p1", title: "Diabetes follow-up Rx", doctor: "Dr. Robert Lee", date: inDays(-10), fileName: "rx-diabetes.pdf", fileType: "application/pdf", fileSize: 124000, dataUrl: "", notes: "Continue metformin 500mg BD" },
  ] as Prescription[],
  appointments: [
    { id: "a1", doctor: "Dr. Robert Lee", specialty: "General Physician", date: inDays(3), time: "10:30", location: "Bayside Clinic, Room 204", notes: "Quarterly check-up", status: "upcoming" as const },
    { id: "a2", doctor: "Dr. Priya Patel", specialty: "Endocrinologist", date: inDays(-14), time: "14:00", location: "Metro Medical Center", status: "completed" as const },
  ] as Appointment[],
};

const StoreCtx = createContext<Store | null>(null);
const KEY = "medialert-store-v3";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(defaultState.medicines);
  const [logs, setLogs] = useState<DoseLog[]>(defaultState.logs);
  const [caregivers, setCaregivers] = useState<Caregiver[]>(defaultState.caregivers);
  const [profile, setProfile] = useState<Profile>(defaultState.profile);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(defaultState.prescriptions);
  const [appointments, setAppointments] = useState<Appointment[]>(defaultState.appointments);
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings>(defaultAlarmSettings);
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
        if (s.prescriptions) setPrescriptions(s.prescriptions);
        if (s.appointments) setAppointments(s.appointments);
        if (s.alarmSettings) setAlarmSettings({ ...defaultAlarmSettings, ...s.alarmSettings });
        if (typeof s.isAuthed === "boolean") setIsAuthed(s.isAuthed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ medicines, logs, caregivers, profile, prescriptions, appointments, alarmSettings, isAuthed }));
  }, [medicines, logs, caregivers, profile, prescriptions, appointments, alarmSettings, isAuthed, hydrated]);

  const upsertLog = (medicineId: string, date: string, time: string, patch: Partial<DoseLog>) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.medicineId === medicineId && l.date === date && l.time === time);
      if (idx >= 0) return prev.map((l, i) => (i === idx ? { ...l, ...patch } : l));
      return [...prev, { id: crypto.randomUUID(), medicineId, date, time, status: "pending", ...patch }];
    });
  };

  const value: Store = {
    medicines,
    logs,
    caregivers,
    profile,
    prescriptions,
    appointments,
    alarmSettings,
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
        const prevStatus = idx >= 0 ? prev[idx].status : null;
        const patch: Partial<DoseLog> = {
          status,
          acknowledged: true,
          snoozedUntil: undefined,
          takenAt: status === "taken" ? new Date().toISOString() : undefined,
        };
        const next = idx >= 0
          ? prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
          : [...prev, { id: crypto.randomUUID(), medicineId, date, time, status, ...patch } as DoseLog];
        if (status === "taken" && prevStatus !== "taken") {
          setMedicines((meds) => meds.map((m) => m.id === medicineId && typeof m.stock === "number" ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
        }
        return next;
      });
    },
    snoozeDose: (medicineId, date, time, minutes) => {
      const until = new Date(Date.now() + minutes * 60_000).toISOString();
      upsertLog(medicineId, date, time, { status: "pending", snoozedUntil: until, acknowledged: true });
    },
    acknowledgeDose: (medicineId, date, time) => {
      upsertLog(medicineId, date, time, { acknowledged: true });
    },
    addCaregiver: (c) => setCaregivers((p) => [...p, { ...c, id: crypto.randomUUID() }]),
    deleteCaregiver: (id) => setCaregivers((p) => p.filter((x) => x.id !== id)),
    updateProfile: (p) => setProfile((prev) => ({ ...prev, ...p })),
    addPrescription: (p) => setPrescriptions((prev) => [{ ...p, id: crypto.randomUUID() }, ...prev]),
    deletePrescription: (id) => setPrescriptions((p) => p.filter((x) => x.id !== id)),
    addAppointment: (a) => setAppointments((p) => [...p, { ...a, id: crypto.randomUUID() }]),
    updateAppointment: (id, a) => setAppointments((p) => p.map((x) => (x.id === id ? { ...x, ...a } : x))),
    deleteAppointment: (id) => setAppointments((p) => p.filter((x) => x.id !== id)),
    refillMedicine: (id, amount) =>
      setMedicines((p) => p.map((x) => (x.id === id ? { ...x, stock: (x.stock ?? 0) + amount } : x))),
    updateAlarmSettings: (s) => setAlarmSettings((prev) => ({ ...prev, ...s })),
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
  const dt = new Date(`${date}T${time}:00`);
  return dt.getTime() < Date.now() ? "missed" : "pending";
}

export function getDoseLog(logs: DoseLog[], medicineId: string, date: string, time: string) {
  return logs.find((l) => l.medicineId === medicineId && l.date === date && l.time === time);
}
