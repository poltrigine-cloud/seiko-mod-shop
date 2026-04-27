import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ShoppingBag, Menu, X, Plus, Minus, Wrench, Gem, MoveHorizontal, Layers, MapPin, Phone, Mail } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Hero from './Hero'
import { products, lookbookPhotos } from './data/products'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1]

const TESTIMONIALS = [
  { name: 'Marc Puigdomènech', location: 'Barcelona', model: 'Coca-Cola GMT', text: 'El bisel GMT es perfectamente preciso y el movimiento va como un reloj suizo del doble de precio. Acabado impecable.', stars: '★★★★★' },
  { name: 'Álvaro Méndez', location: 'Madrid', model: 'Bruiser', text: 'Robusto, elegante, con personalidad. El servicio fue impecable desde el primer mensaje. Lo llevo cada día.', stars: '★★★★★' },
  { name: 'Laia Ferrer', location: 'Valencia', model: 'AP Green', text: 'No esperaba semejante nivel de acabado a este precio. La caja integrada es perfecta y el verde del dial hipnótico.', stars: '★★★★★' },
  { name: 'Jordi Casas', location: 'Sabadell', model: 'Date Dark Sea', text: 'Llevaba años buscando un reloj con esta personalidad. Calidad artesanal a precio justo. Muy recomendable.', stars: '★★★★★' },
  { name: 'Sandra Vidal', location: 'Girona', model: 'PRX Blue', text: 'Compré el PRX Blue para regalar y quedaron enamorados. Packaging precioso y entrega rápida. Diez de diez.', stars: '★★★★★' },
  { name: 'Pol Trias', location: 'Sant Cugat', model: 'Starbucks 43mm', text: 'El Starbucks 43mm es una bestia. Acabado perfecto, movimiento preciso, vale cada euro.', stars: '★★★★★' },
]

const FAQS = [
  { q: '¿Cuánto tiempo tarda el montaje?', a: 'Entre 5 y 10 días hábiles, dependiendo de la complejidad del mod y disponibilidad de piezas.' },
  { q: '¿Los relojes llevan garantía?', a: 'Sí, todos nuestros relojes tienen 2 años de garantía en el movimiento. Cubrimos cualquier defecto de fabricación.' },
  { q: '¿Puedo personalizar un reloj?', a: 'Absolutamente. Contáctanos y te asesoramos. Podemos modificar esfera, cristal, movimiento, caja y correa según tus preferencias.' },
  { q: '¿Hacéis envíos internacionales?', a: 'Sí, enviamos a toda Europa con mensajería asegurada DHL. El seguro cubre el 100% del valor declarado.' },
  { q: '¿Qué movimientos utilizáis?', a: 'Principalmente NH35A y NH38 de Seiko. Son movimientos japoneses de alta fiabilidad con reserva de marcha de 41 horas.' },
  { q: '¿Los cristales son zafiro?', a: 'La mayoría sí. Todos los modelos premium incluyen cristal zafiro con tratamiento AR antirreflectante.' },
  { q: '¿Hacéis reparaciones de relojes externos?', a: 'Sí, contacta con nosotros indicando el modelo y el problema. Te damos presupuesto sin compromiso en menos de 24h.' },
  { q: '¿Puedo devolver un reloj?', a: '14 días para devoluciones sin preguntas si el reloj está en estado original. Gastos de envío de vuelta a cargo del cliente.' },
]

const MODS = [
  { icon: <Gem size={20} />, name: 'Cambio de Esfera', desc: 'Transforma el carácter del reloj. Más de 40 diales disponibles en stock.', price: 'Desde 45€' },
  { icon: <Wrench size={20} />, name: 'Upgrade Movimiento', desc: 'Mejora la precisión y reserva de marcha con movimientos seleccionados.', price: 'Desde 80€' },
  { icon: <Layers size={20} />, name: 'Cristal Zafiro', desc: 'El mejor material para la esfera. Con tratamiento AR doble cara.', price: 'Desde 55€' },
  { icon: <MoveHorizontal size={20} />, name: 'Mod Completo', desc: 'Renovación integral: esfera, cristal, agujas, corona y brazalete a tu gusto.', price: 'Desde 250€' },
]

// ─── BLUR TEXT ────────────────────────────────────────────────────────────────
function BlurText({ text, className }) {
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(14px)', y: 12 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── FADE UP ──────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const raf = useRef(null)

  useEffect(() => {
    const move = e => { pos.current = { x: e.clientX, y: e.clientY } }
    const onEnter = () => { dotRef.current?.classList.add('hover'); ringRef.current?.classList.add('hover') }
    const onLeave = () => { dotRef.current?.classList.remove('hover'); ringRef.current?.classList.remove('hover') }

    document.addEventListener('mousemove', move)
    const addListeners = () => {
      document.querySelectorAll('a,button,[role=button]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    addListeners()

    const animate = () => {
      if (dotRef.current) { dotRef.current.style.left = pos.current.x + 'px'; dotRef.current.style.top = pos.current.y + 'px' }
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.11
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.11
      if (ringRef.current) { ringRef.current.style.left = ringPos.current.x + 'px'; ringRef.current.style.top = ringPos.current.y + 'px' }
      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current) }
  }, [])

  return (
    <>
      <div className="cursor" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return <div className={`toast${visible ? ' show' : ''}`}>{message}</div>
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ cartCount, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`nav liquid-glass-strong${scrolled ? ' scrolled' : ''}`}>
        <a href="#" className="nav-logo">MODWATCH<sup>®</sup></a>
        <ul className="nav-links">
          <li><a href="#catalogo">Catálogo</a></li>
          <li><a href="#mods">Mods</a></li>
          <li><a href="#lookbook">Lookbook</a></li>
          <li><a href="#reviews">Reseñas</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <div className="nav-right">
          <button className="nav-cart-btn" onClick={onCartOpen} aria-label="Abrir carrito">
            <ShoppingBag size={16} />
            <span className={`cart-badge${cartCount > 0 ? ' visible' : ''}`}>{cartCount}</span>
          </button>
          <a href="#catalogo" className="nav-cta">Ver Catálogo</a>
          <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menú">
            <Menu size={22} />
          </button>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}><X size={24} /></button>
        <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
        <a href="#mods" onClick={() => setMenuOpen(false)}>Mods</a>
        <a href="#lookbook" onClick={() => setMenuOpen(false)}>Lookbook</a>
        <a href="#reviews" onClick={() => setMenuOpen(false)}>Reseñas</a>
        <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
      </div>
    </>
  )
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function MarqueeSection() {
  const items = ['Movimiento NH35A', 'Cristal Zafiro', 'Montaje Artesanal', '200m WR', 'Garantía 2 Años', 'Made in Spain', 'Envío Asegurado', 'Edición Limitada']
  const row = [...items, ...items]
  return (
    <div className="marquee-section">
      <div className="marquee-row">
        <div className="marquee-track">
          {row.map((t, i) => <span key={i}>{i % 2 === 0 ? t : <span className="gem">◆</span>}</span>)}
        </div>
        <div className="marquee-track" aria-hidden>
          {row.map((t, i) => <span key={i}>{i % 2 === 0 ? t : <span className="gem">◆</span>}</span>)}
        </div>
      </div>
      <div className="marquee-row">
        <div className="marquee-track reverse">
          {row.map((t, i) => <span key={i}>{i % 2 !== 0 ? t : <span className="gem">◆</span>}</span>)}
        </div>
        <div className="marquee-track reverse" aria-hidden>
          {row.map((t, i) => <span key={i}>{i % 2 !== 0 ? t : <span className="gem">◆</span>}</span>)}
        </div>
      </div>
    </div>
  )
}

// ─── PRODUCT CARD ────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, index }) {
  const [variantIdx, setVariantIdx] = useState(0)
  const [imgError, setImgError] = useState(false)
  const variant = product.variants[variantIdx]

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, { stiffness: 260, damping: 26 })
  const ySpring = useSpring(y, { stiffness: 260, damping: 26 })
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-8, 8])

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      className="product-card liquid-glass"
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: EASE }}
    >
      <div className="product-img">
        {imgError ? (
          <div className="product-img-placeholder">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="rgba(196,150,74,0.3)" strokeWidth="1.5" />
              <circle cx="30" cy="30" r="20" stroke="rgba(196,150,74,0.2)" strokeWidth="1" />
              <line x1="30" y1="10" x2="30" y2="30" stroke="rgba(248,244,234,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="30" y1="30" x2="42" y2="30" stroke="rgba(248,244,234,0.4)" strokeWidth="1" strokeLinecap="round" />
              <circle cx="30" cy="30" r="2" fill="rgba(196,150,74,0.8)" />
            </svg>
          </div>
        ) : (
          <img
            src={variant.photos[0]}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {product.badge && (
          <span className={`product-badge badge-${product.badge}`}>{product.badge}</span>
        )}
        <button className="product-quick-add" onClick={() => onAddToCart(product, variantIdx)}>
          + Añadir al carrito
        </button>
      </div>

      <div className="product-info">
        {product.variants.length > 1 && (
          <div className="strap-toggle">
            {product.variants.map((v, i) => (
              <button
                key={v.strap}
                className={`strap-btn${i === variantIdx ? ' active' : ''}`}
                onClick={() => setVariantIdx(i)}
              >
                {v.strap}
              </button>
            ))}
          </div>
        )}
        <div className="product-name">{product.name}</div>
        <div className="product-ref">Ref. {product.ref} · {product.movement} · {product.specs}</div>
        <div className="product-bottom">
          <div className="product-price">{variant.price}€</div>
          <button className="product-add" onClick={() => onAddToCart(product, variantIdx)}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── CATALOG ─────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'date', label: 'Date' },
  { key: 'gmt', label: 'GMT + Sub' },
  { key: 'icon', label: 'Icon' },
]

function Catalog({ onAddToCart }) {
  const [active, setActive] = useState('all')
  const filtered = active === 'all' ? products : products.filter(p => p.category === active)

  return (
    <section id="catalogo">
      <div className="catalog">
        <div className="catalog-header">
          <div>
            <FadeUp><div className="section-badge">Colección actual</div></FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="sec-title">Catálogo<br /><em>de relojes</em></h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="catalog-filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-btn${active === f.key ? ' active' : ''}`}
                onClick={() => setActive(f.key)}
              >
                {f.label}
              </button>
            ))}
          </FadeUp>
        </div>
        <div className="products-grid">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FEATURED PRODUCT ────────────────────────────────────────────────────────
function FeaturedProduct({ onAddToCart }) {
  const featured = products.find(p => p.id === 'icon-ap-green') || products[0]
  const [imgIdx, setImgIdx] = useState(0)
  const [imgError, setImgError] = useState(false)
  const photos = featured.variants[0].photos

  useEffect(() => {
    const id = setInterval(() => setImgIdx(i => (i + 1) % photos.length), 3000)
    return () => clearInterval(id)
  }, [photos.length])

  return (
    <section style={{ background: 'hsl(15 8% 9%)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="featured">
        <FadeUp><div className="section-badge">Producto destacado</div></FadeUp>
        <div className="featured-grid">
          <div className="featured-info">
            <FadeUp delay={0.1}>
              <h2 className="sec-title">{featured.name}<br /><em>Vista 360°</em></h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="sec-sub">{featured.description || 'Nuestra pieza más icónica. Inspirada en los grandes maestros relojeros, construida a mano en Sant Cugat del Vallès.'}</p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="featured-specs-grid liquid-glass">
                {[
                  ['Movimiento', featured.movement],
                  ['Referencia', featured.ref],
                  ['Cristal', 'Zafiro AR'],
                  ['Estanqueidad', '50m WR'],
                  ['Caja', 'Acero 316L'],
                  ['Unidades', featured.badge === 'Limitado' ? 'Limitadas' : 'Disponible'],
                ].map(([label, value]) => (
                  <div key={label} className="spec-item">
                    <div className="spec-label">{label}</div>
                    <div className="spec-value">{value}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="featured-price">
                <em>desde </em>{featured.variants[0].price}€
              </div>
              <div className="featured-ctas">
                <button className="btn btn-gold" onClick={() => onAddToCart(featured, 0)}>
                  Añadir al Carrito
                </button>
                <a href="#contacto" className="btn btn-glass">Preguntar</a>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            <div className="featured-viewer liquid-glass">
              {imgError ? (
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.3 }}>
                  <circle cx="40" cy="40" r="36" stroke="rgba(196,150,74,0.6)" strokeWidth="2" />
                  <circle cx="40" cy="40" r="26" stroke="rgba(196,150,74,0.4)" strokeWidth="1" />
                </svg>
              ) : (
                <img
                  src={photos[imgIdx]}
                  alt={`${featured.name} vista ${imgIdx + 1}`}
                  style={{ transition: 'opacity 0.4s' }}
                  onError={() => setImgError(true)}
                />
              )}
              <div className="viewer-drag-hint">
                <MoveHorizontal size={12} />
                Autorotación activa
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── MODS SECTION ────────────────────────────────────────────────────────────
function ModsSection() {
  return (
    <section id="mods">
      <div className="mods-section">
        <FadeUp><div className="section-badge">Personalización</div></FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="sec-title">Mods &amp;<br /><em>servicios</em></h2>
        </FadeUp>
        <FadeUp delay={0.15}>
          <p className="sec-sub">Transformamos tu reloj o el nuestro. Cada mod se presupuesta individualmente tras revisión técnica.</p>
        </FadeUp>

        <div className="mods-grid">
          {MODS.map((mod, i) => (
            <FadeUp key={mod.name} delay={i * 0.08}>
              <div className="mod-card liquid-glass">
                <div className="mod-icon">{mod.icon}</div>
                <div className="mod-name">{mod.name}</div>
                <p className="mod-desc">{mod.desc}</p>
                <div className="mod-price">{mod.price}</div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.35}>
          <div className="mods-cta-row">
            <a href="#contacto" className="btn btn-gold">Solicitar un Mod</a>
            <span className="mods-cta-note">Se confirma precio tras revisión técnica · Sin compromiso</span>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── LOOKBOOK ────────────────────────────────────────────────────────────────
function Lookbook() {
  return (
    <section id="lookbook" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="lookbook">
        <div className="lookbook-header">
          <FadeUp><div className="section-badge">Galería</div></FadeUp>
          <FadeUp delay={0.1}><h2 className="sec-title">Lookbook <em>2025</em></h2></FadeUp>
        </div>
        <div className="lookbook-track">
          {lookbookPhotos.map((item, i) => (
            <motion.div
              key={i}
              className="lookbook-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
            >
              <img
                src={item.src}
                alt={item.caption}
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.background = 'hsl(15 8% 12%)'
                }}
              />
              <div className="lookbook-overlay">
                <div className="lookbook-caption">{item.caption}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── STATS BAR ───────────────────────────────────────────────────────────────
function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const seen = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !seen.current) {
        seen.current = true
        const start = performance.now()
        const dur = 1600
        const tick = now => {
          const p = Math.min((now - start) / dur, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.floor(eased * target))
          if (p < 1) requestAnimationFrame(tick)
          else setVal(target)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{val}{suffix}</span>
}

function StatsBar() {
  const stats = [
    { num: 147, suffix: '+', label: 'Relojes entregados' },
    { num: 49, suffix: '★', label: 'Valoración media', pre: '4.' },
    { num: 100, suffix: '%', label: 'Montaje manual' },
    { num: 2, suffix: ' años', label: 'Garantía incluida' },
  ]
  return (
    <div className="stats-bar">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <FadeUp key={s.label} delay={i * 0.1}>
            <div className="stat-item">
              <div className="stat-num">
                {s.pre || ''}
                <CountUp target={s.num} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const half = Math.ceil(TESTIMONIALS.length / 2)
  const row1 = [...TESTIMONIALS.slice(0, half), ...TESTIMONIALS.slice(0, half)]
  const row2 = [...TESTIMONIALS.slice(half), ...TESTIMONIALS.slice(half)]

  const Card = ({ t }) => (
    <div className="testimonial-card liquid-glass">
      <p className="t-quote">&ldquo;{t.text}&rdquo;</p>
      <div className="t-meta">
        <div>
          <div className="t-name">{t.name}</div>
          <div className="t-model">{t.model}</div>
        </div>
        <div className="t-stars">{t.stars}</div>
      </div>
      <div className="t-verified">✓ Compra verificada</div>
    </div>
  )

  return (
    <section id="reviews" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="testimonials">
        <div className="testimonials-header">
          <div>
            <FadeUp><div className="section-badge">Opiniones verificadas</div></FadeUp>
            <FadeUp delay={0.1}><h2 className="sec-title">Lo que dicen<br /><em>nuestros clientes</em></h2></FadeUp>
          </div>
          <FadeUp delay={0.2}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--cream)', lineHeight: 1 }}>4.9</div>
              <div style={{ color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>★★★★★</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(248,244,234,0.35)', marginTop: '0.3rem' }}>89 reseñas</div>
            </div>
          </FadeUp>
        </div>

        <div className="testimonials-rows">
          <div className="testimonial-row">
            <div className="testimonial-track">{row1.map((t, i) => <Card key={i} t={t} />)}</div>
            <div className="testimonial-track" aria-hidden>{row1.map((t, i) => <Card key={i} t={t} />)}</div>
          </div>
          <div className="testimonial-row">
            <div className="testimonial-track reverse">{row2.map((t, i) => <Card key={i} t={t} />)}</div>
            <div className="testimonial-track reverse" aria-hidden>{row2.map((t, i) => <Card key={i} t={t} />)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'hsl(15 8% 9%)' }}>
      <div className="faq-section">
        <div className="faq-grid">
          <div className="faq-left">
            <FadeUp><div className="section-badge">FAQ</div></FadeUp>
            <FadeUp delay={0.1}><h2 className="sec-title">Preguntas<br /><em>frecuentes</em></h2></FadeUp>
            <FadeUp delay={0.2}><p className="sec-sub">Resolvemos las dudas más habituales. Si no encuentras tu respuesta, escríbenos.</p></FadeUp>
            <FadeUp delay={0.3} style={{ marginTop: '2rem' }}>
              <a href="#contacto" className="btn btn-glass">Contactar</a>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            <div className="faq-accordion">
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
                  <button className="faq-trigger" onClick={() => setOpen(open === i ? null : i)}>
                    <span className="faq-q">{faq.q}</span>
                    <Plus size={16} className="faq-icon" />
                  </button>
                  <div className="faq-answer"><p>{faq.a}</p></div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
function Contact() {
  const [sent, setSent] = useState(false)
  const handle = e => { e.preventDefault(); setSent(true) }

  return (
    <section id="contacto" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="contact-section">
        <FadeUp><div className="section-badge">¿Tienes dudas?</div></FadeUp>
        <div className="contact-grid">
          <div>
            <FadeUp delay={0.1}><h2 className="sec-title">Hablemos de<br /><em>tu próximo reloj</em></h2></FadeUp>
            <FadeUp delay={0.2}><p className="sec-sub">Cada encargo es una conversación. Cuéntanos qué tienes en mente y te respondemos en menos de 24h.</p></FadeUp>
            <FadeUp delay={0.3}>
              <div className="contact-info" style={{ marginTop: '2.5rem' }}>
                <div className="contact-detail">
                  <div className="contact-icon"><MapPin size={16} /></div>
                  <div>
                    <div className="contact-detail-label">Taller</div>
                    <div className="contact-detail-value">Sant Cugat del Vallès, Barcelona</div>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-icon"><Phone size={16} /></div>
                  <div>
                    <div className="contact-detail-label">WhatsApp</div>
                    <div className="contact-detail-value">Respuesta en &lt; 24h</div>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-icon"><Mail size={16} /></div>
                  <div>
                    <div className="contact-detail-label">Email</div>
                    <div className="contact-detail-value">hola@modwatch.es</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            {sent ? (
              <div style={{ padding: '3rem 0', color: 'var(--gold)', fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                ✓ Mensaje recibido. Te contactamos pronto.
              </div>
            ) : (
              <form className="cf-form" onSubmit={handle}>
                <div className="cf-row">
                  <div className="cf-group">
                    <label>Nombre</label>
                    <input className="cf-input" type="text" placeholder="Tu nombre" required />
                  </div>
                  <div className="cf-group">
                    <label>Teléfono</label>
                    <input className="cf-input" type="tel" placeholder="+34 000 000 000" />
                  </div>
                </div>
                <div className="cf-group">
                  <label>Email</label>
                  <input className="cf-input" type="email" placeholder="tu@email.com" required />
                </div>
                <div className="cf-group">
                  <label>Asunto</label>
                  <select className="cf-input cf-select">
                    <option>Compra de reloj</option>
                    <option>Solicitar mod personalizado</option>
                    <option>Consulta técnica</option>
                    <option>Reparación</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="cf-group">
                  <label>Mensaje</label>
                  <textarea className="cf-input" rows="4" placeholder="Cuéntanos qué buscas..." />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  Enviar mensaje
                </button>
              </form>
            )}
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────
function CtaBanner() {
  return (
    <div className="cta-banner">
      <FadeUp>
        <h2 className="cta-headline">
          <BlurText text="¿Tu próximo reloj?" />
        </h2>
      </FadeUp>
      <FadeUp delay={0.3}>
        <div className="cta-ctas">
          <a href="#catalogo" className="btn btn-gold">Ver Catálogo</a>
          <a href="#contacto" className="btn btn-glass">Contactar</a>
        </div>
      </FadeUp>
    </div>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a href="#" className="footer-logo">MOD<span>WATCH</span><sup style={{ fontSize: '0.5rem', color: 'var(--gold)' }}>®</sup></a>
          <p className="footer-tagline">Modificaciones artesanales sobre base Seiko. Cada pieza, única. Hecho en España.</p>
          <div className="footer-social">
            <a href="#" className="social-btn">IG</a>
            <a href="#" className="social-btn">TK</a>
            <a href="#" className="social-btn">WA</a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Catálogo</h5>
          <ul>
            <li><a href="#catalogo">Date</a></li>
            <li><a href="#catalogo">GMT + Sub</a></li>
            <li><a href="#catalogo">Icon</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Información</h5>
          <ul>
            <li><a href="#">Sobre nosotros</a></li>
            <li><a href="#">Proceso de montaje</a></li>
            <li><a href="#">Garantía</a></li>
            <li><a href="#">Envíos</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Contacto</h5>
          <ul>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">WhatsApp</a></li>
            <li><a href="#contacto">Formulario</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 MODWATCH. Todos los derechos reservados.</span>
        <div className="footer-legal">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

// ─── CART SIDEBAR ─────────────────────────────────────────────────────────────
function CartSidebar({ cart, open, onClose, onRemove }) {
  const total = cart.reduce((s, item) => s + item.price * item.qty, 0)

  return (
    <>
      <div className={`cart-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`cart-sidebar${open ? ' open' : ''}`}>
        <div className="cart-header">
          <h3>Tu Carrito</h3>
          <button className="cart-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío</p>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="cart-item">
                <img className="cart-item-img" src={item.photo} alt={item.name} onError={e => { e.target.style.display = 'none' }} />
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  {item.strap && <div className="cart-item-meta">Correa: {item.strap}</div>}
                  <div className="cart-item-price">{item.price}€</div>
                </div>
                <button className="cart-item-remove" onClick={() => onRemove(item.cartId)}>
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-price">{total}€</span>
            </div>
            <button className="cart-checkout">Pagar con Stripe</button>
            <p className="cart-secure">Pago encriptado SSL · Powered by Stripe</p>
          </div>
        )}
      </div>
    </>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })
  const toastTimer = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.07, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const rafCb = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(rafCb)
    gsap.ticker.lagSmoothing(0)
    return () => { lenis.destroy(); gsap.ticker.remove(rafCb) }
  }, [])

  const showToast = useCallback(msg => {
    setToast({ msg, visible: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }, [])

  const addToCart = useCallback((product, variantIdx) => {
    const variant = product.variants[variantIdx]
    const key = `${product.id}-${variantIdx}`
    setCart(prev => {
      const exists = prev.find(i => i.cartId === key)
      if (exists) return prev.map(i => i.cartId === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, {
        cartId: key, productId: product.id,
        name: product.name, strap: variant.strap,
        price: variant.price, photo: variant.photos[0], qty: 1,
      }]
    })
    showToast(`${product.name} añadido`)
  }, [showToast])

  const removeFromCart = useCallback(cartId => {
    setCart(prev => prev.filter(i => i.cartId !== cartId))
  }, [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <Cursor />
      <Toast message={toast.msg} visible={toast.visible} />
      <Nav cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <CartSidebar cart={cart} open={cartOpen} onClose={() => setCartOpen(false)} onRemove={removeFromCart} />
      <main>
        <Hero onAddToCart={addToCart} />
        <MarqueeSection />
        <Catalog onAddToCart={addToCart} />
        <FeaturedProduct onAddToCart={addToCart} />
        <ModsSection />
        <Lookbook />
        <StatsBar />
        <TestimonialsSection />
        <FAQ />
        <Contact />
        <CtaBanner />
        <Footer />
      </main>
    </>
  )
}
