import { useEffect, useState } from 'react'

import { supabase } from '../../services/supabase'
import { getTables } from '../../services/tables'
import type { RsvpRecord, TableRecord } from '../../types/database'

function toDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function matchesQuery(rsvp: RsvpRecord, normalizedQuery: string, queryDigits: string): boolean {
  const fullName = `${rsvp.first_name} ${rsvp.last_name}`.toLowerCase()
  const phoneDigits = toDigits(rsvp.phone)

  return (
    fullName.includes(normalizedQuery) ||
    (queryDigits.length > 0 && phoneDigits.includes(queryDigits))
  )
}

export default function GuestLookup() {
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([])
  const [tables, setTables] = useState<TableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null)

  useEffect(() => {
    const loadGuestData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!supabase) {
          throw new Error('Missing Supabase environment variables.')
        }

        const [rsvpsResult, tablesResult] = await Promise.all([
          supabase.from('rsvps').select('*').eq('attendance', 'yes'),
          getTables(),
        ])

        if (rsvpsResult.error) {
          throw rsvpsResult.error
        }

        setRsvps((rsvpsResult.data ?? []) as RsvpRecord[])
        setTables(tablesResult)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load guest data.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadGuestData()
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmittedQuery(query)
  }

  if (loading) {
    return <div className="guest-lookup-loading">Loading guest data...</div>
  }

  if (error) {
    return <div className="admin-edit-error">Error: {error}</div>
  }

  const normalizedQuery = submittedQuery?.trim().toLowerCase() ?? ''
  const queryDigits = toDigits(submittedQuery ?? '')
  const matches =
    submittedQuery !== null && normalizedQuery
      ? rsvps.filter((rsvp) => matchesQuery(rsvp, normalizedQuery, queryDigits))
      : []

  return (
    <div className="guest-lookup">
      <p className="guest-lookup-note">
        Preview of what a guest sees after scanning the table QR code. Search
        matches confirmed (Yes) RSVPs by name or phone number.
      </p>

      <section className="guest-lookup-section">
        <div className="guest-lookup-content">
          <h2>Find Your Seat</h2>
          <p>Enter your full name or phone number to see where you&rsquo;re seated.</p>

          <form className="guest-lookup-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Name or phone number"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Name or phone number"
            />
            <button type="submit">Find My Seat</button>
          </form>

          {submittedQuery !== null && normalizedQuery && (
            <div className="guest-lookup-results">
              {matches.length === 0 && (
                <p className="guest-lookup-message">
                  We couldn&rsquo;t find your RSVP. Please check with the host.
                </p>
              )}

              {matches.map((rsvp) => {
                const table = tables.find((t) => t.id === rsvp.table_id)

                return (
                  <div key={rsvp.id} className="guest-lookup-result">
                    <p className="guest-lookup-welcome">
                      Welcome, {rsvp.first_name}!
                    </p>

                    {table ? (
                      <p>
                        You&rsquo;re seated at <strong>{table.name}</strong>,
                        with {rsvp.guest_count} seat
                        {rsvp.guest_count === 1 ? '' : 's'} reserved for your
                        party.
                      </p>
                    ) : (
                      <p>Your table assignment is coming soon.</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
