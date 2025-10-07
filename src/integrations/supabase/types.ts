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
      blog_comments: {
        Row: {
          blog_post_id: string
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_post_id: string
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_post_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string
          category: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author_name: string
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_fee: number
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          contact_phone: string | null
          created_at: string
          guests_count: number
          id: string
          payment_id: string | null
          property_id: string
          refund_amount: number | null
          security_deposit: number
          special_requests: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_fee?: number
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          contact_phone?: string | null
          created_at?: string
          guests_count?: number
          id?: string
          payment_id?: string | null
          property_id: string
          refund_amount?: number | null
          security_deposit?: number
          special_requests?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_fee?: number
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          contact_phone?: string | null
          created_at?: string
          guests_count?: number
          id?: string
          payment_id?: string | null
          property_id?: string
          refund_amount?: number | null
          security_deposit?: number
          special_requests?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_transactions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          host_amount: number
          host_user_id: string
          id: string
          payment_id: string
          property_id: string
          status: string
          stripe_transfer_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          host_amount: number
          host_user_id: string
          id?: string
          payment_id: string
          property_id: string
          status?: string
          stripe_transfer_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          host_amount?: number
          host_user_id?: string
          id?: string
          payment_id?: string
          property_id?: string
          status?: string
          stripe_transfer_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          property_id: string
          requester_email: string
          requester_name: string
          requester_phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          property_id: string
          requester_email: string
          requester_name: string
          requester_phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          property_id?: string
          requester_email?: string
          requester_name?: string
          requester_phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          admin_id: string | null
          conversation_type: string | null
          created_at: string
          id: string
          last_read_at: string | null
          property_id: string | null
          recipient_id: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          last_read_at?: string | null
          property_id?: string | null
          recipient_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          last_read_at?: string | null
          property_id?: string | null
          recipient_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      host_payment_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string
          bank_address: string | null
          bank_name: string
          country: string
          created_at: string | null
          currency: string
          iban: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          routing_number: string | null
          stripe_account_id: string | null
          swift_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type?: string
          bank_address?: string | null
          bank_name: string
          country?: string
          created_at?: string | null
          currency?: string
          iban?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          routing_number?: string | null
          stripe_account_id?: string | null
          swift_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string
          bank_address?: string | null
          bank_name?: string
          country?: string
          created_at?: string | null
          currency?: string
          iban?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          routing_number?: string | null
          stripe_account_id?: string | null
          swift_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          property_id: string
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          property_id: string
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          property_id?: string
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          created_at: string
          email: string
          id: string
          is_superhost: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["app_role"]
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email: string
          id: string
          is_superhost?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email?: string
          id?: string
          is_superhost?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: string
          bathrooms: string | null
          bedrooms: string | null
          category: string
          check_in_time: string | null
          check_out_time: string | null
          city: string
          commission_rate: number | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          description: string | null
          district: string | null
          features: Json | null
          floor_number: string | null
          full_address: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_hot_deal: boolean | null
          is_new: boolean | null
          is_verified: boolean | null
          location: string
          owner_account_id: string | null
          pets_allowed: boolean | null
          price: string
          price_currency: string | null
          price_type: string
          property_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: string
          bathrooms?: string | null
          bedrooms?: string | null
          category: string
          check_in_time?: string | null
          check_out_time?: string | null
          city: string
          commission_rate?: number | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          description?: string | null
          district?: string | null
          features?: Json | null
          floor_number?: string | null
          full_address?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_hot_deal?: boolean | null
          is_new?: boolean | null
          is_verified?: boolean | null
          location: string
          owner_account_id?: string | null
          pets_allowed?: boolean | null
          price: string
          price_currency?: string | null
          price_type: string
          property_type: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string
          bathrooms?: string | null
          bedrooms?: string | null
          category?: string
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string
          commission_rate?: number | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          description?: string | null
          district?: string | null
          features?: Json | null
          floor_number?: string | null
          full_address?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_hot_deal?: boolean | null
          is_new?: boolean | null
          is_verified?: boolean | null
          location?: string
          owner_account_id?: string | null
          pets_allowed?: boolean | null
          price?: string
          price_currency?: string | null
          price_type?: string
          property_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          accuracy_rating: number | null
          booking_id: string | null
          checkin_rating: number | null
          cleanliness_rating: number | null
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          id: string
          location_rating: number | null
          property_id: string
          rating: number
          updated_at: string | null
          user_id: string
          value_rating: number | null
        }
        Insert: {
          accuracy_rating?: number | null
          booking_id?: string | null
          checkin_rating?: number | null
          cleanliness_rating?: number | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          location_rating?: number | null
          property_id: string
          rating: number
          updated_at?: string | null
          user_id: string
          value_rating?: number | null
        }
        Update: {
          accuracy_rating?: number | null
          booking_id?: string | null
          checkin_rating?: number | null
          cleanliness_rating?: number | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          location_rating?: number | null
          property_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_complete_bookings: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_booking_property_category: {
        Args: { booking_id_param: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_host: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "host" | "admin"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      payment_type:
        | "booking_fee"
        | "security_deposit"
        | "earnest_money"
        | "property_sale"
        | "monthly_rent"
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
      app_role: ["user", "host", "admin"],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      payment_type: [
        "booking_fee",
        "security_deposit",
        "earnest_money",
        "property_sale",
        "monthly_rent",
      ],
    },
  },
} as const
