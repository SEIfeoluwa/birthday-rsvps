import { useState } from 'react'

import { createRsvp } from '../../services/rsvps'
import { rsvpSchema } from '../../schemas/rsvpSchema'
import type { RSVPInput } from '../../schemas/rsvpSchema'

interface RsvpProps {
  onRsvpClick?: () => void
}

type FormData = Omit<RSVPInput, 'attendance'> & {
  attendance: RSVPInput['attendance'] | ''
}

const guestCountOptions = Array.from({ length: 11 }, (_, count) => count)

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  attendance: '',
  maleGuestCount: 0,
  femaleGuestCount: 0,
  childGuestCount: 0,
  message: '',
}

interface FormState {
  submitting: boolean
  error: string | null
  success: string | null
}

export default function Rsvp({ onRsvpClick }: RsvpProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formState, setFormState] = useState<FormState>({
    submitting: false,
    error: null,
    success: null,
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    const numericFields = [
      'maleGuestCount',
      'femaleGuestCount',
      'childGuestCount',
    ]

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState({ submitting: true, error: null, success: null })

    const parsed = rsvpSchema.safeParse(formData)

    if (!parsed.success) {
      setFormState({
        submitting: false,
        error: parsed.error.issues[0]?.message ?? 'Please check your RSVP details.',
        success: null,
      })
      return
    }

    try {
      await createRsvp(parsed.data)
      setFormData(initialFormData)
      setFormState({
        submitting: false,
        error: null,
        success: 'Thank you. Your RSVP has been submitted.',
      })
      onRsvpClick?.()
    } catch (err) {
      setFormState({
        submitting: false,
        error: err instanceof Error ? err.message : 'Unable to submit your RSVP.',
        success: null,
      })
    }
  }

  return (
    <section className="rsvp-form" id="rsvp-form-section">
      <h2>Will you be attending?</h2>
      <p>Please respond by August 19</p>
      
      <form onSubmit={handleSubmit} className="rsvp-form-container">
        <div className="form-row rsvp-contact-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(123) 456-7890"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="attendance">Will you attend? *</label>
            <select
              id="attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              required
            >
              <option value="">Select your attendance</option>
              <option value="yes">Yes, I'll be there!</option>
              <option value="no">Sorry, I can't make it</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>
        </div>

        <div className="form-row plus-ones-row">
          <h3 className="form-subheader">Total Attending</h3>
          <p className="form-helper">
            Please include yourself and everyone attending with you.
          </p>

          <div className="form-group">
            <label htmlFor="maleGuestCount">Men</label>
            <select
              id="maleGuestCount"
              name="maleGuestCount"
              value={formData.maleGuestCount}
              onChange={handleChange}
              required
            >
              {guestCountOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="femaleGuestCount">Women</label>
            <select
              id="femaleGuestCount"
              name="femaleGuestCount"
              value={formData.femaleGuestCount}
              onChange={handleChange}
              required
            >
              {guestCountOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="childGuestCount">Children</label>
            <select
              id="childGuestCount"
              name="childGuestCount"
              value={formData.childGuestCount}
              onChange={handleChange}
              required
            >
              {guestCountOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any special notes or dietary requirements?"
              rows={4}
            />
          </div>
        </div>

        {formState.error && <p className="form-status form-status-error">{formState.error}</p>}
        {formState.success && <p className="form-status form-status-success">{formState.success}</p>}

        <button type="submit" className="submit-btn" disabled={formState.submitting}>
          {formState.submitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </section>
  )
}
