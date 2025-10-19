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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_analytics: {
        Row: {
          blog_post_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
          view_duration_seconds: number | null
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          view_duration_seconds?: number | null
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          view_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_analytics_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          author_name_ar: string | null
          author_name_en: string | null
          author_name_fr: string | null
          category: string | null
          category_ar: string | null
          category_en: string | null
          category_fr: string | null
          content: string
          content_ar: string | null
          content_en: string | null
          content_fr: string | null
          created_at: string | null
          id: string
          image_url: string | null
          like_count: number | null
          meta_description: string | null
          meta_title: string | null
          scheduled_publish_at: string | null
          slug: string | null
          status: string | null
          title: string
          title_ar: string | null
          title_en: string | null
          title_fr: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          author_name: string
          author_name_ar?: string | null
          author_name_en?: string | null
          author_name_fr?: string | null
          category?: string | null
          category_ar?: string | null
          category_en?: string | null
          category_fr?: string | null
          content: string
          content_ar?: string | null
          content_en?: string | null
          content_fr?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          scheduled_publish_at?: string | null
          slug?: string | null
          status?: string | null
          title: string
          title_ar?: string | null
          title_en?: string | null
          title_fr?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          author_name?: string
          author_name_ar?: string | null
          author_name_en?: string | null
          author_name_fr?: string | null
          category?: string | null
          category_ar?: string | null
          category_en?: string | null
          category_fr?: string | null
          content?: string
          content_ar?: string | null
          content_en?: string | null
          content_fr?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          scheduled_publish_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string
          title_ar?: string | null
          title_en?: string | null
          title_fr?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          auto_release_scheduled: boolean | null
          booking_fee: number
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          contact_phone: string | null
          created_at: string
          escrow_release_eligible_at: string | null
          guest_confirmed_completion: boolean | null
          guests_count: number
          id: string
          keys_received_at: string | null
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
          auto_release_scheduled?: boolean | null
          booking_fee?: number
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          contact_phone?: string | null
          created_at?: string
          escrow_release_eligible_at?: string | null
          guest_confirmed_completion?: boolean | null
          guests_count?: number
          id?: string
          keys_received_at?: string | null
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
          auto_release_scheduled?: boolean | null
          booking_fee?: number
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          contact_phone?: string | null
          created_at?: string
          escrow_release_eligible_at?: string | null
          guest_confirmed_completion?: boolean | null
          guests_count?: number
          id?: string
          keys_received_at?: string | null
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
      client_reviews: {
        Row: {
          approved: boolean | null
          avatar_initials: string | null
          client_location: string | null
          client_name: string
          created_at: string | null
          display_order: number | null
          id: string
          rating: number | null
          review_text: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          avatar_initials?: string | null
          client_location?: string | null
          client_name: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          rating?: number | null
          review_text: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          avatar_initials?: string | null
          client_location?: string | null
          client_name?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          rating?: number | null
          review_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      commission_transactions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          escrow_released_at: string | null
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
          escrow_released_at?: string | null
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
          escrow_released_at?: string | null
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
            isOneToOne: true
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
          assigned_admin_id: string | null
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
          assigned_admin_id?: string | null
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
          assigned_admin_id?: string | null
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
            foreignKeyName: "conversations_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          subject: string
          template_key: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          subject: string
          template_key: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          subject?: string
          template_key?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      host_kyc_submissions: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          address_line_1: string
          address_line_2: string | null
          address_proof_type: string | null
          address_proof_url: string | null
          admin_notes: string | null
          bank_name: string | null
          bio: string | null
          city: string
          country: string
          created_at: string | null
          date_of_birth: string
          full_name: string
          hosting_experience: string | null
          iban: string | null
          id: string
          id_document_url: string | null
          id_expiry_date: string
          id_number: string
          id_type: string
          languages_spoken: string[] | null
          nationality: string
          phone_number: string
          postal_code: string
          rejection_reason: string | null
          state: string
          status: string
          swift_code: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          address_line_1: string
          address_line_2?: string | null
          address_proof_type?: string | null
          address_proof_url?: string | null
          admin_notes?: string | null
          bank_name?: string | null
          bio?: string | null
          city: string
          country?: string
          created_at?: string | null
          date_of_birth: string
          full_name: string
          hosting_experience?: string | null
          iban?: string | null
          id?: string
          id_document_url?: string | null
          id_expiry_date: string
          id_number: string
          id_type: string
          languages_spoken?: string[] | null
          nationality: string
          phone_number: string
          postal_code: string
          rejection_reason?: string | null
          state: string
          status?: string
          swift_code?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          address_line_1?: string
          address_line_2?: string | null
          address_proof_type?: string | null
          address_proof_url?: string | null
          admin_notes?: string | null
          bank_name?: string | null
          bio?: string | null
          city?: string
          country?: string
          created_at?: string | null
          date_of_birth?: string
          full_name?: string
          hosting_experience?: string | null
          iban?: string | null
          id?: string
          id_document_url?: string | null
          id_expiry_date?: string
          id_number?: string
          id_type?: string
          languages_spoken?: string[] | null
          nationality?: string
          phone_number?: string
          postal_code?: string
          rejection_reason?: string | null
          state?: string
          status?: string
          swift_code?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "host_kyc_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      lawyer_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          lawyer_id: string
          message: string | null
          property_id: string | null
          request_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          lawyer_id: string
          message?: string | null
          property_id?: string | null
          request_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          lawyer_id?: string
          message?: string | null
          property_id?: string | null
          request_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_requests_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          address: string | null
          availability_status: string | null
          bio: string | null
          city: string
          consultation_fee: number | null
          created_at: string | null
          email: string
          experience_years: number | null
          full_name: string
          id: string
          license_number: string
          phone: string
          profile_photo_url: string | null
          specializations: string[]
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          availability_status?: string | null
          bio?: string | null
          city: string
          consultation_fee?: number | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          license_number: string
          phone: string
          profile_photo_url?: string | null
          specializations?: string[]
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          availability_status?: string | null
          bio?: string | null
          city?: string
          consultation_fee?: number | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          license_number?: string
          phone?: string
          profile_photo_url?: string | null
          specializations?: string[]
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          escrow_release_reason: string | null
          escrow_released_at: string | null
          escrow_status: string | null
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
          escrow_release_reason?: string | null
          escrow_released_at?: string | null
          escrow_status?: string | null
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
          escrow_release_reason?: string | null
          escrow_released_at?: string | null
          escrow_status?: string | null
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
          id_verified: boolean | null
          is_superhost: boolean | null
          kyc_approved_at: string | null
          kyc_submitted_at: string | null
          languages_spoken: string[] | null
          last_login_at: string | null
          name: string | null
          ownership_verified: boolean | null
          response_rate: number | null
          role: Database["public"]["Enums"]["app_role"]
          spoken_languages: Json | null
          total_reviews: number | null
          transaction_count: number | null
          trust_score: number | null
          updated_at: string
          verification_date: string | null
          verified_host: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email: string
          id: string
          id_verified?: boolean | null
          is_superhost?: boolean | null
          kyc_approved_at?: string | null
          kyc_submitted_at?: string | null
          languages_spoken?: string[] | null
          last_login_at?: string | null
          name?: string | null
          ownership_verified?: boolean | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          spoken_languages?: Json | null
          total_reviews?: number | null
          transaction_count?: number | null
          trust_score?: number | null
          updated_at?: string
          verification_date?: string | null
          verified_host?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email?: string
          id?: string
          id_verified?: boolean | null
          is_superhost?: boolean | null
          kyc_approved_at?: string | null
          kyc_submitted_at?: string | null
          languages_spoken?: string[] | null
          last_login_at?: string | null
          name?: string | null
          ownership_verified?: boolean | null
          response_rate?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          spoken_languages?: Json | null
          total_reviews?: number | null
          transaction_count?: number | null
          trust_score?: number | null
          updated_at?: string
          verification_date?: string | null
          verified_host?: boolean | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: string
          availability_status: string | null
          bathrooms: string | null
          bedrooms: string | null
          cancellation_policy: string | null
          category: string
          check_in_time: string | null
          check_out_time: string | null
          city: string
          commission_rate: number | null
          condition: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          contract_digitally_available: boolean | null
          created_at: string
          description: string | null
          district: string | null
          features: Json | null
          fees: Json | null
          financing_available: boolean | null
          floor_number: string | null
          full_address: string | null
          furnished: boolean | null
          holibayt_pay_eligible: boolean | null
          house_rules: Json | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_hot_deal: boolean | null
          is_new: boolean | null
          is_verified: boolean | null
          last_verified_at: string | null
          latitude: number | null
          location: string
          longitude: number | null
          minimum_rental_term: string | null
          new_build: boolean | null
          occupancy_available_from: string | null
          owner_account_id: string | null
          pets_allowed: boolean | null
          price: string
          price_currency: string | null
          price_type: string
          property_type: string
          safety_features: Json | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verified: boolean | null
          view_count: number | null
        }
        Insert: {
          area: string
          availability_status?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          cancellation_policy?: string | null
          category: string
          check_in_time?: string | null
          check_out_time?: string | null
          city: string
          commission_rate?: number | null
          condition?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          contract_digitally_available?: boolean | null
          created_at?: string
          description?: string | null
          district?: string | null
          features?: Json | null
          fees?: Json | null
          financing_available?: boolean | null
          floor_number?: string | null
          full_address?: string | null
          furnished?: boolean | null
          holibayt_pay_eligible?: boolean | null
          house_rules?: Json | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_hot_deal?: boolean | null
          is_new?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          minimum_rental_term?: string | null
          new_build?: boolean | null
          occupancy_available_from?: string | null
          owner_account_id?: string | null
          pets_allowed?: boolean | null
          price: string
          price_currency?: string | null
          price_type: string
          property_type: string
          safety_features?: Json | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verified?: boolean | null
          view_count?: number | null
        }
        Update: {
          area?: string
          availability_status?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          cancellation_policy?: string | null
          category?: string
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string
          commission_rate?: number | null
          condition?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          contract_digitally_available?: boolean | null
          created_at?: string
          description?: string | null
          district?: string | null
          features?: Json | null
          fees?: Json | null
          financing_available?: boolean | null
          floor_number?: string | null
          full_address?: string | null
          furnished?: boolean | null
          holibayt_pay_eligible?: boolean | null
          house_rules?: Json | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_hot_deal?: boolean | null
          is_new?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          minimum_rental_term?: string | null
          new_build?: boolean | null
          occupancy_available_from?: string | null
          owner_account_id?: string | null
          pets_allowed?: boolean | null
          price?: string
          price_currency?: string | null
          price_type?: string
          property_type?: string
          safety_features?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verified?: boolean | null
          view_count?: number | null
        }
        Relationships: []
      }
      property_views: {
        Row: {
          created_at: string | null
          id: string
          property_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_payments: {
        Row: {
          agreement_id: string
          amount: number
          created_at: string | null
          currency: string | null
          due_date: string
          host_user_id: string
          id: string
          late_fee: number | null
          notes: string | null
          payment_date: string | null
          payment_intent_id: string | null
          status: string | null
          stripe_payment_id: string | null
          tenant_user_id: string
          updated_at: string | null
        }
        Insert: {
          agreement_id: string
          amount: number
          created_at?: string | null
          currency?: string | null
          due_date: string
          host_user_id: string
          id?: string
          late_fee?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_intent_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          tenant_user_id: string
          updated_at?: string | null
        }
        Update: {
          agreement_id?: string
          amount?: number
          created_at?: string | null
          currency?: string | null
          due_date?: string
          host_user_id?: string
          id?: string
          late_fee?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_intent_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          tenant_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "rental_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_agreements: {
        Row: {
          agreement_pdf_url: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          currency: string
          deposit_amount: number
          end_date: string | null
          expires_at: string | null
          host_signature_data: Json | null
          host_signed_at: string | null
          host_user_id: string
          house_rules: Json | null
          id: string
          lease_duration_months: number
          monthly_rent: number
          payment_terms: Json | null
          property_id: string
          renewal_terms: Json | null
          renewed_from: string | null
          special_clauses: string | null
          start_date: string
          status: string
          template_version: string | null
          tenant_signature_data: Json | null
          tenant_signed_at: string | null
          tenant_user_id: string | null
          updated_at: string | null
          utilities_included: Json | null
        }
        Insert: {
          agreement_pdf_url?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          deposit_amount: number
          end_date?: string | null
          expires_at?: string | null
          host_signature_data?: Json | null
          host_signed_at?: string | null
          host_user_id: string
          house_rules?: Json | null
          id?: string
          lease_duration_months: number
          monthly_rent: number
          payment_terms?: Json | null
          property_id: string
          renewal_terms?: Json | null
          renewed_from?: string | null
          special_clauses?: string | null
          start_date: string
          status?: string
          template_version?: string | null
          tenant_signature_data?: Json | null
          tenant_signed_at?: string | null
          tenant_user_id?: string | null
          updated_at?: string | null
          utilities_included?: Json | null
        }
        Update: {
          agreement_pdf_url?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          deposit_amount?: number
          end_date?: string | null
          expires_at?: string | null
          host_signature_data?: Json | null
          host_signed_at?: string | null
          host_user_id?: string
          house_rules?: Json | null
          id?: string
          lease_duration_months?: number
          monthly_rent?: number
          payment_terms?: Json | null
          property_id?: string
          renewal_terms?: Json | null
          renewed_from?: string | null
          special_clauses?: string | null
          start_date?: string
          status?: string
          template_version?: string | null
          tenant_signature_data?: Json | null
          tenant_signed_at?: string | null
          tenant_user_id?: string | null
          updated_at?: string | null
          utilities_included?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_agreements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_agreements_renewed_from_fkey"
            columns: ["renewed_from"]
            isOneToOne: false
            referencedRelation: "rental_agreements"
            referencedColumns: ["id"]
          },
        ]
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
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          notification_enabled: boolean | null
          search_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          notification_enabled?: boolean | null
          search_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          notification_enabled?: boolean | null
          search_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      zone_statistics: {
        Row: {
          average_price_buy: number | null
          average_price_rent: number | null
          average_price_short_stay: number | null
          city: string
          commute_to_downtown_minutes: number | null
          created_at: string | null
          id: string
          monthly_views: number | null
          popularity_index: number | null
          safety_score: number | null
          updated_at: string | null
          verified_percentage: number | null
          zone_name: string
        }
        Insert: {
          average_price_buy?: number | null
          average_price_rent?: number | null
          average_price_short_stay?: number | null
          city: string
          commute_to_downtown_minutes?: number | null
          created_at?: string | null
          id?: string
          monthly_views?: number | null
          popularity_index?: number | null
          safety_score?: number | null
          updated_at?: string | null
          verified_percentage?: number | null
          zone_name: string
        }
        Update: {
          average_price_buy?: number | null
          average_price_rent?: number | null
          average_price_short_stay?: number | null
          city?: string
          commute_to_downtown_minutes?: number | null
          created_at?: string | null
          id?: string
          monthly_views?: number | null
          popularity_index?: number | null
          safety_score?: number | null
          updated_at?: string | null
          verified_percentage?: number | null
          zone_name?: string
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
      calculate_avg_booking_value: {
        Args: { days_back?: number }
        Returns: number
      }
      calculate_avg_response_time: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      calculate_conversion_rate: {
        Args: { days_back?: number }
        Returns: number
      }
      calculate_end_date: {
        Args: { duration: number; start_d: string }
        Returns: string
      }
      calculate_platform_gmv: {
        Args: { days_back?: number }
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
      is_platform_in_maintenance: {
        Args: Record<PropertyKey, never>
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
