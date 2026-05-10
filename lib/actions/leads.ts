"use server"

import { supabase } from "../supabase";
import { Database } from "../../types/database";
import { revalidatePath } from "next/cache";

type Lead = Database['public']['Tables']['leads']['Row'];
export type NewLead = Database['public']['Tables']['leads']['Insert'];


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function createLead(lead: NewLead) {
  const { data, error } = await db
    .from('leads')
    .insert([lead])
    .select()
    .single();


  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/leads');
  return data;
}

export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*, vehicles(*), dealerships(name)')
    .order('created_at', { ascending: false });


  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data;
}

export async function updateLeadStatus(id: string, status: string) {
  const { data, error } = await db
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single();



  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/leads');
  return data;
}
