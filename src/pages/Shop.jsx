import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'

const EASE = [0.22, 1, 0.36, 1]

const FILTERS   = ['todos', 'date', 'gmt', 'icon', 'field', 'dress', 'otros']
const SORT_OPTS = [
  { value: 'created_at:desc', label: 'Más recientes' },
  { value: 'price:asc',       label: 'Precio: menor' },
  { value: 'price:desc',      label: 'Precio: mayor' },
  { value: 'name:asc',        label: 'Nombre A-Z' },
]

function SkeletonCard() {
  return (
    <div className="liquid-glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '0.5rem', width: '60%' }} />
        <div style={{ height: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '0.75rem', width: '80%' }} />
        <div style={{ height: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', width: '40%' }} />
      </div>
    </div>
  )
}

function ProductCard({ product, index }) {
  const navigate = useNavigate()
  const img      = product.images?.[0]

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '16px', overflow: 'hidden', cursor: 'none' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      onClick={() => navigate(`/producto/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/producto/${product.id}`)}
    >
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'hsl(15 8% 10%)', position: 'relative' }}>
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s var(--ease)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="rgba(196,150,74,0.6)" strokeWidth="1.5" />
              <circle cx="30" cy="30" r="20" stroke="rgba(196,150,74,0.4)" strokeWidth="1" />
            </svg>
          </div>
        )}
        {product.stock === 0 && (
          <span style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            background: 'rgba(12,10,9,0.85)', color: 'rgba(248,244,234,0.55)',
            fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '0.3rem 0.7rem', borderRadius: '100px',
          }}>
            Agotado
          </span>
        )}
      </div>
      <div style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.35)', marginBottom: '0.35rem' }}>
          {product.category}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--cream)', marginBottom: '0.6rem' }}>
          {product.name}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)' }}>
          {product.price}€
        </div>
      </div>
    </motion.div>
  )
}

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('todos')
  const [sort,     setSort]     = useState('created_at:desc')

  useEffect(() => {
    const [col, dir] = sort.split(':')
    let q = supabase.from('products').select('id,name,price,category,stock,images,featured')
    if (filter !== 'todos') q = q.eq('category', filter)
    q = q.order(col, { ascending: dir === 'asc' })
    q.then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [filter, sort])

  return (
    <PageLayout>
      <Helmet>
        <title>Catálogo — MODWATCH</title>
        <meta name="description" content="Relojes Seiko modificados artesanalmente. Calidad premium a precio justo." />
      </Helmet>

      <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '2rem var(--gutter) 6rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-badge" style={{ marginBottom: '1rem' }}>Colección actual</div>
          <h1 className="sec-title" style={{ marginBottom: '2rem' }}>
            Catálogo<br /><em>de relojes</em>
          </h1>

          {/* Filtros + ordenación */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  onClick={() => { setFilter(f); setLoading(true) }}
                >
                  {f === 'todos' ? 'Todos' : f.toUpperCase()}
                </button>
              ))}
            </div>
            <select
              className="cf-input cf-select"
              value={sort}
              onChange={e => { setSort(e.target.value); setLoading(true) }}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'rgba(248,244,234,0.35)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>◉</div>
            No hay productos en esta categoría todavía.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
