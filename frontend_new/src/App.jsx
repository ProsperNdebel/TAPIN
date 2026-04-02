import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import SignInModal from './pages/SignInModal.jsx'
import CreateAccountModal from './pages/CreateAccountModal.jsx'
import { useAuth } from './hooks/useAuth.js'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import ForSchools from './pages/ForSchools.jsx'

export default function App() {
  const [signInOpen, setSignInOpen] = useState(false)
  const [createAccountOpen, setCreateAccountOpen] = useState(false)
  const { user, handleGoogleSignIn, handleEmailSignIn, handleEmailSignUp } = useAuth()

  if (user && (signInOpen || createAccountOpen)) {
    setSignInOpen(false)
    setCreateAccountOpen(false)
  }

  return (
    <>
      <Navbar 
        onOpenSignIn={() => setSignInOpen(true)} 
      />
      
      {signInOpen && (
        <SignInModal 
          onClose={() => setSignInOpen(false)}
          onGoogleSignIn={handleGoogleSignIn}
          onEmailSignIn={handleEmailSignIn}
          onCreateAccount={() => {
            setSignInOpen(false)
            setCreateAccountOpen(true)
          }}
        />
      )}

      {createAccountOpen && (
        <CreateAccountModal 
          onClose={() => setCreateAccountOpen(false)}
          onEmailSignUp={handleEmailSignUp}
          onSignIn={() => {
            setCreateAccountOpen(false)
            setSignInOpen(true)
          }}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/for-schools" element={<ForSchools />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="*" element={
          <main style={{ textAlign: 'center', padding: '80px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px' }}>
              Page not found
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              The page you're looking for doesn't exist.
            </p>
          </main>
        } />
      </Routes>
      <Footer />
    </>
  )
}