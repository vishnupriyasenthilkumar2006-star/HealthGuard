
-- Auto-updated timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  age INT,
  gender TEXT,
  blood_group TEXT,
  allergies TEXT,
  conditions TEXT,
  avatar_url TEXT,
  emergency_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ APP STATE (per-user JSONB blob used by the client store) ============
CREATE TABLE public.app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state TO authenticated;
GRANT ALL ON public.app_state TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own app_state" ON public.app_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_app_state_updated BEFORE UPDATE ON public.app_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOCTOR APPOINTMENTS ============
CREATE TABLE public.doctor_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor TEXT NOT NULL,
  specialty TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  mode TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_appointments TO authenticated;
GRANT ALL ON public.doctor_appointments TO service_role;
ALTER TABLE public.doctor_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.doctor_appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_appt_updated BEFORE UPDATE ON public.doctor_appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MEDICINES ============
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  start_date DATE,
  end_date DATE,
  times TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  color TEXT,
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  alarm_sound TEXT DEFAULT 'chime',
  critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicines TO authenticated;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own medicines" ON public.medicines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_medicines_updated BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MEDICINE REMINDERS (dose logs) ============
CREATE TABLE public.medicine_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  taken_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicine_reminders TO authenticated;
GRANT ALL ON public.medicine_reminders TO service_role;
ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminders" ON public.medicine_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ HEALTH RECORDS ============
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  record_date DATE,
  file_name TEXT,
  file_type TEXT,
  file_size INT,
  storage_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_records TO authenticated;
GRANT ALL ON public.health_records TO service_role;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own records" ON public.health_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ EMERGENCY CONTACTS ============
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  is_emergency BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own emergency contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ CAREGIVER DETAILS ============
CREATE TABLE public.caregiver_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone TEXT,
  email TEXT,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caregiver_details TO authenticated;
GRANT ALL ON public.caregiver_details TO service_role;
ALTER TABLE public.caregiver_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own caregivers" ON public.caregiver_details FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ WELLNESS TRACKING ============
CREATE TABLE public.wellness_water (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  glasses INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_water TO authenticated;
GRANT ALL ON public.wellness_water TO service_role;
ALTER TABLE public.wellness_water ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own water" ON public.wellness_water FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wellness_sleep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  sleep_time TEXT,
  wake_time TEXT,
  hours NUMERIC,
  quality INT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_sleep TO authenticated;
GRANT ALL ON public.wellness_sleep TO service_role;
ALTER TABLE public.wellness_sleep ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sleep" ON public.wellness_sleep FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wellness_exercise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  type TEXT,
  minutes INT,
  steps INT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_exercise TO authenticated;
GRANT ALL ON public.wellness_exercise TO service_role;
ALTER TABLE public.wellness_exercise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exercise" ON public.wellness_exercise FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wellness_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  mood TEXT NOT NULL,
  note TEXT,
  UNIQUE(user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_mood TO authenticated;
GRANT ALL ON public.wellness_mood TO service_role;
ALTER TABLE public.wellness_mood ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood" ON public.wellness_mood FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  category TEXT DEFAULT 'general',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
