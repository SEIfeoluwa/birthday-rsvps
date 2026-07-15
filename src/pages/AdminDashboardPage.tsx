import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../services/supabase'
import type { RsvpRecord } from '../types/database'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRsvps = async () => {
      try {
        setLoading(true)

        if (!supabase) {
          throw new Error('Missing Supabase environment variables')
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          navigate('/admin/login', { replace: true })
          return
        }

        const { data, error } = await supabase
          .from('rsvps')
          .select('*')
          .order('first_name', { ascending: true })

        if (error) throw error

        setRsvps(data ?? [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRsvps()
  }, [navigate])

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }

    navigate('/admin/login', { replace: true })
  }

  if (loading) return <div className="admin-loading">Loading...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <button type="button" onClick={handleLogout}>Log Out</button>
      </div>
      
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Attendance</th>
              <th>Guests</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length > 0 ? (
              rsvps.map((rsvp) => (
                <tr key={rsvp.id}>
                  <td>{rsvp.first_name}</td>
                  <td>{rsvp.last_name}</td>
                  <td>{rsvp.email}</td>
                  <td>{rsvp.phone}</td>
                  <td>
                    <span className={`attendance-badge attendance-${rsvp.attendance}`}>
                      {rsvp.attendance}
                    </span>
                  </td>
                  <td className="guest-count">{rsvp.guest_count}</td>
                  <td className="message-cell">{rsvp.message}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">No RSVPs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
