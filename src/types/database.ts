export type AttendanceStatus = 'yes' | 'no' | 'maybe'

export type RsvpRecord = {
  id: string
  first_name: string
  last_name: string
  phone: string
  attendance: AttendanceStatus
  guest_count: number
  male_guest_count: number
  female_guest_count: number
  child_guest_count: number
  message: string | null
}

export type NewRsvpRecord = Omit<RsvpRecord, 'id' | 'guest_count'>

export type UpdateRsvpRecord = Omit<RsvpRecord, 'id' | 'guest_count'>
