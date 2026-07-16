import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRsvpDashboardStats, updateRsvp } from '../services/rsvps'
import { supabase } from '../services/supabase'
import type { RsvpDashboardStats } from '../services/rsvps'
import type {
  AttendanceStatus,
  RsvpRecord,
  UpdateRsvpRecord,
} from '../types/database'

const guestCountOptions = Array.from({ length: 3 }, (_, count) => count)

function toEditForm(rsvp: RsvpRecord): UpdateRsvpRecord {
  return {
    first_name: rsvp.first_name,
    last_name: rsvp.last_name,
    phone: rsvp.phone,
    attendance: rsvp.attendance,
    male_guest_count: rsvp.male_guest_count,
    female_guest_count: rsvp.female_guest_count,
    child_guest_count: rsvp.child_guest_count,
    message: rsvp.message,
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  const [rsvps, setRsvps] = useState<RsvpRecord[]>([])
  const [stats, setStats] = useState<RsvpDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UpdateRsvpRecord | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [savingRsvpId, setSavingRsvpId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!supabase) {
          throw new Error('Missing Supabase environment variables.')
        }

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

          getRsvpDashboardStats(),
        ])

        if (rsvpResult.error) {
          throw rsvpResult.error
        }

        setRsvps((rsvpResult.data ?? []) as RsvpRecord[])
        setStats(statsResult)
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

  const handleStartEdit = (rsvp: RsvpRecord) => {
    setEditingRsvpId(rsvp.id)
    setEditForm(toEditForm(rsvp))
    setEditError(null)
  }

  const handleCancelEdit = () => {
    setEditingRsvpId(null)
    setEditForm(null)
    setEditError(null)
  }

  const updateEditField = <Field extends keyof UpdateRsvpRecord>(
    field: Field,
    value: UpdateRsvpRecord[Field],
  ) => {
    setEditForm((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        [field]: value,
      }
    })
  }

  const validateEditForm = (form: UpdateRsvpRecord) => {
    const totalGuests =
      form.male_guest_count + form.female_guest_count + form.child_guest_count

    if (!form.first_name.trim() || !form.last_name.trim()) {
      return 'First and last name are required.'
    }

    if (!form.phone.trim()) {
      return 'Phone number is required.'
    }

    if (totalGuests > 2) {
      return 'Guest count cannot exceed 2.'
    }

    if (form.attendance !== 'no' && totalGuests < 1) {
      return 'Guest count must be at least 1 for Yes responses.'
    }

    if ((form.message?.length ?? 0) > 500) {
      return 'Message cannot exceed 500 characters.'
    }

    return null
  }

  const refreshStats = async () => {
    setStats(await getRsvpDashboardStats())
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm) {
      return
    }

    const validationError = validateEditForm(editForm)

    if (validationError) {
      setEditError(validationError)
      return
    }

    try {
      setSavingRsvpId(id)
      setEditError(null)

      const updatedRsvp = await updateRsvp(id, editForm)

      setRsvps((currentRsvps) =>
        currentRsvps.map((rsvp) => (rsvp.id === id ? updatedRsvp : rsvp)),
      )
      await refreshStats()
      handleCancelEdit()
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : 'Unable to update this RSVP.',
      )
    } finally {
      setSavingRsvpId(null)
    }
  }

  const handleLogout = async () => {
    if (!supabase) {
      navigate('/admin/login', { replace: true })
      return
    }

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
        <section className="dashboard-stats dashboard-stats-full">
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
          <colgroup>
            <col className="admin-col-name" />
            <col className="admin-col-name" />
            <col className="admin-col-phone" />
            <col className="admin-col-status" />
            <col className="admin-col-count" />
            <col className="admin-col-count" />
            <col className="admin-col-count" />
            <col className="admin-col-total" />
            <col className="admin-col-message" />
            <col className="admin-col-actions" />
          </colgroup>

          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Phone</th>
              <th>Attendance</th>
              <th>Men</th>
              <th>Women</th>
              <th>Children</th>
              <th>Total Guests</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rsvps.length > 0 ? (
              rsvps.map((rsvp) => {
                const isEditing = editingRsvpId === rsvp.id && editForm
                const editGuestTotal = editForm
                  ? editForm.male_guest_count +
                    editForm.female_guest_count +
                    editForm.child_guest_count
                  : rsvp.guest_count

                return (
                  <tr key={rsvp.id}>
                    <td>
                      {isEditing ? (
                        <input
                          className="admin-table-input"
                          value={editForm.first_name}
                          onChange={(event) =>
                            updateEditField('first_name', event.target.value)
                          }
                          aria-label="First name"
                        />
                      ) : (
                        rsvp.first_name
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="admin-table-input"
                          value={editForm.last_name}
                          onChange={(event) =>
                            updateEditField('last_name', event.target.value)
                          }
                          aria-label="Last name"
                        />
                      ) : (
                        rsvp.last_name
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="admin-table-input"
                          value={editForm.phone}
                          onChange={(event) =>
                            updateEditField('phone', event.target.value)
                          }
                          aria-label="Phone"
                        />
                      ) : (
                        rsvp.phone || 'N/A'
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-table-input"
                          value={editForm.attendance}
                          onChange={(event) =>
                            updateEditField(
                              'attendance',
                              event.target.value as AttendanceStatus,
                            )
                          }
                          aria-label="Attendance"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : (
                        <span
                          className={`attendance-badge attendance-${rsvp.attendance}`}
                        >
                          {rsvp.attendance}
                        </span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-table-input admin-count-input"
                          value={editForm.male_guest_count}
                          onChange={(event) =>
                            updateEditField(
                              'male_guest_count',
                              Number(event.target.value),
                            )
                          }
                          aria-label="Men"
                        >
                          {guestCountOptions.map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      ) : (
                        rsvp.male_guest_count
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-table-input admin-count-input"
                          value={editForm.female_guest_count}
                          onChange={(event) =>
                            updateEditField(
                              'female_guest_count',
                              Number(event.target.value),
                            )
                          }
                          aria-label="Women"
                        >
                          {guestCountOptions.map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      ) : (
                        rsvp.female_guest_count
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-table-input admin-count-input"
                          value={editForm.child_guest_count}
                          onChange={(event) =>
                            updateEditField(
                              'child_guest_count',
                              Number(event.target.value),
                            )
                          }
                          aria-label="Children"
                        >
                          {guestCountOptions.map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      ) : (
                        rsvp.child_guest_count
                      )}
                    </td>

                    <td className="guest-count">{editGuestTotal}</td>

                    <td className="message-cell">
                      {isEditing ? (
                        <textarea
                          className="admin-table-input admin-message-input"
                          value={editForm.message ?? ''}
                          onChange={(event) =>
                            updateEditField('message', event.target.value)
                          }
                          aria-label="Message"
                          rows={3}
                        />
                      ) : (
                        rsvp.message || 'No message'
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-action-button"
                            onClick={() => handleSaveEdit(rsvp.id)}
                            disabled={savingRsvpId === rsvp.id}
                          >
                            {savingRsvpId === rsvp.id ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="admin-action-button admin-action-secondary"
                            onClick={handleCancelEdit}
                            disabled={savingRsvpId === rsvp.id}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="admin-action-button"
                          onClick={() => handleStartEdit(rsvp)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
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

      {editError && <div className="admin-edit-error">Error: {editError}</div>}

    </div>
  )
}
