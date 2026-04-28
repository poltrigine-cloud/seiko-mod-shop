import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handle = async e => {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setError('')
    setLoading(true)

    // El trigger on_auth_user_created en Supabase crea el perfil automáticamente
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <PageLayout>
        <div style={{
          maxWidth: '420px', margin: '0 auto',
          padding: '6rem var(--gutter)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>✓</div>
          <h2 className="sec-title" style={{ marginBottom: '1rem' }}>
            ¡Casi listo!
          </h2>
          <p className="sec-sub" style={{ marginBottom: '2rem' }}>
            Revisa tu bandeja de entrada y confirma tu email para activar la cuenta.
          </p>
          <Link to="/login" className="btn btn-gold" style={{ justifyContent: 'center' }}>
            Ir a Iniciar sesión
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Helmet>
        <title>Crear cuenta — MODWATCH</title>
        <meta name="description" content="Crea tu cuenta en MODWATCH." />
      </Helmet>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '4rem var(--gutter)' }}>
        <div className="section-badge" style={{ marginBottom: '2rem' }}>Nueva cuenta</div>
        <h1 className="sec-title" style={{ marginBottom: '2.5rem' }}>
          Únete a<br /><em>MODWATCH</em>
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

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cf-group">
            <label>Nombre completo</label>
            <input
              className="cf-input"
              type="text"
              placeholder="Tu nombre"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.82rem', color: 'rgba(248,244,234,0.45)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </PageLayout>
  )
}
