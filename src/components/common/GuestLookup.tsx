import { useState } from 'react'

import { findMyTable } from '../../services/rsvps'
import type { TableLookupResult } from '../../services/rsvps'

export default function GuestLookup() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TableLookupResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const matches = await findMyTable(trimmedQuery)

      setResults(matches)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to search for your RSVP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="guest-lookup">
      <section className="guest-lookup-section">
        <div className="guest-lookup-content">
          <h2>Find Your Seat</h2>
          <p>Enter your full name to see where you&rsquo;re seated.</p>

          <form className="guest-lookup-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="First or last name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="First or last name"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Find My Seat'}
            </button>
          </form>

          {error && <p className="guest-lookup-message">{error}</p>}

          {!error && searched && (
            <div className="guest-lookup-results">
              {results.length === 0 && (
                <p className="guest-lookup-message">
                  We couldn&rsquo;t find your RSVP. Please check with the host.
                </p>
              )}

              {results.map((result, index) => (
                <div key={`${result.firstName}-${result.lastName}-${index}`} className="guest-lookup-result">
                  <p className="guest-lookup-welcome">
                    Welcome, {result.firstName}!
                  </p>

                  {result.tableName ? (
                    <p>
                      You&rsquo;re seated at <strong>{result.tableName}</strong>,
                      with {result.partySize} seat
                      {result.partySize === 1 ? '' : 's'} reserved for your
                      party.
                    </p>
                  ) : (
                    <p>Your table assignment is coming soon.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
