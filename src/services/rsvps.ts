import { supabase } from '../services/supabase'

export interface RsvpDashboardStats {
  total_responses: number;
  yes_responses: number;
  no_responses: number;
  maybe_responses: number;
  total_attending_guests: number;
  total_men: number;
  total_women: number;
  total_children: number;
}

export async function getRsvpDashboardStats(): Promise<RsvpDashboardStats> {
  const { data, error } = await supabase.rpc(
    "get_rsvp_dashboard_stats",
  );

  if (error) {
    throw new Error(error.message);
  }

  const stats = data?.[0];

  if (!stats) {
    throw new Error("No RSVP statistics were returned.");
  }

  return stats;
}