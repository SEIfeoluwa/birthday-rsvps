import type { NewRsvpRecord, RsvpRecord } from '../types/database'
import type { RSVPInput } from '../schemas/rsvpSchema'

import { supabase } from './supabase'

export function toRsvpRecord(input: RSVPInput): NewRsvpRecord {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    attendance: input.attendance,
    guest_count: input.guestCount,
    message: input.message?.trim() || null,
  }
}

export async function createRsvp(input: RSVPInput): Promise<RsvpRecord> {
  if (!supabase) {
    throw new Error('Missing Supabase environment variables')
  }

  const { data, error } = await supabase
    .from('rsvps')
    .insert(toRsvpRecord(input))
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('RSVP was not saved')

  return data
}
