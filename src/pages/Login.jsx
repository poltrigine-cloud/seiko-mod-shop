import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  const handleEmail = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/')
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    })
    if (error) setError(error.message)
  }

  return (
    <PageLayout>
      <Helmet>
        <title>Entrar — MODWATCH</title>
        <meta name="description" content="Accede a tu cuenta de MODWATCH." />
      </Helmet>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '4rem var(--gutter)' }}>
        <div className="section-badge" style={{ marginBottom: '2rem' }}>Acceso</div>
        <h1 className="sec-title" style={{ marginBottom: '2.5rem' }}>
          Bienvenido<br /><em>de nuevo</em>
        </h1>

        {error && (
          <div style={{
            background: 'rgba(220,53,69,0.12)', border: '1px solid rgba(220,53,69,0.3)',
            borderRadius: '8px', padding: '0.75rem 1rem',
            color: '#ff6b7a', fontSize: '0.82rem', marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cf-group">
            <label>Email</label>
            <input
              className="cf-input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="cf-group">
            <label>Contraseña</label>
            <input
              className="cf-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          margin: '1.5rem 0', color: 'rgba(248,244,234,0.3)', fontSize: '0.75rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span>o</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <button
          onClick={handleGoogle}
          className="btn btn-glass"
          style={{ width: '100%', justifyContent: 'center', gap: '0.6rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.82rem', color: 'rgba(248,244,234,0.45)' }}>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Regístrate
          </Link>
        </p>
      </div>
    </PageLayout>
  )
}
