import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GlassCard } from '../components/GlassCard'
import { GlassButton } from '../components/GlassButton'
import { GlassInput } from '../components/GlassInput'
import styles from './Login.module.css'

export default function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  if (user?.clientId) {
    return <Navigate to={`/dashboard/${user.clientId}`} replace />
  }

  if (user) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loggedInUser = await login(email, password)
      if (loggedInUser.clientId) {
        window.location.href = `/dashboard/${loggedInUser.clientId}`
      }
    } catch (err) {
      setError(err.message)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <GlassCard className={`${styles.loginCard} ${shake ? 'animate-shake' : ''}`} glow>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={28} color="white" />
          </div>
          <span className={styles.logoText}>NexusDash</span>
          <p className={styles.tagline}>Admin Portal</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <GlassInput
            type="email"
            label="Email"
            placeholder="admin@nexusco.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <GlassInput
            type="password"
            label="Password"
            placeholder="Enter your password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <GlassButton 
            type="submit" 
            fullWidth 
            size="large"
            loading={loading}
            shimmer
            className={styles.submitBtn}
          >
            Sign In
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  )
}
