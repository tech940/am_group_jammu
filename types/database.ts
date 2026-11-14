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
      // Only the tables the typed client is used for. `used_cars` is not here
      // on purpose: lib/cars/store.ts states its own row type (lib/cars/types.ts).
      // The brands / dealerships / vehicles entries that used to be here
      // described tables that were never created in the real database.
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

