"use server"

import { getSupabase } from "../supabase";
import { Database } from "../../types/database";
import { revalidatePath } from "next/cache";

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type NewVehicle = Database['public']['Tables']['vehicles']['Insert'];

// Supabase may not be configured (no env vars). Callers degrade gracefully
// rather than the whole module throwing at import time, which is what the
// previous eagerly-created client did.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = () => getSupabase() as any;

export async function getVehicles() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vehicles')
    .select('*, brands(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }

  return data;
}

export async function getFeaturedVehicles() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vehicles')
    .select('*, brands(*)')
    .eq('is_featured', true)
    .limit(6);

  if (error) {
    console.error('Error fetching featured vehicles:', error);
    return [];
  }

  return data;
}

export async function getBrands() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data;
}

export async function addVehicle(vehicle: NewVehicle) {

  const db = client();
  if (!db) throw new Error("Supabase is not configured");
  const { data, error } = await db
    .from('vehicles')
    .insert([vehicle])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/inventory');
  return data;
}

export async function updateVehicle(id: string, updates: Partial<NewVehicle>) {
  const db = client();
  if (!db) throw new Error("Supabase is not configured");
  const { data, error } = await db
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/inventory');
  if (data) {
    const vehicleData = data as Database['public']['Tables']['vehicles']['Row'];
    revalidatePath(`/inventory/${vehicleData.model_slug}`);
  }



  return data;
}

export async function deleteVehicle(id: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/inventory');
}
