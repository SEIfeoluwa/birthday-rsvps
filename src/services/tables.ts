import { supabase } from './supabase'
import type {
  NewTableRecord,
  RsvpRecord,
  TablePlanRow,
  TableRecord,
  UpdateTableRecord,
} from '../types/database'

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Missing Supabase environment variables.')
  }

  return supabase
}

export async function getTables(): Promise<TableRecord[]> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('tables')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TableRecord[]
}

export async function getTablePlan(): Promise<TablePlanRow[]> {
  const client = getSupabaseClient()

  const { data, error } = await client.rpc('get_table_plan')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TablePlanRow[]
}

export async function createTable(input: NewTableRecord): Promise<TableRecord> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('tables')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TableRecord
}

export async function updateTable(
  id: string,
  input: UpdateTableRecord,
): Promise<TableRecord> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('tables')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TableRecord
}

export async function deleteTable(id: string): Promise<void> {
  const client = getSupabaseClient()

  const { error } = await client.from('tables').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function assignRsvpToTable(
  rsvpId: string,
  tableId: string | null,
): Promise<RsvpRecord> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('rsvps')
    .update({ table_id: tableId })
    .eq('id', rsvpId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as RsvpRecord
}
