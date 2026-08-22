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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analytics_daily_rollups: {
        Row: {
          checkout_completes: number
          checkout_starts: number
          day: string
          email_clicks: number
          email_opens: number
          follows: number
          read_completes: number
          scope_id: string
          scope_type: string
          subscribes: number
          unfollows: number
          unsubscribes: number
          updated_at: string
          views: number
        }
        Insert: {
          checkout_completes?: number
          checkout_starts?: number
          day: string
          email_clicks?: number
          email_opens?: number
          follows?: number
          read_completes?: number
          scope_id?: string
          scope_type: string
          subscribes?: number
          unfollows?: number
          unsubscribes?: number
          updated_at?: string
          views?: number
        }
        Update: {
          checkout_completes?: number
          checkout_starts?: number
          day?: string
          email_clicks?: number
          email_opens?: number
          follows?: number
          read_completes?: number
          scope_id?: string
          scope_type?: string
          subscribes?: number
          unfollows?: number
          unsubscribes?: number
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          actor_user_id: string | null
          author_id: string | null
          event_name: Database["public"]["Enums"]["analytics_event_name"]
          id: string
          occurred_at: string
          payload: Json
          post_id: string | null
          publication_id: string | null
          session_hash: string | null
        }
        Insert: {
          actor_user_id?: string | null
          author_id?: string | null
          event_name: Database["public"]["Enums"]["analytics_event_name"]
          id?: string
          occurred_at?: string
          payload?: Json
          post_id?: string | null
          publication_id?: string | null
          session_hash?: string | null
        }
        Update: {
          actor_user_id?: string | null
          author_id?: string | null
          event_name?: Database["public"]["Enums"]["analytics_event_name"]
          id?: string
          occurred_at?: string
          payload?: Json
          post_id?: string | null
          publication_id?: string | null
          session_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          bound_post_id: string
          collection_id: string
          created_at: string
          id: string
          sort_order: number
          source_reference_id: string
        }
        Insert: {
          bound_post_id: string
          collection_id: string
          created_at?: string
          id?: string
          sort_order?: number
          source_reference_id: string
        }
        Update: {
          bound_post_id?: string
          collection_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          source_reference_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          id: string
          intent: string | null
          name: string
          owner_user_id: string
          promoted_to_space_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent?: string | null
          name: string
          owner_user_id: string
          promoted_to_space_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intent?: string | null
          name?: string
          owner_user_id?: string
          promoted_to_space_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          created_at: string
          id: string
          post_id: string
          text: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          post_id: string
          text: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          post_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_accounts: {
        Row: {
          charges_enabled: boolean
          created_at: string
          details_submitted: boolean
          onboarding_status: Database["public"]["Enums"]["connect_onboarding_status"]
          owner_id: string
          owner_type: string
          payouts_enabled: boolean
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          onboarding_status?: Database["public"]["Enums"]["connect_onboarding_status"]
          owner_id: string
          owner_type: string
          payouts_enabled?: boolean
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          onboarding_status?: Database["public"]["Enums"]["connect_onboarding_status"]
          owner_id?: string
          owner_type?: string
          payouts_enabled?: boolean
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_suppressions: {
        Row: {
          created_at: string
          email: string
          reason: string
          resend_event_id: string | null
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          reason: string
          resend_event_id?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          reason?: string
          resend_event_id?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["follow_target_type"]
        }
        Insert: {
          created_at?: string
          follower_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["follow_target_type"]
        }
        Update: {
          created_at?: string
          follower_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["follow_target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_space_activity: {
        Row: {
          created_at: string
          id: string
          kind: string
          space_id: string
          summary: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          space_id: string
          summary: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          space_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_space_activity_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "knowledge_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_spaces: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          owner_user_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          owner_user_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          owner_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_spaces_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: true
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_spaces_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["ledger_entry_kind"]
          membership_id: string | null
          occurred_at: string
          owner_id: string
          owner_type: string
          stripe_event_id: string | null
          stripe_object_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          kind: Database["public"]["Enums"]["ledger_entry_kind"]
          membership_id?: string | null
          occurred_at?: string
          owner_id: string
          owner_type: string
          stripe_event_id?: string | null
          stripe_object_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["ledger_entry_kind"]
          membership_id?: string | null
          occurred_at?: string
          owner_id?: string
          owner_type?: string
          stripe_event_id?: string | null
          stripe_object_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_stripe_event_id_fkey"
            columns: ["stripe_event_id"]
            isOneToOne: false
            referencedRelation: "stripe_events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      library_items: {
        Row: {
          bound_post_id: string
          created_at: string
          id: string
          post_id: string | null
          source_reference_id: string | null
          user_id: string
        }
        Insert: {
          bound_post_id: string
          created_at?: string
          id?: string
          post_id?: string | null
          source_reference_id?: string | null
          user_id: string
        }
        Update: {
          bound_post_id?: string
          created_at?: string
          id?: string
          post_id?: string | null
          source_reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_tiers: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string
          description: string
          id: string
          interval: Database["public"]["Enums"]["membership_interval"] | null
          is_active: boolean
          is_free: boolean
          name: string
          owner_id: string
          owner_type: string
          sort_order: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          interval?: Database["public"]["Enums"]["membership_interval"] | null
          is_active?: boolean
          is_free?: boolean
          name: string
          owner_id: string
          owner_type: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          interval?: Database["public"]["Enums"]["membership_interval"] | null
          is_active?: boolean
          is_free?: boolean
          name?: string
          owner_id?: string
          owner_type?: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          ended_at: string | null
          id: string
          last_invoice_status: string | null
          status: Database["public"]["Enums"]["membership_status"]
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          ended_at?: string | null
          id?: string
          last_invoice_status?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          ended_at?: string | null
          id?: string
          last_invoice_status?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          notes: string | null
          report_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          notes?: string | null
          report_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_audit_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_deliveries: {
        Row: {
          created_at: string
          email: string
          error: string | null
          id: string
          newsletter_id: string
          resend_message_id: string | null
          sent_at: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          error?: string | null
          id?: string
          newsletter_id: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          error?: string | null
          id?: string
          newsletter_id?: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_deliveries_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          author_id: string | null
          created_at: string
          created_by: string | null
          distribution_mode: Database["public"]["Enums"]["distribution_mode"]
          html_body: string
          id: string
          post_id: string | null
          preview_text: string | null
          publication_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["newsletter_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          created_by?: string | null
          distribution_mode?: Database["public"]["Enums"]["distribution_mode"]
          html_body?: string
          id?: string
          post_id?: string | null
          preview_text?: string | null
          publication_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["newsletter_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          created_by?: string | null
          distribution_mode?: Database["public"]["Enums"]["distribution_mode"]
          html_body?: string
          id?: string
          post_id?: string | null
          preview_text?: string | null
          publication_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["newsletter_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletters_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletters_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          link_path: string | null
          post_id: string | null
          publication_id: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind: string
          link_path?: string | null
          post_id?: string | null
          publication_id?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link_path?: string | null
          post_id?: string | null
          publication_id?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      passage_annotations: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          note: string
          owner_user_id: string
          passage: Json
          source_reference_id: string
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          note?: string
          owner_user_id: string
          passage: Json
          source_reference_id: string
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          note?: string
          owner_user_id?: string
          passage?: Json
          source_reference_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passage_annotations_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passage_annotations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passage_annotations_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_support_cases: {
        Row: {
          created_at: string
          id: string
          membership_id: string | null
          notes: string
          owner_id: string | null
          owner_type: string | null
          reporter_user_id: string | null
          status: string
          stripe_charge_id: string | null
          stripe_dispute_id: string | null
          stripe_refund_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          membership_id?: string | null
          notes?: string
          owner_id?: string | null
          owner_type?: string | null
          reporter_user_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_dispute_id?: string | null
          stripe_refund_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          membership_id?: string | null
          notes?: string
          owner_id?: string | null
          owner_type?: string | null
          reporter_user_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_dispute_id?: string | null
          stripe_refund_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_support_cases_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_support_cases_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_revisions: {
        Row: {
          canonical_url: string | null
          category_id: string
          cover_path: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          post_id: string
          published_at: string
          revision_number: number
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          summary: string
          tags: string[]
          title: string
        }
        Insert: {
          canonical_url?: string | null
          category_id: string
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          post_id: string
          published_at?: string
          revision_number: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          summary: string
          tags?: string[]
          title: string
        }
        Update: {
          canonical_url?: string | null
          category_id?: string
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          post_id?: string
          published_at?: string
          revision_number?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          summary?: string
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_revisions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_slug_redirects: {
        Row: {
          created_at: string
          old_slug: string
          post_id: string
        }
        Insert: {
          created_at?: string
          old_slug: string
          post_id: string
        }
        Update: {
          created_at?: string
          old_slug?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_slug_redirects_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_source_tombstones: {
        Row: {
          author_id: string | null
          created_at: string
          frozen_snapshot: Json
          post_id: string
          reason: string
          title: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          frozen_snapshot: Json
          post_id: string
          reason?: string
          title: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          frozen_snapshot?: Json
          post_id?: string
          reason?: string
          title?: string
        }
        Relationships: []
      }
      post_structural_metadata: {
        Row: {
          author_id: string | null
          citations: Json
          extracted_at: string
          id: string
          post_id: string
          published_at: string | null
          referenced_post_ids: string[]
          revision_id: string | null
          revision_number: number
          sections: Json
          tags: string[]
        }
        Insert: {
          author_id?: string | null
          citations?: Json
          extracted_at?: string
          id?: string
          post_id: string
          published_at?: string | null
          referenced_post_ids?: string[]
          revision_id?: string | null
          revision_number: number
          sections?: Json
          tags?: string[]
        }
        Update: {
          author_id?: string | null
          citations?: Json
          extracted_at?: string
          id?: string
          post_id?: string
          published_at?: string | null
          referenced_post_ids?: string[]
          revision_id?: string | null
          revision_number?: number
          sections?: Json
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "post_structural_metadata_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_structural_metadata_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "post_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          access_level: Database["public"]["Enums"]["post_access_level"]
          author_id: string
          canonical_url: string | null
          category_id: string
          content_hash: string | null
          cover_path: string | null
          cover_url: string | null
          created_at: string
          description: string
          distribute_email: boolean
          distribute_followers: boolean
          distribute_web: boolean
          distribution_mode: Database["public"]["Enums"]["distribution_mode"]
          id: string
          preview_percent: number
          publication_id: string | null
          published_at: string | null
          required_tier_id: string | null
          reuse_private_spaces: boolean
          reuse_public_lineage: boolean
          reuse_quotation: boolean
          reuse_synthesis: boolean
          scheduled_at: string | null
          section_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          status: Database["public"]["Enums"]["post_status"]
          submission_status:
            | Database["public"]["Enums"]["submission_status"]
            | null
          summary: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["post_access_level"]
          author_id: string
          canonical_url?: string | null
          category_id: string
          content_hash?: string | null
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          description: string
          distribute_email?: boolean
          distribute_followers?: boolean
          distribute_web?: boolean
          distribution_mode?: Database["public"]["Enums"]["distribution_mode"]
          id?: string
          preview_percent?: number
          publication_id?: string | null
          published_at?: string | null
          required_tier_id?: string | null
          reuse_private_spaces?: boolean
          reuse_public_lineage?: boolean
          reuse_quotation?: boolean
          reuse_synthesis?: boolean
          scheduled_at?: string | null
          section_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          submission_status?:
            | Database["public"]["Enums"]["submission_status"]
            | null
          summary: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["post_access_level"]
          author_id?: string
          canonical_url?: string | null
          category_id?: string
          content_hash?: string | null
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          distribute_email?: boolean
          distribute_followers?: boolean
          distribute_web?: boolean
          distribution_mode?: Database["public"]["Enums"]["distribution_mode"]
          id?: string
          preview_percent?: number
          publication_id?: string | null
          published_at?: string | null
          required_tier_id?: string | null
          reuse_private_spaces?: boolean
          reuse_public_lineage?: boolean
          reuse_quotation?: boolean
          reuse_synthesis?: boolean
          scheduled_at?: string | null
          section_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          submission_status?:
            | Database["public"]["Enums"]["submission_status"]
            | null
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_required_tier_id_fkey"
            columns: ["required_tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "publication_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          expertise_topics: string[]
          facebook_id: string | null
          id: string
          is_admin: boolean
          linkedin_id: string | null
          name: string
          twitter_id: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_path?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise_topics?: string[]
          facebook_id?: string | null
          id: string
          is_admin?: boolean
          linkedin_id?: string | null
          name?: string
          twitter_id?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_path?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise_topics?: string[]
          facebook_id?: string | null
          id?: string
          is_admin?: boolean
          linkedin_id?: string | null
          name?: string
          twitter_id?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      publication_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["submission_status"] | null
          id: string
          metadata: Json
          notes: string | null
          post_id: string | null
          publication_id: string
          to_status: Database["public"]["Enums"]["submission_status"] | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["submission_status"] | null
          id?: string
          metadata?: Json
          notes?: string | null
          post_id?: string | null
          publication_id: string
          to_status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["submission_status"] | null
          id?: string
          metadata?: Json
          notes?: string | null
          post_id?: string | null
          publication_id?: string
          to_status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_audit_log_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_audit_log_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_members: {
        Row: {
          created_at: string
          publication_id: string
          role: Database["public"]["Enums"]["publication_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          publication_id: string
          role: Database["public"]["Enums"]["publication_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          publication_id?: string
          role?: Database["public"]["Enums"]["publication_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_members_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_sections: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          publication_id: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          publication_id: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          publication_id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_sections_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          about: string | null
          accent_color: string | null
          cover_path: string | null
          cover_url: string | null
          created_at: string
          description: string
          id: string
          logo_path: string | null
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          tagline: string | null
          updated_at: string
          welcome_email_body: string | null
          welcome_email_enabled: boolean
          welcome_email_subject: string | null
        }
        Insert: {
          about?: string | null
          accent_color?: string | null
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          logo_path?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          tagline?: string | null
          updated_at?: string
          welcome_email_body?: string | null
          welcome_email_enabled?: boolean
          welcome_email_subject?: string | null
        }
        Update: {
          about?: string | null
          accent_color?: string | null
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          logo_path?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          tagline?: string | null
          updated_at?: string
          welcome_email_body?: string | null
          welcome_email_enabled?: boolean
          welcome_email_subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_path_items: {
        Row: {
          bound_post_id: string
          created_at: string
          id: string
          path_id: string
          relationship_label:
            | Database["public"]["Enums"]["reading_path_relationship"]
            | null
          sort_order: number
          transition_note: string | null
        }
        Insert: {
          bound_post_id: string
          created_at?: string
          id?: string
          path_id: string
          relationship_label?:
            | Database["public"]["Enums"]["reading_path_relationship"]
            | null
          sort_order?: number
          transition_note?: string | null
        }
        Update: {
          bound_post_id?: string
          created_at?: string
          id?: string
          path_id?: string
          relationship_label?:
            | Database["public"]["Enums"]["reading_path_relationship"]
            | null
          sort_order?: number
          transition_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "reading_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_paths: {
        Row: {
          created_at: string
          created_by: string | null
          estimated_minutes: number | null
          id: string
          is_published: boolean
          purpose: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean
          purpose: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean
          purpose?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          position: number
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          position?: number
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          position?: number
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resend_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
        }
        Relationships: []
      }
      source_references: {
        Row: {
          bound_post_id: string
          created_at: string
          frozen_snapshot: Json | null
          id: string
          owner_user_id: string
          passage: Json | null
          post_revision_id: string | null
          revision_number: number
        }
        Insert: {
          bound_post_id: string
          created_at?: string
          frozen_snapshot?: Json | null
          id?: string
          owner_user_id: string
          passage?: Json | null
          post_revision_id?: string | null
          revision_number: number
        }
        Update: {
          bound_post_id?: string
          created_at?: string
          frozen_snapshot?: Json | null
          id?: string
          owner_user_id?: string
          passage?: Json | null
          post_revision_id?: string | null
          revision_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "source_references_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_references_post_revision_id_fkey"
            columns: ["post_revision_id"]
            isOneToOne: false
            referencedRelation: "post_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string
          stripe_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          stripe_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          api_version: string | null
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
        }
        Insert: {
          api_version?: string | null
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
        }
        Update: {
          api_version?: string | null
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          confirmed_at: string | null
          consent_at: string | null
          consent_attestation: string | null
          created_at: string
          email: string
          id: string
          source: Database["public"]["Enums"]["subscription_source"]
          status: Database["public"]["Enums"]["subscription_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["subscription_target_type"]
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
          welcome_sent_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          consent_at?: string | null
          consent_attestation?: string | null
          created_at?: string
          email: string
          id?: string
          source?: Database["public"]["Enums"]["subscription_source"]
          status?: Database["public"]["Enums"]["subscription_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["subscription_target_type"]
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
          welcome_sent_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          consent_at?: string | null
          consent_attestation?: string | null
          created_at?: string
          email?: string
          id?: string
          source?: Database["public"]["Enums"]["subscription_source"]
          status?: Database["public"]["Enums"]["subscription_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["subscription_target_type"]
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
          welcome_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          notify_email: boolean
          reading_progress_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          notify_email?: boolean
          reading_progress_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          notify_email?: boolean
          reading_progress_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      public_platform_stats: {
        Args: never
        Returns: {
          authors_with_posts: number
          categories_with_posts: number
          published_posts: number
        }[]
      }
      public_post_counts_by_author: {
        Args: { p_author_id?: string }
        Returns: {
          author_id: string
          post_count: number
        }[]
      }
      public_post_counts_by_category: {
        Args: { p_category_id?: string }
        Returns: {
          category_id: string
          post_count: number
        }[]
      }
      user_can_access_post: { Args: { p_post_id: string }; Returns: boolean }
    }
    Enums: {
      analytics_event_name:
        | "view"
        | "read_complete"
        | "follow"
        | "unfollow"
        | "subscribe"
        | "unsubscribe"
        | "checkout_start"
        | "checkout_complete"
        | "membership_cancel"
        | "membership_refund"
        | "email_open"
        | "email_click"
        | "library_save"
        | "collection_created"
        | "source_added_to_collection"
        | "collection_intent_set"
        | "annotation_created"
        | "space_promoted"
        | "reading_path_saved"
        | "reading_path_started"
      connect_onboarding_status:
        | "not_started"
        | "pending"
        | "restricted"
        | "complete"
      distribution_mode: "web_only" | "email_only" | "web_and_email"
      follow_target_type: "author" | "category" | "publication"
      ledger_entry_kind:
        | "gross"
        | "platform_fee"
        | "stripe_fee"
        | "refund"
        | "dispute"
        | "dispute_reversal"
        | "payout"
        | "payout_failure"
        | "adjustment"
      membership_interval: "month" | "year"
      membership_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
      newsletter_status:
        | "draft"
        | "preview"
        | "scheduled"
        | "sending"
        | "sent"
        | "failed"
        | "cancelled"
      post_access_level: "public" | "members" | "paid"
      post_status: "draft" | "scheduled" | "published" | "archived"
      publication_member_role: "owner" | "editor" | "contributor"
      reading_path_relationship:
        | "introduces"
        | "extends"
        | "applies"
        | "challenges"
      report_status: "open" | "reviewed" | "dismissed" | "actioned"
      report_target_type: "post" | "comment"
      submission_status:
        | "submitted"
        | "changes_requested"
        | "accepted"
        | "rejected"
        | "scheduled"
        | "published"
      subscription_source: "web" | "import" | "welcome" | "admin"
      subscription_status: "pending" | "active" | "unsubscribed" | "suppressed"
      subscription_target_type: "publication" | "author"
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
      analytics_event_name: [
        "view",
        "read_complete",
        "follow",
        "unfollow",
        "subscribe",
        "unsubscribe",
        "checkout_start",
        "checkout_complete",
        "membership_cancel",
        "membership_refund",
        "email_open",
        "email_click",
        "library_save",
        "collection_created",
        "source_added_to_collection",
        "collection_intent_set",
        "annotation_created",
        "space_promoted",
        "reading_path_saved",
        "reading_path_started",
      ],
      connect_onboarding_status: [
        "not_started",
        "pending",
        "restricted",
        "complete",
      ],
      distribution_mode: ["web_only", "email_only", "web_and_email"],
      follow_target_type: ["author", "category", "publication"],
      ledger_entry_kind: [
        "gross",
        "platform_fee",
        "stripe_fee",
        "refund",
        "dispute",
        "dispute_reversal",
        "payout",
        "payout_failure",
        "adjustment",
      ],
      membership_interval: ["month", "year"],
      membership_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
      newsletter_status: [
        "draft",
        "preview",
        "scheduled",
        "sending",
        "sent",
        "failed",
        "cancelled",
      ],
      post_access_level: ["public", "members", "paid"],
      post_status: ["draft", "scheduled", "published", "archived"],
      publication_member_role: ["owner", "editor", "contributor"],
      reading_path_relationship: [
        "introduces",
        "extends",
        "applies",
        "challenges",
      ],
      report_status: ["open", "reviewed", "dismissed", "actioned"],
      report_target_type: ["post", "comment"],
      submission_status: [
        "submitted",
        "changes_requested",
        "accepted",
        "rejected",
        "scheduled",
        "published",
      ],
      subscription_source: ["web", "import", "welcome", "admin"],
      subscription_status: ["pending", "active", "unsubscribed", "suppressed"],
      subscription_target_type: ["publication", "author"],
    },
  },
} as const
