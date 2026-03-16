import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

export default function Navbar({ onOpenSignIn }) {
  const { user, handleLogout } = useAuth()  // grab user + logout from your existing hook
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const inputRef = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Focus mobile search input when it opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false)
    setSearchQuery('')
  }, [location.pathname])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* ── Logo ── */}
        <Link to="/" className={styles.logo} aria-label="TrendWise home">
          <span className={styles.logoIcon} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.15)"/>
              <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,0.2)"/>
              <path d="M7 21L12 14L16 18L21 10L25 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="25" cy="14" r="2" fill="#0d9488"/>
            </svg>
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoName}>TrendWise</span>
            <span className={styles.logoSub}>For Schools &amp; Educators</span>
          </span>
        </Link>

        {/* ── Desktop search bar ── */}
        <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search">
          <label htmlFor="nav-search" className="visually-hidden">Search topics, slang, apps</label>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            id="nav-search"
            type="search"
            placeholder="Search topics, slang, apps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        {/* ── Nav links — swaps based on auth state ── */}
        <nav className={styles.nav} aria-label="Main navigation">
          {user ? (
            // ── Logged-in state ──
            <>
              <span className={styles.userEmail}>{user.email}</span>
              <button
                className={styles.navLinkHighlight}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            // ── Logged-out state ──
            <>
              <button
                className={styles.navLinkHighlight}
                onClick={onOpenSignIn}
              >
                Login
              </button>
            </>
          )}
          <Link to="/about" className={styles.navLink}>About us</Link>
        </nav>

        {/* ── Mobile search toggle ── */}
        <button
          className={styles.searchToggle}
          onClick={() => setSearchOpen(v => !v)}
          aria-label={searchOpen ? 'Close search' : 'Open search'}
          aria-expanded={searchOpen}
        >
          {searchOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4L16 16M4 16L16 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile search bar (shown when toggle is active) ── */}
      {searchOpen && (
        <form className={styles.mobileSearch} onSubmit={handleSearchSubmit} role="search">
          <label htmlFor="mobile-search" className="visually-hidden">Search</label>
          <input
            id="mobile-search"
            ref={inputRef}
            type="search"
            placeholder="Search topics, slang, apps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.mobileSearchInput}
          />
          <button type="submit" className={styles.mobileSearchBtn}>Search</button>
        </form>
      )}
    </header>
  )
}