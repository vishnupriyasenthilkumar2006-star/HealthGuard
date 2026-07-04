export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_state: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      caregiver_details: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_emergency: boolean | null
          name: string
          phone: string | null
          relation: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name: string
          phone?: string | null
          relation?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name?: string
          phone?: string | null
          relation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      doctor_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor: string
          id: string
          location: string | null
          mode: string | null
          notes: string | null
          reason: string | null
          specialty: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          doctor: string
          id?: string
          location?: string | null
          mode?: string | null
          notes?: string | null
          reason?: string | null
          specialty?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor?: string
          id?: string
          location?: string | null
          mode?: string | null
          notes?: string | null
          reason?: string | null
          specialty?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_emergency: boolean | null
          name: string
          phone: string
          relation: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name: string
          phone: string
          relation?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name?: string
          phone?: string
          relation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          category: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          notes: string | null
          record_date: string | null
          storage_path: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          record_date?: string | null
          storage_path?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          record_date?: string | null
          storage_path?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medicine_reminders: {
        Row: {
          acknowledged: boolean | null
          created_at: string
          id: string
          medicine_id: string | null
          reminder_date: string
          reminder_time: string
          snoozed_until: string | null
          status: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          created_at?: string
          id?: string
          medicine_id?: string | null
          reminder_date: string
          reminder_time: string
          snoozed_until?: string | null
          status?: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          created_at?: string
          id?: string
          medicine_id?: string | null
          reminder_date?: string
          reminder_time?: string
          snoozed_until?: string | null
          status?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_reminders_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          alarm_sound: string | null
          color: string | null
          created_at: string
          critical: boolean | null
          dosage: string | null
          end_date: string | null
          id: string
          low_stock_threshold: number | null
          name: string
          notes: string | null
          start_date: string | null
          stock: number | null
          times: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          alarm_sound?: string | null
          color?: string | null
          created_at?: string
          critical?: boolean | null
          dosage?: string | null
          end_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          name: string
          notes?: string | null
          start_date?: string | null
          stock?: number | null
          times?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          alarm_sound?: string | null
          color?: string | null
          created_at?: string
          critical?: boolean | null
          dosage?: string | null
          end_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          name?: string
          notes?: string | null
          start_date?: string | null
          stock?: number | null
          times?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          age: number | null
          allergies: string | null
          avatar_url: string | null
          blood_group: string | null
          conditions: string | null
          created_at: string
          email: string | null
          emergency_phone: string | null
          full_name: string | null
          gender: string | null
          id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          conditions?: string | null
          created_at?: string
          email?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          conditions?: string | null
          created_at?: string
          email?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      wellness_exercise: {
        Row: {
          id: string
          log_date: string
          minutes: number | null
          steps: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          id?: string
          log_date: string
          minutes?: number | null
          steps?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          id?: string
          log_date?: string
          minutes?: number | null
          steps?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wellness_mood: {
        Row: {
          id: string
          log_date: string
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          id?: string
          log_date: string
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          id?: string
          log_date?: string
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wellness_sleep: {
        Row: {
          hours: number | null
          id: string
          log_date: string
          quality: number | null
          sleep_time: string | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          hours?: number | null
          id?: string
          log_date: string
          quality?: number | null
          sleep_time?: string | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          hours?: number | null
          id?: string
          log_date?: string
          quality?: number | null
          sleep_time?: string | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      wellness_water: {
        Row: {
          glasses: number
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          glasses?: number
          id?: string
          log_date: string
          user_id: string
        }
        Update: {
          glasses?: number
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
