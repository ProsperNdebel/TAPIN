import { useState } from 'react'
import styles from './NewsletterSignup.module.css'

export default function NewsletterSignup() {
  const [email, setEmail]   = useState('')
  const [role, setRole]     = useState('teacher')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await new Promise(r => setTimeout(r, 700))
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        {/* Left */}
        <div className={styles.text}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Weekly educator digest
          </div>
          <h2 className={styles.title}>
            Every Monday. Ready to share.
          </h2>
          <p className={styles.subtitle}>
            A concise briefing covering the week's most relevant trends, slang,
            and apps among students. Formatted for staff meetings and parent newsletters.
          </p>
          <ul className={styles.perks}>
            {[
              'One focused email, every Monday morning',
              'Includes a one-page printable summary',
              'Safe to forward to parents as-is',
            ].map(perk => (
              <li key={perk}>
                <span className={styles.perkCheck} aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right form */}
        <div className={styles.formWrapper}>
          {status === 'success' ? (
            <div className={styles.success} role="alert">
              <span className={styles.successIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11L9 16L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <strong>You're subscribed!</strong>
              <p>Your first digest arrives this Monday.</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <p className={styles.formTitle}>Get the weekly digest</p>
              <p className={styles.formSubtitle}>Free for educators. Cancel any time.</p>

              <div className={styles.field}>
                <label htmlFor="nl-email" className={styles.label}>Work email</label>
                <input
                  id="nl-email"
                  type="email"
                  className={styles.input}
                  placeholder="you@school.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="nl-role" className={styles.label}>Your role</label>
                <select
                  id="nl-role"
                  className={styles.select}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  disabled={status === 'loading'}
                >
                  <option value="teacher">Teacher</option>
                  <option value="administrator">School Administrator</option>
                  <option value="counselor">School Counselor</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {status === 'error' && (
                <p className={styles.errorMsg} role="alert">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === 'loading' || !email.trim()}
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe — it\'s free →'}
              </button>

              <p className={styles.privacy}>Unsubscribe in one click.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
