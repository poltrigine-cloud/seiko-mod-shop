import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'

const EASE = [0.22, 1, 0.36, 1]

export default function ProductDetail() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const [product,  setProduct]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [imgIdx,   setImgIdx]   = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) { navigate('/tienda'); return }
      setProduct(data)
      setLoading(false)
      // Productos relacionados (misma categoría, max 4)
      supabase.from('products')
        .select('id,name,price,images,category')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4)
        .then(({ data: rel }) => setRelated(rel || []))
    })
  }, [id, navigate])

  const handleConsult = () => {
    const name = encodeURIComponent(product.name)
    navigate(`/contacto?producto=${name}`)
  }

  if (loading) return (
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="page-spinner" />
      </div>
    </PageLayout>
  )

  if (!product) return null

  const imgs  = product.images?.length ? product.images : []
  const specs = product.specs ? Object.entries(product.specs) : []

  return (
    <PageLayout>
      <Helmet>
        <title>{product.name} — MODWATCH</title>
        <meta name="description" content={product.description || `${product.name} — Seiko mod artesanal. ${product.price}€`} />
      </Helmet>

      {/* Lightbox */}
      {lightbox && imgs.length > 0 && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none',
          }}
        >
          <img
            src={imgs[imgIdx]}
            alt={product.name}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      )}

      <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '2rem var(--gutter) 6rem' }}>
        <button
          onClick={() => navigate('/tienda')}
          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'none', fontSize: '0.8rem', marginBottom: '2.5rem', padding: 0 }}
        >
          ← Volver al catálogo
        </button>

        {/* Producto principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start', marginBottom: '6rem' }}>

          {/* Galería */}
          <div>
            <div
              style={{ aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: 'hsl(15 8% 10%)', marginBottom: '1rem', cursor: imgs.length ? 'none' : 'default' }}
              onClick={() => imgs.length && setLightbox(true)}
            >
              {imgs.length > 0 ? (
                <img
                  src={imgs[imgIdx]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="36" stroke="rgba(196,150,74,0.6)" strokeWidth="2" />
                    <circle cx="40" cy="40" r="26" stroke="rgba(196,150,74,0.4)" strokeWidth="1" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {imgs.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    style={{
                      width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', padding: 0,
                      border: `2px solid ${i === imgIdx ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'none', background: 'none', transition: 'border-color 0.2s',
                    }}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.35)', marginBottom: '0.75rem' }}>
              {product.category}
            </div>
            <h1 className="sec-title" style={{ marginBottom: '1rem' }}>{product.name}</h1>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>
              {product.price}€
            </div>

            {product.description && (
              <p className="sec-sub" style={{ marginBottom: '2rem' }}>{product.description}</p>
            )}

            {specs.length > 0 && (
              <div className="liquid-glass" style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                {specs.map(([key, value], i) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderBottom: i < specs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(248,244,234,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{key}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--cream)', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-gold"
                onClick={handleConsult}
                style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}
              >
                Consultar disponibilidad
              </button>
              <button
                className="btn btn-glass"
                onClick={() => navigate('/contacto')}
                style={{ flex: 1, justifyContent: 'center', minWidth: '120px' }}
              >
                Más información
              </button>
            </div>

            {product.stock === 0 && (
              <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(248,244,234,0.4)', letterSpacing: '0.08em' }}>
                Este modelo está actualmente agotado — escríbenos para lista de espera.
              </p>
            )}
          </motion.div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <div>
            <div className="section-badge" style={{ marginBottom: '1rem' }}>También te puede interesar</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {related.map(p => (
                <div
                  key={p.id}
                  className="liquid-glass"
                  style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'none' }}
                  onClick={() => { navigate(`/producto/${p.id}`); window.scrollTo(0, 0) }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/producto/${p.id}`)}
                >
                  <div style={{ aspectRatio: '1', background: 'hsl(15 8% 10%)' }}>
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ padding: '0.9rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{p.name}</div>
                    <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{p.price}€</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
