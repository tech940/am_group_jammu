export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          banner_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          banner_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          banner_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      dealerships: {
        Row: {
          id: string
          name: string
          brand_id: string | null
          city: string
          address: string
          map_url: string | null
          phone: string | null
          email: string | null
          is_main_branch: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          brand_id?: string | null
          city: string
          address: string
          map_url?: string | null
          phone?: string | null
          email?: string | null
          is_main_branch?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand_id?: string | null
          city?: string
          address?: string
          map_url?: string | null
          phone?: string | null
          email?: string | null
          is_main_branch?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealerships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          id: string
          brand_id: string | null
          name: string
          model_slug: string
          variant: string | null
          price_ex_showroom: number | null
          body_type: string | null
          fuel_type: string | null
          transmission: string | null
          engine_cc: number | null
          power_ps: number | null
          images: string[] | null
          features: Json | null
          specs: Json | null
          is_featured: boolean
          is_used: boolean
          stock_count: number
          created_at: string
        }
        Insert: {
          id?: string
          brand_id?: string | null
          name: string
          model_slug: string
          variant?: string | null
          price_ex_showroom?: number | null
          body_type?: string | null
          fuel_type?: string | null
          transmission?: string | null
          engine_cc?: number | null
          power_ps?: number | null
          images?: string[] | null
          features?: Json | null
          specs?: Json | null
          is_featured?: boolean
          is_used?: boolean
          stock_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string | null
          name?: string
          model_slug?: string
          variant?: string | null
          price_ex_showroom?: number | null
          body_type?: string | null
          fuel_type?: string | null
          transmission?: string | null
          engine_cc?: number | null
          power_ps?: number | null
          images?: string[] | null
          features?: Json | null
          specs?: Json | null
          is_featured?: boolean
          is_used?: boolean
          stock_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          vehicle_id: string | null
          dealership_id: string | null
          inquiry_type: string | null
          message: string | null
          status: string
          intent: string | null
          source_path: string | null
          source_label: string | null
          listing_id: number | null
          listing_title: string | null
          listing_price: number | null
          listing_url: string | null
          assigned_to: string | null
          next_follow_up_at: string | null
          consent: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          vehicle_id?: string | null
          dealership_id?: string | null
          inquiry_type?: string | null
          message?: string | null
          status?: string
          intent?: string | null
          source_path?: string | null
          source_label?: string | null
          listing_id?: number | null
          listing_title?: string | null
          listing_price?: number | null
          listing_url?: string | null
          assigned_to?: string | null
          next_follow_up_at?: string | null
          consent?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          vehicle_id?: string | null
          dealership_id?: string | null
          inquiry_type?: string | null
          message?: string | null
          status?: string
          intent?: string | null
          source_path?: string | null
          source_label?: string | null
          listing_id?: number | null
          listing_title?: string | null
          listing_price?: number | null
          listing_url?: string | null
          assigned_to?: string | null
          next_follow_up_at?: string | null
          consent?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          type: string
          body: string | null
          from_status: string | null
          to_status: string | null
          author: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          body?: string | null
          from_status?: string | null
          to_status?: string | null
          author?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          body?: string | null
          from_status?: string | null
          to_status?: string | null
          author?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
  }
}

