import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import PageLayout from '../../components/PageLayout'

export default function AdminMessages() {
  const [messages, setMessages]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [loading,  setLoading]    = useState(true)

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setMessages(data || []); setLoading(false) })
  }, [])

  const open = async msg => {
    setSelected(msg)
    if (!msg.read) {
      await supabase.from('contact_messages').update({ read: true }).eq('id', msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
    }
  }

  const formatDate = iso => new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const s = {
    row: (unread) => ({
      display: 'flex', gap: '1rem', alignItems: 'flex-start',
      padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
      cursor: 'none', transition: 'background 0.15s',
      background: unread ? 'rgba(196,150,74,0.04)' : 'transparent',
    }),
  }

  return (
    <PageLayout>
      <Helmet><title>Mensajes — Admin MODWATCH</title></Helmet>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem var(--gutter)' }}>
        <div className="section-badge" style={{ marginBottom: '0.75rem' }}>Bandeja de entrada</div>
        <h1 className="sec-title" style={{ marginBottom: '2.5rem' }}>Mensajes de contacto</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="page-spinner" />
          </div>
        ) : messages.length === 0 ? (
          <p style={{ color: 'rgba(248,244,234,0.35)', textAlign: 'center', padding: '4rem' }}>
            No hay mensajes todavía.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
            {/* Lista */}
            <div className="liquid-glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={s.row(!msg.read)}
                  onClick={() => open(msg)}
                >
                  {!msg.read && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', marginTop: '6px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: !msg.read ? 500 : 400, color: 'var(--cream)', fontSize: '0.88rem' }}>
                        {msg.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(248,244,234,0.35)', flexShrink: 0 }}>
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(248,244,234,0.45)', marginTop: '0.2rem' }}>{msg.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(248,244,234,0.55)', marginTop: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalle */}
            {selected && (
              <div className="liquid-glass" style={{ borderRadius: '16px', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '0.25rem' }}>
                      {selected.name}
                    </div>
                    <a href={`mailto:${selected.email}`} style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>
                      {selected.email}
                    </a>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'none', color: 'rgba(248,244,234,0.4)', fontSize: '1.2rem' }}>×</button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(248,244,234,0.35)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  {formatDate(selected.created_at)}
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(248,244,234,0.8)', whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
                <a
                  href={`mailto:${selected.email}?subject=Re: MODWATCH`}
                  className="btn btn-gold"
                  style={{ marginTop: '1.5rem', display: 'inline-flex', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Responder por email
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
