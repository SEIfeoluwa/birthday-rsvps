export type AttendanceStatus = 'yes' | 'no' | 'maybe'

export type RsvpRecord = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  attendance: AttendanceStatus
  guest_count: number
  message: string | null
}

export type NewRsvpRecord = Omit<RsvpRecord, 'id'>
