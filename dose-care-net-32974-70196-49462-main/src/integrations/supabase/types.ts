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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_tokens: {
        Row: {
          created_at: string
          entity_id: string
          expires_at: string
          id: string
          token: string
          type: Database["public"]["Enums"]["action_token_type"]
          used_at: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          expires_at: string
          id?: string
          token: string
          type: Database["public"]["Enums"]["action_token_type"]
          used_at?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          expires_at?: string
          id?: string
          token?: string
          type?: Database["public"]["Enums"]["action_token_type"]
          used_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_role: Database["public"]["Enums"]["user_role"] | null
          actor_user_id: string | null
          after_json: Json | null
          before_json: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          channels: Database["public"]["Enums"]["caregiver_channel"][]
          consent_at: string | null
          created_at: string
          escalate_after_mins: number
          id: string
          name: string
          patient_id: string
          phone_e164: string
          relation: string | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          channels?: Database["public"]["Enums"]["caregiver_channel"][]
          consent_at?: string | null
          created_at?: string
          escalate_after_mins?: number
          id?: string
          name: string
          patient_id: string
          phone_e164: string
          relation?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          channels?: Database["public"]["Enums"]["caregiver_channel"][]
          consent_at?: string | null
          created_at?: string
          escalate_after_mins?: number
          id?: string
          name?: string
          patient_id?: string
          phone_e164?: string
          relation?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_points: {
        Row: {
          browser: string | null
          consent_at: string | null
          created_at: string
          id: string
          language: string
          last_seen_at: string | null
          patient_id: string
          phone_e164: string | null
          preferred: boolean
          push_auth: string | null
          push_endpoint: string | null
          push_p256dh: string | null
          type: Database["public"]["Enums"]["contact_type"]
          verified_at: string | null
        }
        Insert: {
          browser?: string | null
          consent_at?: string | null
          created_at?: string
          id?: string
          language?: string
          last_seen_at?: string | null
          patient_id: string
          phone_e164?: string | null
          preferred?: boolean
          push_auth?: string | null
          push_endpoint?: string | null
          push_p256dh?: string | null
          type: Database["public"]["Enums"]["contact_type"]
          verified_at?: string | null
        }
        Update: {
          browser?: string | null
          consent_at?: string | null
          created_at?: string
          id?: string
          language?: string
          last_seen_at?: string | null
          patient_id?: string
          phone_e164?: string | null
          preferred?: boolean
          push_auth?: string | null
          push_endpoint?: string | null
          push_p256dh?: string | null
          type?: Database["public"]["Enums"]["contact_type"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_points_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      dose_intakes: {
        Row: {
          created_at: string
          dose_plan_id: string
          id: string
          notes: string | null
          source: Database["public"]["Enums"]["intake_source"]
          status: Database["public"]["Enums"]["intake_status"]
          taken_at_utc: string | null
        }
        Insert: {
          created_at?: string
          dose_plan_id: string
          id?: string
          notes?: string | null
          source: Database["public"]["Enums"]["intake_source"]
          status: Database["public"]["Enums"]["intake_status"]
          taken_at_utc?: string | null
        }
        Update: {
          created_at?: string
          dose_plan_id?: string
          id?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["intake_source"]
          status?: Database["public"]["Enums"]["intake_status"]
          taken_at_utc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dose_intakes_dose_plan_id_fkey"
            columns: ["dose_plan_id"]
            isOneToOne: false
            referencedRelation: "dose_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      dose_plans: {
        Row: {
          created_at: string
          id: string
          last_notified_at: string | null
          planned_at_utc: string
          schedule_id: string
          status: Database["public"]["Enums"]["dose_status"]
          updated_at: string
          window_end_utc: string
          window_start_utc: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_notified_at?: string | null
          planned_at_utc: string
          schedule_id: string
          status?: Database["public"]["Enums"]["dose_status"]
          updated_at?: string
          window_end_utc: string
          window_start_utc: string
        }
        Update: {
          created_at?: string
          id?: string
          last_notified_at?: string | null
          planned_at_utc?: string
          schedule_id?: string
          status?: Database["public"]["Enums"]["dose_status"]
          updated_at?: string
          window_end_utc?: string
          window_start_utc?: string
        }
        Relationships: [
          {
            foreignKeyName: "dose_plans_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_lots: {
        Row: {
          added_at: string
          expiry_date: string | null
          id: string
          lot_no: string | null
          medication_id: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["owner_type"]
          qty: number
          updated_at: string
        }
        Insert: {
          added_at?: string
          expiry_date?: string | null
          id?: string
          lot_no?: string | null
          medication_id: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["owner_type"]
          qty?: number
          updated_at?: string
        }
        Update: {
          added_at?: string
          expiry_date?: string | null
          id?: string
          lot_no?: string | null
          medication_id?: string
          owner_id?: string
          owner_type?: Database["public"]["Enums"]["owner_type"]
          qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lots_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_txns: {
        Row: {
          created_at: string
          delta: number
          dose_intake_id: string | null
          id: string
          lot_id: string
          reason: Database["public"]["Enums"]["txn_reason"]
        }
        Insert: {
          created_at?: string
          delta: number
          dose_intake_id?: string | null
          id?: string
          lot_id: string
          reason: Database["public"]["Enums"]["txn_reason"]
        }
        Update: {
          created_at?: string
          delta?: number
          dose_intake_id?: string | null
          id?: string
          lot_id?: string
          reason?: Database["public"]["Enums"]["txn_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_txns_dose_intake_id_fkey"
            columns: ["dose_intake_id"]
            isOneToOne: false
            referencedRelation: "dose_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_txns_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          code_type: Database["public"]["Enums"]["code_type"] | null
          code_value: string | null
          created_at: string
          form: Database["public"]["Enums"]["medication_form"]
          id: string
          name: string
          notes: string | null
          strength: string | null
          updated_at: string
        }
        Insert: {
          code_type?: Database["public"]["Enums"]["code_type"] | null
          code_value?: string | null
          created_at?: string
          form: Database["public"]["Enums"]["medication_form"]
          id?: string
          name: string
          notes?: string | null
          strength?: string | null
          updated_at?: string
        }
        Update: {
          code_type?: Database["public"]["Enums"]["code_type"] | null
          code_value?: string | null
          created_at?: string
          form?: Database["public"]["Enums"]["medication_form"]
          id?: string
          name?: string
          notes?: string | null
          strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          caregiver_id: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          delivered_at: string | null
          error: string | null
          id: string
          interacted_at: string | null
          patient_id: string
          payload_json: Json | null
          provider_msg_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          template: string
          to_ref: string
        }
        Insert: {
          caregiver_id?: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          interacted_at?: string | null
          patient_id: string
          payload_json?: Json | null
          provider_msg_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template: string
          to_ref: string
        }
        Update: {
          caregiver_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          interacted_at?: string | null
          patient_id?: string
          payload_json?: Json | null
          provider_msg_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template?: string
          to_ref?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          clinic_id: string
          consent_at: string | null
          created_at: string
          dnd_end: string | null
          dnd_start: string | null
          dob: string | null
          full_name: string
          id: string
          language: string
          notify_mode: Database["public"]["Enums"]["notify_mode"]
          privacy_mode: Database["public"]["Enums"]["privacy_mode"]
          timezone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          clinic_id: string
          consent_at?: string | null
          created_at?: string
          dnd_end?: string | null
          dnd_start?: string | null
          dob?: string | null
          full_name: string
          id?: string
          language?: string
          notify_mode?: Database["public"]["Enums"]["notify_mode"]
          privacy_mode?: Database["public"]["Enums"]["privacy_mode"]
          timezone?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string
          consent_at?: string | null
          created_at?: string
          dnd_end?: string | null
          dnd_start?: string | null
          dob?: string | null
          full_name?: string
          id?: string
          language?: string
          notify_mode?: Database["public"]["Enums"]["notify_mode"]
          privacy_mode?: Database["public"]["Enums"]["privacy_mode"]
          timezone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          issued_at: string | null
          parsed_json: Json | null
          patient_id: string
          prescriber: string | null
          status: Database["public"]["Enums"]["prescription_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          issued_at?: string | null
          parsed_json?: Json | null
          patient_id: string
          prescriber?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          issued_at?: string | null
          parsed_json?: Json | null
          patient_id?: string
          prescriber?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          dose_unit: string
          dose_value: number
          end_date: string | null
          id: string
          medication_id: string
          patient_id: string
          prn: boolean
          regimen_json: Json
          start_date: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dose_unit: string
          dose_value: number
          end_date?: string | null
          id?: string
          medication_id: string
          patient_id: string
          prn?: boolean
          regimen_json: Json
          start_date: string
          timezone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dose_unit?: string
          dose_value?: number
          end_date?: string | null
          id?: string
          medication_id?: string
          patient_id?: string
          prn?: boolean
          regimen_json?: Json
          start_date?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          clinic_id: string | null
          created_at: string
          email: string
          id: string
          password_hash: string | null
          phone_e164: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          email: string
          id?: string
          password_hash?: string | null
          phone_e164?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          email?: string
          id?: string
          password_hash?: string | null
          phone_e164?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_token_type: "confirm_intake" | "snooze" | "skip" | "login"
      caregiver_channel: "sms" | "whatsapp" | "web_push"
      code_type: "NDC" | "GTIN" | "UPC" | "OTHER"
      contact_type: "sms" | "whatsapp" | "web_push"
      dose_status: "pending" | "notified" | "taken" | "missed" | "skipped"
      intake_source: "web_push" | "whatsapp" | "sms" | "web"
      intake_status: "on_time" | "late" | "missed" | "skipped"
      medication_form:
        | "tablet"
        | "capsule"
        | "liquid"
        | "injection"
        | "cream"
        | "inhaler"
        | "patch"
        | "other"
      notification_channel: "web_push" | "whatsapp" | "sms"
      notification_status:
        | "queued"
        | "sent"
        | "delivered"
        | "failed"
        | "interacted"
      notify_mode: "fallback" | "parallel"
      owner_type: "patient" | "clinic"
      prescription_status: "uploaded" | "parsed" | "confirmed"
      privacy_mode: "standard" | "private"
      txn_reason: "intake" | "add" | "adjust" | "expire"
      user_role: "staff" | "patient" | "caregiver"
      user_status: "active" | "inactive" | "suspended"
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
    Enums: {
      action_token_type: ["confirm_intake", "snooze", "skip", "login"],
      caregiver_channel: ["sms", "whatsapp", "web_push"],
      code_type: ["NDC", "GTIN", "UPC", "OTHER"],
      contact_type: ["sms", "whatsapp", "web_push"],
      dose_status: ["pending", "notified", "taken", "missed", "skipped"],
      intake_source: ["web_push", "whatsapp", "sms", "web"],
      intake_status: ["on_time", "late", "missed", "skipped"],
      medication_form: [
        "tablet",
        "capsule",
        "liquid",
        "injection",
        "cream",
        "inhaler",
        "patch",
        "other",
      ],
      notification_channel: ["web_push", "whatsapp", "sms"],
      notification_status: [
        "queued",
        "sent",
        "delivered",
        "failed",
        "interacted",
      ],
      notify_mode: ["fallback", "parallel"],
      owner_type: ["patient", "clinic"],
      prescription_status: ["uploaded", "parsed", "confirmed"],
      privacy_mode: ["standard", "private"],
      txn_reason: ["intake", "add", "adjust", "expire"],
      user_role: ["staff", "patient", "caregiver"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
