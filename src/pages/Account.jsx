import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PageLayout from '../components/PageLayout'

export default function Account() {
  const { user, signOut } = useAuth()
  const [profile,  setProfile]  = useState({ full_name: '', phone: '' })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '' })
      setLoading(false)
    })
  }, [user])

  const handle = async e => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      phone:     profile.phone,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="page-spinner" />
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <Helmet>
        <title>Mi cuenta — MODWATCH</title>
      </Helmet>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem var(--gutter) 6rem' }}>
        <div className="section-badge" style={{ marginBottom: '1rem' }}>Perfil</div>
        <h1 className="sec-title" style={{ marginBottom: '0.5rem' }}>Mi cuenta</h1>
        <p style={{ fontSize: '0.8rem', color: 'rgba(248,244,234,0.4)', marginBottom: '3rem' }}>{user.email}</p>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cf-group">
            <label>Nombre completo</label>
            <input
              className="cf-input"
              type="text"
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Tu nombre"
            />
          </div>
          <div className="cf-group">
            <label>Teléfono</label>
            <input
              className="cf-input"
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="+34 000 000 000"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-gold" disabled={saving} style={{ justifyContent: 'center' }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <span style={{ fontSize: '0.78rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
                ✓ Guardado
              </span>
            )}
          </div>
        </form>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={signOut}
            className="btn btn-glass"
            style={{ justifyContent: 'center', width: '100%', color: 'rgba(248,244,234,0.55)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
