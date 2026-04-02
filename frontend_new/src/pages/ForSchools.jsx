import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ForSchools.module.css'
import { createCheckoutSession } from '../services/api'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individual teachers getting started.',
    features: [
      'Full access to all articles',
      'Weekly digest email',
      'Printable summary sheets',
      'Search & filter by platform',
    ],
    cta: 'Get started free',
    ctaLink: '/#newsletter',
    highlight: false,
  },
  {
    name: 'School',
    price: '$299',
    period: 'per year',
    description: 'For a whole school to share with staff and parents.',
    features: [
      'Everything in Free',
      'School-branded digest emails',
      'Embeddable widget for your parent portal',
      'Bulk printable packs each week',
      'Priority support',
    ],
    cta: 'Contact us',
    ctaLink: '/contact',
    highlight: true,
  },
  {
    name: 'District',
    price: 'Custom',
    period: 'pricing',
    description: 'For districts managing multiple schools.',
    features: [
      'Everything in School',
      'LMS integration (Canvas, Schoology)',
      'Custom onboarding & training',
      'Dedicated account manager',
      'Usage analytics dashboard',
    ],
    cta: 'Talk to us',
    ctaLink: '/contact',
    highlight: false,
  },
]

const INTEGRATIONS = [
  { name: 'Google Classroom', icon: '🎓' },
  { name: 'Canvas LMS', icon: '🖼️' },
  { name: 'Schoology', icon: '📚' },
  { name: 'Parent Portal embed', icon: '🏫' },
  { name: 'Email newsletter', icon: '📬' },
  { name: 'Printable PDFs', icon: '🖨️' },
]

const FAQS = [
  {
    q: 'Is the content appropriate for school communications?',
    a: 'Yes. Every article is written in neutral, informational language — no scaremongering, no judgment. Our goal is to inform, not alarm. Administrators can preview any article before sharing it.',
  },
  {
    q: 'How often is content updated?',
    a: 'We publish new articles multiple times per week, tracking trends as they emerge. The weekly digest is sent every Monday morning.',
  },
  {
    q: 'Can we white-label the digest with our school name?',
    a: 'Yes — on the School and District plans you can add your school\'s logo and name to the digest email so it looks like it comes from your team.',
  },
  {
    q: 'Do you share or sell any data?',
    a: 'Never. We collect only the email addresses needed to send the digest, and we do not run ads or share data with third parties.',
  },
]

export default function ForSchools() {
  const [openFaq, setOpenFaq] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [formData, setFormData] = useState({
    schoolName: '',
    adminEmail: '',
  })

  const handleSchoolCheckout = async (e) => {
    e.preventDefault()
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      console.log('Starting checkout with data:', {
        planType: 'school',
        schoolName: formData.schoolName,
        adminEmail: formData.adminEmail,
      })

      const response = await createCheckoutSession({
        planType: 'school',
        schoolName: formData.schoolName,
        adminEmail: formData.adminEmail,
      })

      console.log('Checkout response:', response)

      if (!response.url) {
        throw new Error('No checkout URL returned from backend')
      }

      // Redirect to Stripe checkout
      window.location.href = response.url
    } catch (err) {
      console.error('Stripe checkout failed:', err)
      const errorMessage = err.message || 'Failed to start checkout. Please try again.'
      console.error('Full error details:', { message: err.message, status: err.status, body: err.body })
      setCheckoutError(errorMessage)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>For Schools &amp; Districts</div>
          <h1 className={styles.heroTitle}>
            Keep your whole school community informed
          </h1>
          <p className={styles.heroSubtitle}>
            TrendWise gives teachers, counselors, and administrators a reliable
            weekly briefing on what students are seeing online — so you can have
            informed, proactive conversations before problems arise.
          </p>
          <div className={styles.heroCtas}>
            <a href="#plans" className={styles.ctaPrimary}>See plans</a>
            <Link to="/#newsletter" className={styles.ctaSecondary}>Try the free digest first</Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.section} aria-labelledby="how-heading">
        <div className={styles.sectionInner}>
          <h2 id="how-heading" className={styles.sectionTitle}>How schools use TrendWise</h2>
          <div className={styles.stepsGrid}>
            {[
              { step: '01', title: 'Staff get the Monday digest', desc: 'Teachers and counselors receive a concise briefing every Monday covering the week\'s most relevant trends.' },
              { step: '02', title: 'Share with parents', desc: 'The digest is designed to be forwarded. Drop it into your parent newsletter or portal in seconds.' },
              { step: '03', title: 'Start informed conversations', desc: 'Staff walk into classrooms and parent meetings already knowing what\'s circulating — no awkward surprises.' },
            ].map(s => (
              <div key={s.step} className={styles.step}>
                <span className={styles.stepNumber}>{s.step}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className={styles.integrationsBar} aria-label="Supported integrations">
        <div className={styles.sectionInner}>
          <p className={styles.integrationsLabel}>Works with the tools you already use</p>
          <div className={styles.integrationsList}>
            {INTEGRATIONS.map(i => (
              <div key={i.name} className={styles.integrationChip}>
                <span aria-hidden="true">{i.icon}</span>
                {i.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" className={styles.section} aria-labelledby="plans-heading">
        <div className={styles.sectionInner}>
          <h2 id="plans-heading" className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionSubtitle}>Start free. Upgrade when your school is ready.</p>
          <div className={styles.plansGrid}>
            {PLANS.map(plan => (
              <div key={plan.name} className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ''}`}>
                {plan.highlight && <div className={styles.planBadge}>Most popular</div>}
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planAmount}>{plan.price}</span>
                    <span className={styles.planPeriod}>{plan.period}</span>
                  </div>
                  <p className={styles.planDesc}>{plan.description}</p>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map(f => (
                    <li key={f} className={styles.planFeature}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill={plan.highlight ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-alt)'}/>
                        <path d="M5 8L7 10L11 6" stroke={plan.highlight ? '#fff' : 'var(--color-primary)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.name === 'School' ? (
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className={`${styles.planCta} ${plan.highlight ? styles.planCtaHighlight : ''}`}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    to={plan.ctaLink}
                    className={`${styles.planCta} ${plan.highlight ? styles.planCtaHighlight : ''}`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.section} aria-labelledby="faq-heading">
        <div className={styles.faqInner}>
          <h2 id="faq-heading" className={styles.sectionTitle}>Common questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <svg
                    width="18" height="18" viewBox="0 0 18 18" fill="none"
                    className={`${styles.faqIcon} ${openFaq === i ? styles.faqIconOpen : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <p className={styles.faqAnswer}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.bottomCta}>
        <div className={styles.sectionInner}>
          <h2 className={styles.bottomCtaTitle}>Ready to keep your school informed?</h2>
          <p className={styles.bottomCtaSubtitle}>Join hundreds of schools already using TrendWise.</p>
          <div className={styles.bottomCtaBtns}>
            <Link to="/#newsletter" className={styles.ctaPrimary}>Start with the free digest</Link>
            <Link to="/contact" className={styles.ctaOutline}>Talk to our team</Link>
          </div>
        </div>
      </section>

      {/* ── School Checkout Modal ── */}
      {showCheckoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCheckoutModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowCheckoutModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className={styles.modalHeader}>
              <h2>Get Started with TrendWise for Schools</h2>
              <p>$299/year for your entire school</p>
            </div>

            <form onSubmit={handleSchoolCheckout} className={styles.checkoutForm}>
              <div className={styles.formGroup}>
                <label htmlFor="schoolName">School Name *</label>
                <input
                  type="text"
                  id="schoolName"
                  placeholder="Your School Name"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                  disabled={checkoutLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adminEmail">Admin Email *</label>
                <input
                  type="email"
                  id="adminEmail"
                  placeholder="admin@yourschool.edu"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  required
                  disabled={checkoutLoading}
                />
              </div>

              {checkoutError && (
                <p className={styles.errorMessage}>{checkoutError}</p>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={checkoutLoading || !formData.schoolName || !formData.adminEmail}
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <p className={styles.formNote}>
                You'll be redirected to Stripe to complete your secure payment.
              </p>
            </form>
          </div>
        </div>
      )}

    </main>
  )
}
