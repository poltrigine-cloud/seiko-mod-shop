/**
 * HeroWithTransition — envuelve HeroWorkshop con una transición cinematográfica
 * controlada por scroll.
 *
 * PARA ELIMINAR ESTA TRANSICIÓN:
 *   1. En App.jsx cambia `import HeroWithTransition` → `import HeroWorkshop`
 *   2. En App.jsx cambia `<HeroWithTransition />` → `<HeroWorkshop />`
 *   3. Borra este archivo y HeroWithTransition.css
 *
 * ACTO 1  (0vh   →  90vh) el taller 3D, interactivo
 * ACTO 2  (90vh  → 270vh) zoom out continuo + viñeta cierra a negro
 * ACTO 3  (270vh → 320vh) el negro se disuelve, la tienda emerge
 */
import { useEffect, useRef } from 'react'
import HeroWorkshop from './HeroWorkshop'
import './HeroWithTransition.css'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const lerp   = (a, b, t) => a + (b - a) * t
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const phase  = (p, s, e) => clamp((p - s) / (e - s), 0, 1)

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
export default function HeroWithTransition() {
  const wrapperRef  = useRef(null)  // contenedor 320vh — define el espacio de scroll
  const scaleRef    = useRef(null)  // aplica scale + opacity al 3D
  const vignetteRef = useRef(null)  // gradiente radial que cierra a negro
  const hintRef     = useRef(null)  // indicador de scroll

  useEffect(() => {
    // ── Reduced-motion: sin transición, corte directo ─────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wrapper = wrapperRef.current
    const scale   = scaleRef.current
    const vig     = vignetteRef.current
    const hint    = hintRef.current
    if (!wrapper || !scale || !vig) return

    let rafId
    let lastP = -1

    const apply = () => {
      const rect       = wrapper.getBoundingClientRect()
      const scrollable = wrapper.offsetHeight - window.innerHeight
      if (scrollable <= 0) { rafId = requestAnimationFrame(apply); return }

      const p = clamp(-rect.top / scrollable, 0, 1)
      if (Math.abs(p - lastP) < 0.0003) { rafId = requestAnimationFrame(apply); return }
      lastP = p

      // ── FASE 1 (0 – 28%): zoom suave + fade leve ─────────────────────
      const p1 = phase(p, 0, 0.28)
      // ── FASE 2 (28 – 80%): zoom agresivo + viñeta cierra a negro ──────
      const p2 = phase(p, 0.28, 0.80)
      // ── FASE 3 (80 – 100%): negro se disuelve → tienda emerge ─────────
      const p3 = phase(p, 0.80, 1.00)

      // ── Aplicar según fase activa ──────────────────────────────────────
      if (p <= 0.28) {
        scale.style.transform     = `scale(${lerp(1, 0.80, p1)})`
        scale.style.opacity       = lerp(1, 0.72, p1)
        scale.style.pointerEvents = p > 0.04 ? 'none' : 'auto'
        vig.style.background      = 'transparent'
      } else if (p <= 0.80) {
        const vigHole = lerp(70, 0, p2)
        const vigEdge = Math.min(vigHole + 28, 100)
        scale.style.transform     = `scale(${lerp(0.80, 0.50, p2)})`
        scale.style.opacity       = lerp(0.72, 0, p2)
        scale.style.pointerEvents = 'none'
        vig.style.background      = `radial-gradient(circle, transparent ${vigHole}%, black ${vigEdge}%)`
      } else {
        scale.style.transform     = 'scale(0.50)'
        scale.style.opacity       = 0
        scale.style.pointerEvents = 'none'
        vig.style.background      = `rgba(0,0,0,${lerp(1, 0, p3)})`
      }

      // Scroll hint desaparece al inicio del scroll
      if (hint) hint.style.opacity = lerp(1, 0, clamp(p1 * 4, 0, 1))

      rafId = requestAnimationFrame(apply)
    }

    rafId = requestAnimationFrame(apply)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div ref={wrapperRef} className="htr-wrapper">
      <div className="htr-sticky">

        {/* ── El taller 3D recibe los transforms de escala y opacidad ─── */}
        <div ref={scaleRef} className="htr-scale">
          <HeroWorkshop />
        </div>

        {/* ── Viñeta radial: de transparente a negro total ─────────────── */}
        <div ref={vignetteRef} className="htr-vignette" aria-hidden="true" />

        {/* ── Indicador de scroll — Acto 1 únicamente ──────────────────── */}
        <div ref={hintRef} className="htr-scroll-hint" aria-hidden="true">
          <div className="htr-scroll-icon">
            <div className="htr-scroll-line" />
          </div>
          <span>Desliza para explorar</span>
        </div>

      </div>
    </div>
  )
}
