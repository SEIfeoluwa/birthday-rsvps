import { useEffect, useState } from 'react'

import { sendSms } from '../../services/sms'
import type { SendSmsResult } from '../../services/sms'
import { supabase } from '../../services/supabase'

const MAX_MESSAGE_LENGTH = 1600

async function loadRecipientCount(): Promise<number> {
  if (!supabase) {
    throw new Error('Missing Supabase environment variables.')
  }

  const { data, error } = await supabase
    .from('rsvps')
    .select('phone')
    .eq('sms_consent', true)

  if (error) {
    throw error
  }

  return (data ?? []).filter((row) => !!row.phone).length
}

export default function SendSms() {
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [countError, setCountError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [result, setResult] = useState<SendSmsResult | null>(null)

  useEffect(() => {
    const loadCount = async () => {
      try {
        setCountError(null)
        setRecipientCount(await loadRecipientCount())
      } catch (err) {
        setCountError(
          err instanceof Error ? err.message : 'Unable to load recipient count.',
        )
      }
    }

    loadCount()
  }, [])

  const trimmedMessage = message.trim()
  const canSend = trimmedMessage.length > 0 && trimmedMessage.length <= MAX_MESSAGE_LENGTH

  const handleSend = async () => {
    if (!canSend) {
      return
    }

    const shouldSend = window.confirm(
      `Send this text to ${recipientCount ?? 'all'} guest${recipientCount === 1 ? '' : 's'} who opted in to SMS?`,
    )

    if (!shouldSend) {
      return
    }

    try {
      setSending(true)
      setSendError(null)
      setResult(null)

      const sendResult = await sendSms(trimmedMessage)

      setResult(sendResult)
      setMessage('')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Unable to send SMS.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="sms-panel">
      <section className="sms-compose">
        <h2>Send SMS</h2>
        <p className="sms-recipient-note">
          {countError
            ? `Error: ${countError}`
            : recipientCount === null
              ? 'Loading recipient count...'
              : `This will text ${recipientCount} guest${recipientCount === 1 ? '' : 's'} who opted in to SMS.`}
        </p>

        <textarea
          className="admin-table-input admin-message-input sms-textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message..."
          rows={5}
          aria-label="Message body"
          disabled={sending}
        />

        <div className="sms-compose-footer">
          <span
            className={`sms-char-count${trimmedMessage.length > MAX_MESSAGE_LENGTH ? ' sms-char-count-over' : ''}`}
          >
            {trimmedMessage.length} / {MAX_MESSAGE_LENGTH}
          </span>

          <button
            type="button"
            className="admin-action-button"
            onClick={handleSend}
            disabled={!canSend || sending}
          >
            {sending ? 'Sending...' : 'Send SMS'}
          </button>
        </div>
      </section>

      {sendError && <div className="admin-edit-error">Error: {sendError}</div>}

      {result && (
        <section className="sms-result">
          <p>
            Sent to {result.sent} guest{result.sent === 1 ? '' : 's'}
            {result.failed > 0 ? `, ${result.failed} failed` : ''}.
          </p>

          {result.failures.length > 0 && (
            <ul className="sms-failure-list">
              {result.failures.map((failure, index) => (
                <li key={`${failure.to}-${index}`}>
                  {failure.to}: {failure.error ?? 'Unknown error'}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
