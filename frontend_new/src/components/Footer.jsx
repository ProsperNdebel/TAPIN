import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLogo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="rgba(255,255,255,0.08)"/>
              <path d="M6 19L10.5 12.5L14 16L18.5 9L22 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="22" cy="12.5" r="1.8" fill="#0d9488"/>
            </svg>
            <span>TrendWise</span>
          </Link>
          <p className={styles.brandTagline}>
            Keeping educators informed about youth culture online.<br />
            Plain language. Trusted by 200+ schools.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <p className={styles.linkGroupTitle}>Resources</p>
            <Link to="/">All Articles</Link>
            <Link to="/?category=Slang">Slang Guide</Link>
            <Link to="/?category=Apps">App Explainers</Link>
            <Link to="/?category=Safety">Online Safety</Link>
          </div>
          <div className={styles.linkGroup}>
            <p className={styles.linkGroupTitle}>Schools</p>
            <Link to="/for-schools">For Schools</Link>
            <Link to="/for-schools#plans">Pricing</Link>
            <Link to="/for-schools#integrations">Integrations</Link>
          </div>
          <div className={styles.linkGroup}>
            <p className={styles.linkGroupTitle}>Company</p>
            <Link to="/about">About</Link>
            <Link to="/#newsletter">Newsletter</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} TrendWise. All rights reserved.</p>
      </div>
    </footer>
  )
}
