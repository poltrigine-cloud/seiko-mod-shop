import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import PageLayout from '../../components/PageLayout'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ products: 0, unread: 0, recent: [] })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const [{ count: pCount }, { count: mCount }, { data: recent }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
        supabase.from('products').select('id,name,price,category,created_at').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ products: pCount || 0, unread: mCount || 0, recent: recent || [] })
      setLoading(false)
    }
    load()
  }, [])

  const s = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' },
    card: { padding: '2rem', borderRadius: '16px' },
    num:  { fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--gold)', lineHeight: 1 },
    lbl:  { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.45)', marginTop: '0.5rem' },
    row:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.85rem' },
  }

  return (
    <PageLayout>
      <Helmet><title>Admin — MODWATCH</title></Helmet>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem var(--gutter)' }}>
        <div className="section-badge" style={{ marginBottom: '1.5rem' }}>Panel de control</div>
        <h1 className="sec-title" style={{ marginBottom: '3rem' }}>Dashboard</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="page-spinner" />
          </div>
        ) : (
          <>
            <div style={s.grid}>
              <div className="liquid-glass" style={s.card}>
                <div style={s.num}>{stats.products}</div>
                <div style={s.lbl}>Productos activos</div>
              </div>
              <div className="liquid-glass" style={s.card}>
                <div style={{ ...s.num, color: stats.unread > 0 ? '#ff6b7a' : 'var(--gold)' }}>{stats.unread}</div>
                <div style={s.lbl}>Mensajes sin leer</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => navigate('/admin/productos/nuevo')}>
                + Nuevo producto
              </button>
              <button className="btn btn-glass" onClick={() => navigate('/admin/productos')}>
                Gestionar productos
              </button>
              <button className="btn btn-glass" onClick={() => navigate('/admin/mensajes')}>
                Ver mensajes {stats.unread > 0 && `(${stats.unread})`}
              </button>
            </div>

            {stats.recent.length > 0 && (
              <div className="liquid-glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.45)' }}>
                  Últimos productos
                </div>
                {stats.recent.map(p => (
                  <div key={p.id} style={{ ...s.row, padding: '0.9rem 1.5rem' }}>
                    <span style={{ color: 'var(--cream)' }}>{p.name}</span>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(248,244,234,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.category}</span>
                      <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{p.price}€</span>
                      <button
                        onClick={() => navigate(`/admin/productos/${p.id}`)}
                        style={{ background: 'none', border: 'none', color: 'rgba(248,244,234,0.4)', cursor: 'none', fontSize: '0.75rem', padding: 0 }}
                      >
                        Editar →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}
