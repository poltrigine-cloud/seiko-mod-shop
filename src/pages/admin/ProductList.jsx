import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import PageLayout from '../../components/PageLayout'

export default function AdminProductList() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id,name,price,category,stock,featured,created_at')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const toggleFeatured = async (id, current) => {
    await supabase.from('products').update({ featured: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p))
  }

  const s = {
    th: { padding: '0.75rem 1rem', fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.35)', textAlign: 'left', fontWeight: 400 },
    td: { padding: '1rem 1rem', fontSize: '0.85rem', color: 'var(--cream)', borderTop: '1px solid rgba(255,255,255,0.05)' },
  }

  return (
    <PageLayout>
      <Helmet><title>Productos — Admin MODWATCH</title></Helmet>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem var(--gutter)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-badge" style={{ marginBottom: '0.75rem' }}>Inventario</div>
            <h1 className="sec-title">Productos</h1>
          </div>
          <button className="btn btn-gold" onClick={() => navigate('/admin/productos/nuevo')}>
            + Nuevo producto
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="page-spinner" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(248,244,234,0.35)' }}>
            No hay productos todavía.{' '}
            <button onClick={() => navigate('/admin/productos/nuevo')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'none', textDecoration: 'underline' }}>
              Crea el primero
            </button>
          </div>
        ) : (
          <div className="liquid-glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Categoría</th>
                  <th style={s.th}>Precio</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>Destacado</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{p.name}</td>
                    <td style={{ ...s.td, color: 'rgba(248,244,234,0.55)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.category}</td>
                    <td style={{ ...s.td, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{p.price}€</td>
                    <td style={{ ...s.td, color: p.stock === 0 ? '#ff6b7a' : 'var(--cream)' }}>{p.stock}</td>
                    <td style={s.td}>
                      <button
                        onClick={() => toggleFeatured(p.id, p.featured)}
                        style={{ background: 'none', border: 'none', cursor: 'none', fontSize: '1.1rem' }}
                        title={p.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                      >
                        {p.featured ? '★' : '☆'}
                      </button>
                    </td>
                    <td style={{ ...s.td, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/admin/productos/${p.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--gold)', fontSize: '0.75rem', padding: 0 }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{ background: 'none', border: 'none', cursor: 'none', color: '#ff6b7a', fontSize: '0.75rem', padding: 0 }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
