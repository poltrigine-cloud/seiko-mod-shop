import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { products } from './data/products'

const EASE       = [0.22, 1, 0.36, 1]
const VIDEO_SRC  = '/ia%20generated/kling_hero.mp4'
const N_FRAMES   = 200  // más frames = interpolación más fina

// ─── EXTRACCIÓN DE FRAMES ─────────────────────────────────────────────────────
// Busca todos los frames del vídeo con seeking y los guarda como ImageBitmap
// (GPU-resident → drawImage() es prácticamente instantáneo)
async function extractFrames(video, onProgress) {
  // Esperar a tener metadata (duración + dimensiones)
  if (video.readyState < 1) {
    await new Promise(r => video.addEventListener('loadedmetadata', r, { once: true }))
  }

  const vW = video.videoWidth  || 1920
  const vH = video.videoHeight || 1080
  const { duration } = video

  const offscreen = document.createElement('canvas')
  offscreen.width  = vW
  offscreen.height = vH
  const ctx = offscreen.getContext('2d')

  const frames = []

  for (let i = 0; i < N_FRAMES; i++) {
    video.currentTime = (i / (N_FRAMES - 1)) * duration

    // Esperamos el evento seeked con timeout de seguridad
    await new Promise(resolve => {
      let timer = setTimeout(resolve, 600)
      video.addEventListener('seeked', () => { clearTimeout(timer); resolve() }, { once: true })
    })

    ctx.drawImage(video, 0, 0, vW, vH)

    // Preferimos ImageBitmap (GPU), con fallback a HTMLImageElement
    if (typeof createImageBitmap === 'function') {
      frames.push(await createImageBitmap(offscreen))
    } else {
      const img = new Image()
      await new Promise(r => { img.onload = r; img.src = offscreen.toDataURL('image/jpeg', 0.85) })
      frames.push(img)
    }

    onProgress((i + 1) / N_FRAMES)
  }

  return frames
}

// ─── DIBUJO CONTAIN ──────────────────────────────────────────────────────────
// Replica object-fit:contain — vídeo completo, centrado, sin recortar
function drawCover(ctx, frame, cW, cH) {
  const fW = frame.width  ?? frame.naturalWidth  ?? cW
  const fH = frame.height ?? frame.naturalHeight ?? cH
  const scale = Math.min(cW / fW, cH / fH)
  const w = fW * scale, h = fH * scale
  ctx.drawImage(frame, (cW - w) / 2, (cH - h) / 2, w, h)
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
export default function Hero() {
  const heroRef   = useRef(null)
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const progRef   = useRef(null)
  const framesRef = useRef([])
  const pctRef    = useRef(0)
  const ctxRef    = useRef(null)
  const rafRef    = useRef(null)

  const [loadPct, setLoadPct] = useState(0)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    const hero   = heroRef.current
    if (!video || !canvas || !hero) return

    const isMobile       = window.matchMedia('(max-width: 768px)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Móvil / reduced-motion: autoplay normal ──────────────────────────────
    if (isMobile || prefersReduced) {
      canvas.style.display = 'none'
      video.style.display  = 'block'
      video.style.position = 'absolute'
      video.style.inset    = '0'
      video.style.width    = '100%'
      video.style.height   = '100%'
      video.style.objectFit = 'cover'
      video.autoplay = true
      video.loop     = true
      video.play().catch(() => {})
      setReady(true)
      return
    }

    // ── Caché del contexto 2D ────────────────────────────────────────────────
    ctxRef.current = canvas.getContext('2d')

    // ── Redimensionar canvas al viewport ────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      ctxRef.current = canvas.getContext('2d')
      if (framesRef.current.length) drawFrame(pctRef.current)
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Renderizar frame con interpolación alpha ─────────────────────────────
    // Mezcla dos frames adyacentes según la posición fraccionaria del scroll,
    // eliminando los saltos discretos entre frames.
    const drawFrame = (pct) => {
      const frames = framesRef.current
      if (!frames.length) return
      const ctx = ctxRef.current
      const cW = canvas.width, cH = canvas.height

      const pos = pct * (frames.length - 1)
      const lo  = Math.floor(pos)
      const hi  = Math.min(lo + 1, frames.length - 1)
      const t   = pos - lo  // fracción 0-1 entre los dos frames

      ctx.clearRect(0, 0, cW, cH)
      drawCover(ctx, frames[lo], cW, cH)
      if (t > 0.001 && lo !== hi) {
        ctx.globalAlpha = t
        drawCover(ctx, frames[hi], cW, cH)
        ctx.globalAlpha = 1
      }

      if (progRef.current) progRef.current.style.width = (pct * 100) + '%'
    }

    // ── Extraer frames ───────────────────────────────────────────────────────
    extractFrames(video, p => setLoadPct(p)).then(frames => {
      framesRef.current = frames
      setReady(true)
      drawFrame(0)
    })

    // ── Bucle RAF — se sincroniza con Lenis en cada tick de animación ────────
    // Usar RAF continuo en lugar de scroll event evita el lag de un frame
    // que introduce el event listener cuando Lenis anima el scroll.
    const loop = () => {
      const rect      = hero.getBoundingClientRect()
      const scrolled  = -rect.top
      const scrollable = hero.offsetHeight - window.innerHeight
      if (scrollable > 0 && framesRef.current.length) {
        const pct = Math.max(0, Math.min(1, scrolled / scrollable))
        if (Math.abs(pct - pctRef.current) > 0.00005) {
          pctRef.current = pct
          drawFrame(pct)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      framesRef.current.forEach(f => f?.close?.())
      framesRef.current = []
    }
  }, [])

  const featured = products.find(p => p.id === 'gmt-bruiser') || products[0]

  return (
    <section className="hero-video" ref={heroRef} aria-label="Portada MODWATCH">
      <div className="hero-video-sticky">

        {/* Vídeo: oculto en desktop (solo extracción), visible en móvil */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          playsInline
          muted
          preload="auto"
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {/* Canvas: renderizado de frames en desktop */}
        <canvas
          ref={canvasRef}
          className="hero-video-el"
          aria-hidden="true"
        />

        {/* Pantalla de carga — se oculta cuando ready */}
        <div className={`hero-loading${ready ? ' hero-loading-done' : ''}`} aria-hidden={ready}>
          <div className="hero-loading-logo">
            {'MODWATCH'.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.07}s` }}>{ch}</span>
            ))}
          </div>
          <div className="hero-loading-bar">
            <div
              className="hero-loading-fill"
              style={{ width: `${loadPct * 100}%` }}
            />
          </div>
          <div className="hero-loading-pct">{Math.round(loadPct * 100)}%</div>
        </div>

        {/* Overlay oscuro de legibilidad */}
        <div className="hero-video-overlay" aria-hidden="true" />

        {/* Contenido del hero — aparece tras carga */}
        <div className={`hero-video-content${ready ? ' hero-content-ready' : ''}`}>
          <motion.span
            className="hero-badge liquid-glass"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            Artesanía · Precisión · Edición limitada
          </motion.span>

          <h1 className="hero-video-title" aria-label="MODWATCH — Relojes únicos">
            <span className="hvt-line hvt-main">
              {'MODWATCH'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: 'blur(18px)', y: 16 }}
                  animate={ready ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                  transition={{ duration: 0.65, delay: 0.25 + i * 0.05, ease: EASE }}
                  style={{ display: 'inline-block' }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
            <span className="hvt-line hvt-italic">
              {['Relojes', 'únicos'].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: 'blur(14px)', y: 16 }}
                  animate={ready ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.75 + i * 0.12, ease: EASE }}
                  style={{ display: 'inline-block', marginRight: '0.28em' }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            className="hero-video-specs"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, delay: 1.0, ease: EASE }}
          >
            {featured.movement} · {featured.specs} · Sant Cugat del Vallès
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, delay: 1.15, ease: EASE }}
            style={{ pointerEvents: ready ? 'all' : 'none' }}
          >
            <a href="#catalogo" className="btn btn-gold">Ver colección</a>
            <a href="#mods" className="btn btn-glass">Personalizar</a>
          </motion.div>
        </div>

        {/* Barra de progreso del scroll */}
        <div className="hero-progress-bar" aria-hidden="true">
          <div className="hero-progress-fill" ref={progRef} />
        </div>

        {/* Scroll hint */}
        <div className={`hero-scroll-hint${ready ? ' hero-scroll-hint-visible' : ''}`} aria-hidden="true">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>

      </div>
    </section>
  )
}
