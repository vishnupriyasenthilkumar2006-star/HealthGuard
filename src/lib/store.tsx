import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
  snoozedUntil?: string;
  acknowledged?: boolean;
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
  volume: number;
  defaultSound: AlarmSound;
  defaultSnoozeMinutes: 5 | 10 | 15;
  repeatMinutes: number;
  notifyCaregivers: boolean;
  browserNotifications: boolean;
};

export type WaterLog = { date: string; glasses: number };
export type SleepLog = { id: string; date: string; sleepTime: string; wakeTime: string; hours: number; quality?: number };
export type ExerciseLog = { id: string; date: string; type: string; minutes: number; steps?: number };
export type Mood = "happy" | "normal" | "sick" | "tired" | "stressed";
export type MoodLog = { date: string; mood: Mood; note?: string };

export type VaultCategory = "prescription" | "lab" | "scan" | "vaccination" | "other";
export type VaultRecord = {
  id: string;
  title: string;
  category: VaultCategory;
  date: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  notes?: string;
};

export type RefillRequest = {
  id: string;
  medicineId: string;
  pharmacy: string;
  quantity: number;
  status: "requested" | "confirmed" | "ready" | "delivered" | "cancelled";
  requestedAt: string;
};

export type Language = "en" | "ta" | "hi" | "te" | "ml" | "kn";

export type Preferences = {
  language: Language;
  elderlyMode: boolean;
  voiceEnabled: boolean;
  waterGoal: number;
  stepGoal: number;
  preferredPharmacy: string;
};

export type Rewards = {
  points: number;
  badges: string[];
  streak: number;
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
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  exerciseLogs: ExerciseLog[];
  moodLogs: MoodLog[];
  vault: VaultRecord[];
  refills: RefillRequest[];
  prefs: Preferences;
  rewards: Rewards;
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
  addWater: (n: number) => void;
  setWater: (glasses: number) => void;
  addSleep: (s: Omit<SleepLog, "id">) => void;
  deleteSleep: (id: string) => void;
  addExercise: (e: Omit<ExerciseLog, "id">) => void;
  deleteExercise: (id: string) => void;
  setMood: (mood: Mood, note?: string) => void;
  addVault: (r: Omit<VaultRecord, "id">) => void;
  deleteVault: (id: string) => void;
  requestRefill: (r: Omit<RefillRequest, "id" | "requestedAt" | "status"> & { status?: RefillRequest["status"] }) => void;
  updateRefill: (id: string, r: Partial<RefillRequest>) => void;
  updatePrefs: (p: Partial<Preferences>) => void;
  awardPoints: (n: number, badge?: string) => void;
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

const defaultPrefs: Preferences = {
  language: "en",
  elderlyMode: false,
  voiceEnabled: true,
  waterGoal: 8,
  stepGoal: 6000,
  preferredPharmacy: "Bayside Pharmacy",
};

const defaultRewards: Rewards = {
  points: 240,
  badges: ["First Dose", "3-Day Streak", "Hydration Hero"],
  streak: 5,
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
  waterLogs: [
    { date: today, glasses: 4 },
    { date: inDays(-1), glasses: 7 },
    { date: inDays(-2), glasses: 6 },
    { date: inDays(-3), glasses: 8 },
    { date: inDays(-4), glasses: 5 },
    { date: inDays(-5), glasses: 6 },
    { date: inDays(-6), glasses: 7 },
  ] as WaterLog[],
  sleepLogs: [
    { id: "s1", date: inDays(-1), sleepTime: "23:15", wakeTime: "06:45", hours: 7.5, quality: 4 },
    { id: "s2", date: inDays(-2), sleepTime: "00:10", wakeTime: "07:00", hours: 6.8, quality: 3 },
    { id: "s3", date: inDays(-3), sleepTime: "22:45", wakeTime: "06:30", hours: 7.75, quality: 5 },
  ] as SleepLog[],
  exerciseLogs: [
    { id: "e1", date: today, type: "Walk", minutes: 30, steps: 3200 },
    { id: "e2", date: inDays(-1), type: "Yoga", minutes: 20 },
    { id: "e3", date: inDays(-2), type: "Walk", minutes: 45, steps: 4800 },
  ] as ExerciseLog[],
  moodLogs: [
    { date: today, mood: "happy" as Mood },
    { date: inDays(-1), mood: "normal" as Mood },
    { date: inDays(-2), mood: "tired" as Mood },
    { date: inDays(-3), mood: "happy" as Mood },
  ] as MoodLog[],
  vault: [
    { id: "v1", title: "Blood Test Report", category: "lab" as VaultCategory, date: inDays(-20), fileName: "blood-test.pdf", fileType: "application/pdf", fileSize: 220000, dataUrl: "" },
    { id: "v2", title: "Covid Vaccination Certificate", category: "vaccination" as VaultCategory, date: inDays(-200), fileName: "covid-cert.pdf", fileType: "application/pdf", fileSize: 110000, dataUrl: "" },
  ] as VaultRecord[],
  refills: [] as RefillRequest[],
};

const StoreCtx = createContext<Store | null>(null);
const KEY = "medialert-store-v4";

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
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(defaultState.waterLogs);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(defaultState.sleepLogs);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(defaultState.exerciseLogs);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(defaultState.moodLogs);
  const [vault, setVault] = useState<VaultRecord[]>(defaultState.vault);
  const [refills, setRefills] = useState<RefillRequest[]>(defaultState.refills);
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [rewards, setRewards] = useState<Rewards>(defaultRewards);

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
        if (s.waterLogs) setWaterLogs(s.waterLogs);
        if (s.sleepLogs) setSleepLogs(s.sleepLogs);
        if (s.exerciseLogs) setExerciseLogs(s.exerciseLogs);
        if (s.moodLogs) setMoodLogs(s.moodLogs);
        if (s.vault) setVault(s.vault);
        if (s.refills) setRefills(s.refills);
        if (s.prefs) setPrefs({ ...defaultPrefs, ...s.prefs });
        if (s.rewards) setRewards({ ...defaultRewards, ...s.rewards });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ medicines, logs, caregivers, profile, prescriptions, appointments, alarmSettings, isAuthed, waterLogs, sleepLogs, exerciseLogs, moodLogs, vault, refills, prefs, rewards }));
  }, [medicines, logs, caregivers, profile, prescriptions, appointments, alarmSettings, isAuthed, waterLogs, sleepLogs, exerciseLogs, moodLogs, vault, refills, prefs, rewards, hydrated]);

  const upsertLog = (medicineId: string, date: string, time: string, patch: Partial<DoseLog>) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.medicineId === medicineId && l.date === date && l.time === time);
      if (idx >= 0) return prev.map((l, i) => (i === idx ? { ...l, ...patch } : l));
      return [...prev, { id: crypto.randomUUID(), medicineId, date, time, status: "pending", ...patch }];
    });
  };

  const value: Store = useMemo(() => ({
    medicines, logs, caregivers, profile, prescriptions, appointments, alarmSettings, isAuthed,
    waterLogs, sleepLogs, exerciseLogs, moodLogs, vault, refills, prefs, rewards,
    addMedicine: (m) => setMedicines((p) => [...p, { ...m, id: crypto.randomUUID() }]),
    updateMedicine: (id, m) => setMedicines((p) => p.map((x) => (x.id === id ? { ...x, ...m } : x))),
    deleteMedicine: (id) => {
      setMedicines((p) => p.filter((x) => x.id !== id));
      setLogs((p) => p.filter((x) => x.medicineId !== id));
    },
    setDoseStatus: (medicineId, date, time, status) => {
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.medicineId === medicineId && l.date === date && l.time === time);
        const prevStatus = idx >= 0 ? prev[idx].status : null;
        const patch: Partial<DoseLog> = {
          status, acknowledged: true, snoozedUntil: undefined,
          takenAt: status === "taken" ? new Date().toISOString() : undefined,
        };
        const next = idx >= 0
          ? prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
          : [...prev, { id: crypto.randomUUID(), medicineId, date, time, status, ...patch } as DoseLog];
        if (status === "taken" && prevStatus !== "taken") {
          setMedicines((meds) => meds.map((m) => m.id === medicineId && typeof m.stock === "number" ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
          setRewards((r) => ({ ...r, points: r.points + 10 }));
        }
        return next;
      });
    },
    snoozeDose: (medicineId, date, time, minutes) => {
      const until = new Date(Date.now() + minutes * 60_000).toISOString();
      upsertLog(medicineId, date, time, { status: "pending", snoozedUntil: until, acknowledged: true });
    },
    acknowledgeDose: (medicineId, date, time) => upsertLog(medicineId, date, time, { acknowledged: true }),
    addCaregiver: (c) => setCaregivers((p) => [...p, { ...c, id: crypto.randomUUID() }]),
    deleteCaregiver: (id) => setCaregivers((p) => p.filter((x) => x.id !== id)),
    updateProfile: (p) => setProfile((prev) => ({ ...prev, ...p })),
    addPrescription: (p) => setPrescriptions((prev) => [{ ...p, id: crypto.randomUUID() }, ...prev]),
    deletePrescription: (id) => setPrescriptions((p) => p.filter((x) => x.id !== id)),
    addAppointment: (a) => setAppointments((p) => [...p, { ...a, id: crypto.randomUUID() }]),
    updateAppointment: (id, a) => setAppointments((p) => p.map((x) => (x.id === id ? { ...x, ...a } : x))),
    deleteAppointment: (id) => setAppointments((p) => p.filter((x) => x.id !== id)),
    refillMedicine: (id, amount) => setMedicines((p) => p.map((x) => (x.id === id ? { ...x, stock: (x.stock ?? 0) + amount } : x))),
    updateAlarmSettings: (s) => setAlarmSettings((prev) => ({ ...prev, ...s })),
    addWater: (n) => setWaterLogs((prev) => {
      const idx = prev.findIndex((w) => w.date === today);
      if (idx >= 0) return prev.map((w, i) => i === idx ? { ...w, glasses: Math.max(0, w.glasses + n) } : w);
      return [...prev, { date: today, glasses: Math.max(0, n) }];
    }),
    setWater: (glasses) => setWaterLogs((prev) => {
      const idx = prev.findIndex((w) => w.date === today);
      if (idx >= 0) return prev.map((w, i) => i === idx ? { ...w, glasses } : w);
      return [...prev, { date: today, glasses }];
    }),
    addSleep: (s) => setSleepLogs((p) => [{ ...s, id: crypto.randomUUID() }, ...p]),
    deleteSleep: (id) => setSleepLogs((p) => p.filter((x) => x.id !== id)),
    addExercise: (e) => setExerciseLogs((p) => [{ ...e, id: crypto.randomUUID() }, ...p]),
    deleteExercise: (id) => setExerciseLogs((p) => p.filter((x) => x.id !== id)),
    setMood: (mood, note) => setMoodLogs((prev) => {
      const idx = prev.findIndex((m) => m.date === today);
      if (idx >= 0) return prev.map((m, i) => i === idx ? { ...m, mood, note } : m);
      return [...prev, { date: today, mood, note }];
    }),
    addVault: (r) => setVault((p) => [{ ...r, id: crypto.randomUUID() }, ...p]),
    deleteVault: (id) => setVault((p) => p.filter((x) => x.id !== id)),
    requestRefill: (r) => setRefills((p) => [{ ...r, status: r.status ?? "requested", id: crypto.randomUUID(), requestedAt: new Date().toISOString() }, ...p]),
    updateRefill: (id, r) => setRefills((p) => p.map((x) => x.id === id ? { ...x, ...r } : x)),
    updatePrefs: (p) => setPrefs((prev) => ({ ...prev, ...p })),
    awardPoints: (n, badge) => setRewards((r) => ({ ...r, points: r.points + n, badges: badge && !r.badges.includes(badge) ? [...r.badges, badge] : r.badges })),
    login: () => setIsAuthed(true),
    logout: () => setIsAuthed(false),
  }), [medicines, logs, caregivers, profile, prescriptions, appointments, alarmSettings, isAuthed, waterLogs, sleepLogs, exerciseLogs, moodLogs, vault, refills, prefs, rewards]);

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
