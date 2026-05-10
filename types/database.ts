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
          created_at: string
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
          created_at?: string
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
          created_at?: string
        }
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

