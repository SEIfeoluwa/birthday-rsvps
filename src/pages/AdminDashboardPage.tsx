import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../services/supabase'

interface RSVP {
  id: string
  email: string | null
  phone: string | null
  attendance: 'yes' | 'no' | 'maybe'
  guest_count: number
  male_guest_count: number
  female_guest_count: number
  child_guest_count: number
  message: string | null
  first_name: string
  last_name: string
}

interface DashboardStats {
  total_responses: number
  yes_responses: number
  no_responses: number
  maybe_responses: number
  total_attending_guests: number
  total_men: number
  total_women: number
  total_children: number
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          navigate('/admin/login', { replace: true })
          return
        }

        const [rsvpResult, statsResult] = await Promise.all([
          supabase
            .from('rsvps')
            .select('*')
            .order('first_name', { ascending: true }),

          supabase.rpc('get_rsvp_dashboard_stats'),
        ])

        if (rsvpResult.error) {
          throw rsvpResult.error
        }

        if (statsResult.error) {
          throw statsResult.error
        }

        setRsvps((rsvpResult.data ?? []) as RSVP[])

        const dashboardStats = statsResult.data?.[0]

        if (!dashboardStats) {
          throw new Error('No dashboard statistics were returned')
        }

        setStats(dashboardStats as DashboardStats)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while loading the dashboard',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  if (loading) {
    return <div className="admin-loading">Loading...</div>
  }

  if (error) {
    return <div className="admin-error">Error: {error}</div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>

        <button type="button" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {stats && (
        <section className="dashboard-stats">
          <article className="stat-card">
            <h2>{stats.total_responses}</h2>
            <p>Total Responses</p>
          </article>

          <article className="stat-card">
            <h2>{stats.yes_responses}</h2>
            <p>Yes Responses</p>
          </article>

          <article className="stat-card">
            <h2>{stats.no_responses}</h2>
            <p>No Responses</p>
          </article>

          <article className="stat-card">
            <h2>{stats.maybe_responses}</h2>
            <p>Maybe Responses</p>
          </article>

          <article className="stat-card">
            <h2>{stats.total_attending_guests}</h2>
            <p>Total Guests Attending</p>
          </article>

          <article className="stat-card">
            <h2>{stats.total_men}</h2>
            <p>Men</p>
          </article>

          <article className="stat-card">
            <h2>{stats.total_women}</h2>
            <p>Women</p>
          </article>

          <article className="stat-card">
            <h2>{stats.total_children}</h2>
            <p>Children</p>
          </article>
        </section>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Attendance</th>
              <th>Men</th>
              <th>Women</th>
              <th>Children</th>
              <th>Total Guests</th>
              <th>Message</th>
            </tr>
          </thead>

          <tbody>
            {rsvps.length > 0 ? (
              rsvps.map((rsvp) => (
                <tr key={rsvp.id}>
                  <td>{rsvp.first_name}</td>
                  <td>{rsvp.last_name}</td>
                  <td>{rsvp.email || 'N/A'}</td>
                  <td>{rsvp.phone || 'N/A'}</td>

                  <td>
                    <span
                      className={`attendance-badge attendance-${rsvp.attendance}`}
                    >
                      {rsvp.attendance}
                    </span>
                  </td>

                  <td>{rsvp.male_guest_count}</td>
                  <td>{rsvp.female_guest_count}</td>
                  <td>{rsvp.child_guest_count}</td>
                  <td className="guest-count">{rsvp.guest_count}</td>
                  <td className="message-cell">
                    {rsvp.message || 'No message'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="no-data">
                  No RSVPs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
