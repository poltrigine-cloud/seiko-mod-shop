import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { products } from './data/products'

gsap.registerPlugin(ScrollTrigger)

const EASE = [0.22, 1, 0.36, 1]

// ─── SVG PIECES ───────────────────────────────────────────────────────────────

function SvgBezel() {
  const cx = 150, cy = 150
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360 - 90
    const rad = (angle * Math.PI) / 180
    const isMajor = i % 6 === 0
    const r1 = 147, r2 = isMajor ? 130 : 138
    return { i, angle, rad, isMajor, r1, r2,
      label: i === 0 ? '24' : i === 6 ? '6' : i === 12 ? '12' : i === 18 ? '18' : null }
  })
  return (
    <svg viewBox="0 0 300 300" width="300" height="300" style={{ display: 'block' }}>
      <defs>
        <mask id="bz-ring">
          <circle cx={cx} cy={cy} r="148" fill="white" />
          <circle cx={cx} cy={cy} r="117" fill="black" />
        </mask>
        <radialGradient id="bz-gloss" cx="35%" cy="20%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="bz-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>
      {/* Black base ring */}
      <circle cx={cx} cy={cy} r="148" fill="#111" mask="url(#bz-ring)" />
      {/* Red top half (0-12h = top semicircle) */}
      <rect x="0" y="0" width="300" height="150" fill="#b82828" mask="url(#bz-ring)" />
      {/* Divider line */}
      <rect x="0" y="146" width="300" height="8" fill="rgba(0,0,0,0.7)" mask="url(#bz-ring)" />
      {/* Gloss */}
      <circle cx={cx} cy={cy} r="148" fill="url(#bz-gloss)" mask="url(#bz-ring)" />
      {/* Tick marks */}
      {ticks.map(({ i, rad, isMajor, r1, r2 }) => (
        <line key={i}
          x1={cx + Math.cos(rad) * r1} y1={cy + Math.sin(rad) * r1}
          x2={cx + Math.cos(rad) * r2} y2={cy + Math.sin(rad) * r2}
          stroke="rgba(255,255,255,0.75)" strokeWidth={isMajor ? 2.5 : 1} />
      ))}
      {/* Labels */}
      {ticks.filter(t => t.label).map(({ rad, label }) => {
        const r = 122
        return (
          <text key={label}
            x={cx + Math.cos(rad) * r} y={cy + Math.sin(rad) * r}
            textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="bold" opacity="0.9">
            {label}
          </text>
        )
      })}
      {/* CERAMIC label */}
      <text x={cx} y={cy + 138} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.35)" fontSize="6.5" fontFamily="sans-serif" letterSpacing="4">
        CERAMIC
      </text>
      {/* Edge highlight */}
      <circle cx={cx} cy={cy} r="147.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="117.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
    </svg>
  )
}

function SvgCrystal() {
  return (
    <svg viewBox="0 0 265 265" width="265" height="265" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="cr-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(140,180,255,0.08)" />
          <stop offset="100%" stopColor="rgba(80,120,200,0.04)" />
        </radialGradient>
        <filter id="cr-blur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      {/* Glass body */}
      <circle cx="132" cy="132" r="128" fill="url(#cr-bg)" />
      {/* Main arc reflection */}
      <path d="M 55,65 Q 132,30 210,65" fill="none"
        stroke="rgba(255,255,255,0.55)" strokeWidth="10" strokeLinecap="round"
        filter="url(#cr-blur)" opacity="0.8" />
      {/* Secondary thin reflection */}
      <path d="M 80,52 Q 132,38 185,52" fill="none"
        stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
      {/* Edge dome shadow */}
      <circle cx="132" cy="132" r="127" fill="none"
        stroke="rgba(0,0,0,0.25)" strokeWidth="4" />
      {/* "SAPPHIRE AR" engraving */}
      <text x="132" y="230" textAnchor="middle" dominantBaseline="middle"
        fill="rgba(200,220,255,0.2)" fontSize="6" fontFamily="sans-serif" letterSpacing="3">
        SAPPHIRE AR
      </text>
    </svg>
  )
}

function SvgDial() {
  const cx = 120, cy = 120
  const indices = Array.from({ length: 12 }, (_, i) => ({
    i, angle: i * 30,
    isMajor: i % 3 === 0,
  }))
  return (
    <svg viewBox="0 0 240 240" width="240" height="240" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="dl-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1a1e2e" />
          <stop offset="50%" stopColor="#0d1018" />
          <stop offset="100%" stopColor="#07080f" />
        </radialGradient>
        <linearGradient id="dl-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c87a" />
          <stop offset="50%" stopColor="#c4964a" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
        <linearGradient id="dl-hand-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d0d8e0" />
          <stop offset="50%" stopColor="#f0f4f8" />
          <stop offset="100%" stopColor="#b0b8c0" />
        </linearGradient>
        <filter id="dl-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.6)" />
        </filter>
        <filter id="dl-glow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Dial face */}
      <circle cx={cx} cy={cy} r="116" fill="url(#dl-bg)" />

      {/* Sunburst radial lines — subtle */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2
        return (
          <line key={i}
            x1={cx + Math.cos(a) * 30} y1={cy + Math.sin(a) * 30}
            x2={cx + Math.cos(a) * 112} y2={cy + Math.sin(a) * 112}
            stroke="rgba(255,255,255,0.025)" strokeWidth="0.8" />
        )
      })}

      {/* Hour indices */}
      {indices.map(({ i, angle, isMajor }) => {
        const w = isMajor ? 5 : 3, h = isMajor ? 16 : 10
        return (
          <rect key={i}
            x={cx - w / 2} y={cy - 104}
            width={w} height={h} rx="1"
            fill="url(#dl-gold)"
            transform={`rotate(${angle}, ${cx}, ${cy})`}
            filter="url(#dl-shadow)" />
        )
      })}

      {/* Lume dots at each index */}
      {indices.map(({ i, angle }) => {
        const rad = ((angle - 90) * Math.PI) / 180
        const r = 96
        return (
          <circle key={`lume-${i}`}
            cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r}
            r="2.5" fill="rgba(150,255,100,0.55)" filter="url(#dl-glow)" />
        )
      })}

      {/* Minute hand — pointing ~10:10 (70°) */}
      <g transform={`rotate(62, ${cx}, ${cy})`} filter="url(#dl-shadow)">
        <polygon points={`${cx - 1.5},${cy} ${cx},${cy - 100} ${cx + 1.5},${cy} ${cx + 2},${cy + 10} ${cx - 2},${cy + 10}`}
          fill="url(#dl-hand-h)" />
      </g>

      {/* Hour hand — ~10:10 (-60°) */}
      <g transform={`rotate(-58, ${cx}, ${cy})`} filter="url(#dl-shadow)">
        <polygon points={`${cx - 3},${cy} ${cx},${cy - 68} ${cx + 3},${cy} ${cx + 4},${cy + 12} ${cx - 4},${cy + 12}`}
          fill="url(#dl-hand-h)" />
      </g>

      {/* GMT hand — red/orange, pointing 12 */}
      <g filter="url(#dl-shadow)">
        {/* Shaft */}
        <rect x={cx - 1} y={cy - 108} width="2" height="118" rx="1" fill="#e83030" />
        {/* Triangle arrow top */}
        <polygon points={`${cx - 6},${cy - 88} ${cx},${cy - 108} ${cx + 6},${cy - 88}`} fill="#e83030" />
        {/* Disc */}
        <circle cx={cx} cy={cy - 75} r="7" fill="none" stroke="#e83030" strokeWidth="3" />
        {/* Counter weight */}
        <rect x={cx - 2} y={cy + 10} width="4" height="16" rx="1" fill="#e83030" />
      </g>

      {/* Center cap */}
      <circle cx={cx} cy={cy} r="5" fill="url(#dl-gold)" />
      <circle cx={cx} cy={cy} r="2.5" fill="#c4964a" />

      {/* Date window at 3 o'clock */}
      <rect x="175" y="112" width="22" height="16" rx="2" fill="white" />
      <text x="186" y="121" textAnchor="middle" dominantBaseline="middle"
        fill="#111" fontSize="8" fontFamily="sans-serif" fontWeight="bold">18</text>

      {/* Brand text */}
      <text x={cx} y={cy - 40} textAnchor="middle" dominantBaseline="middle"
        fill="url(#dl-gold)" fontSize="8.5" fontFamily="Georgia, serif" letterSpacing="3">
        MODWATCH
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(196,150,74,0.45)" fontSize="5.5" fontFamily="sans-serif" letterSpacing="2.5">
        AUTOMATIC
      </text>

      {/* Outer bezel ring — thin */}
      <circle cx={cx} cy={cy} r="115" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  )
}

function SvgCaseBody() {
  return (
    <svg viewBox="0 0 300 380" width="300" height="380" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cs-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a7880" />
          <stop offset="25%" stopColor="#8a9aa8" />
          <stop offset="50%" stopColor="#a8b8c4" />
          <stop offset="75%" stopColor="#7a8a96" />
          <stop offset="100%" stopColor="#5a6870" />
        </linearGradient>
        <linearGradient id="cs-lug" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#58686e" />
          <stop offset="50%" stopColor="#9aacb8" />
          <stop offset="100%" stopColor="#58686e" />
        </linearGradient>
        {/* Brushed texture */}
        <pattern id="cs-brush" x="0" y="0" width="4" height="1" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="rgba(255,255,255,0.04)" />
          <rect y="0" width="1" height="1" fill="rgba(0,0,0,0.06)" />
        </pattern>
      </defs>

      {/* Top lugs */}
      <rect x="88" y="10" width="44" height="62" rx="8" fill="url(#cs-lug)" />
      <rect x="168" y="10" width="44" height="62" rx="8" fill="url(#cs-lug)" />

      {/* Bottom lugs */}
      <rect x="88" y="308" width="44" height="62" rx="8" fill="url(#cs-lug)" />
      <rect x="168" y="308" width="44" height="62" rx="8" fill="url(#cs-lug)" />

      {/* Lug bars */}
      <rect x="88" y="60" width="124" height="8" rx="2" fill="rgba(0,0,0,0.3)" />
      <rect x="88" y="312" width="124" height="8" rx="2" fill="rgba(0,0,0,0.3)" />

      {/* Main case body */}
      <circle cx="150" cy="190" r="132" fill="url(#cs-steel)" />
      <circle cx="150" cy="190" r="132" fill="url(#cs-brush)" />

      {/* Mid-case highlight ring */}
      <circle cx="150" cy="190" r="131" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="150" cy="190" r="120" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />

      {/* Inner bezel seat */}
      <circle cx="150" cy="190" r="120" fill="rgba(0,0,0,0.15)" />
      <circle cx="150" cy="190" r="119" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Caseback cutout circle */}
      <circle cx="150" cy="190" r="112" fill="hsl(15 8% 14%)" />

      {/* Crown notch */}
      <rect x="279" y="182" width="22" height="16" rx="5" fill="url(#cs-steel)" />
      <rect x="282" y="185" width="18" height="10" rx="3" fill="rgba(0,0,0,0.4)" />

      {/* Brushed horizontal lines on case side */}
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i}
          x1="20" y1={128 + i * 7} x2="280" y2={128 + i * 7}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}
    </svg>
  )
}

function SvgCrown() {
  return (
    <svg viewBox="0 0 38 82" width="38" height="82" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cr-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#58686e" />
          <stop offset="30%" stopColor="#9aacb8" />
          <stop offset="70%" stopColor="#8a9caa" />
          <stop offset="100%" stopColor="#4a585e" />
        </linearGradient>
        <linearGradient id="cr-gold-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a7030" />
          <stop offset="50%" stopColor="#d4a050" />
          <stop offset="100%" stopColor="#9a7030" />
        </linearGradient>
      </defs>
      {/* Crown tube */}
      <rect x="10" y="0" width="18" height="14" rx="4" fill="url(#cr-steel)" />
      {/* Main crown body */}
      <rect x="4" y="14" width="30" height="54" rx="6" fill="url(#cr-steel)" />
      {/* Knurling lines */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x="4" y={15 + i * 4} width="30" height="1.5"
          fill="rgba(0,0,0,0.25)" rx="0.5" />
      ))}
      {/* Gold accent band */}
      <rect x="4" y="34" width="30" height="8" rx="2" fill="url(#cr-gold-band)" />
      {/* Logo pip */}
      <circle cx="19" cy="38" r="2" fill="rgba(0,0,0,0.4)" />
      {/* Bottom cap */}
      <rect x="7" y="68" width="24" height="14" rx="5" fill="url(#cr-steel)" />
      {/* Highlight */}
      <rect x="5" y="14" width="4" height="54" rx="2" fill="rgba(255,255,255,0.18)" />
    </svg>
  )
}

function SvgCaseback() {
  const cx = 130, cy = 130
  const screws = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6
    return { cx: cx + Math.cos(a) * 112, cy: cy + Math.sin(a) * 112 }
  })
  return (
    <svg viewBox="0 0 260 260" width="260" height="260" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="cb-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#8a9aa8" />
          <stop offset="60%" stopColor="#607080" />
          <stop offset="100%" stopColor="#405060" />
        </radialGradient>
        <radialGradient id="cb-window" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#1e2830" />
          <stop offset="100%" stopColor="#0e1820" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r="128" fill="url(#cb-bg)" />
      <circle cx={cx} cy={cy} r="127" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {/* Inner exhibition ring */}
      <circle cx={cx} cy={cy} r="116" fill="rgba(0,0,0,0.3)" />
      {/* Exhibition glass */}
      <circle cx={cx} cy={cy} r="108" fill="url(#cb-window)" />
      {/* Glass reflection */}
      <path d={`M ${cx - 55},${cy - 70} Q ${cx},${cy - 90} ${cx + 55},${cy - 70}`}
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round" />
      {/* Movement silhouette inside */}
      <circle cx={cx} cy={cy} r="85" fill="none" stroke="rgba(196,150,74,0.2)" strokeWidth="1" />
      <circle cx={cx} cy={cy + 10} r="40" fill="none" stroke="rgba(196,150,74,0.12)" strokeWidth="0.8" />
      {/* Rotor silhouette */}
      <path d={`M ${cx},${cy + 10} m -38,0 a 38,38 0 0,1 57,-20 L ${cx},${cy + 10} Z`}
        fill="rgba(196,150,74,0.1)" />
      {/* Engraved text around ring */}
      <path id="cb-text-path"
        d={`M ${cx},${cy} m -100,0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0`}
        fill="none" />
      <text fontSize="7" fontFamily="sans-serif" letterSpacing="3.5" fill="rgba(255,255,255,0.4)">
        <textPath href="#cb-text-path" startOffset="5%">
          MODWATCH · AUTOMATIC · NH35A · 21 JEWELS · MADE IN SPAIN ·
        </textPath>
      </text>
      {/* Screw heads */}
      {screws.map(({ cx: scx, cy: scy }, i) => (
        <g key={i}>
          <circle cx={scx} cy={scy} r="6" fill="#7a8a96" />
          <circle cx={scx} cy={scy} r="5.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <line x1={scx - 3} y1={scy} x2={scx + 3} y2={scy}
            stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

function SvgMovement() {
  const cx = 115, cy = 115
  return (
    <svg viewBox="0 0 230 230" width="230" height="230" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="mv-plate" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#c8a850" />
          <stop offset="50%" stopColor="#a88830" />
          <stop offset="100%" stopColor="#806018" />
        </radialGradient>
        <linearGradient id="mv-bridge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ab0c0" />
          <stop offset="100%" stopColor="#6a8090" />
        </linearGradient>
        <radialGradient id="mv-rotor" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#d0d8e4" />
          <stop offset="60%" stopColor="#8a9aaa" />
          <stop offset="100%" stopColor="#5a6a7a" />
        </radialGradient>
        <pattern id="mv-lines" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* Main plate */}
      <circle cx={cx} cy={cy} r="112" fill="url(#mv-plate)" />
      <circle cx={cx} cy={cy} r="112" fill="url(#mv-lines)" />
      {/* Jewels */}
      {[[-35, -35], [35, -45], [-50, 20], [50, 30], [0, 55], [-20, -60]].map(([dx, dy], i) => (
        <g key={i}>
          <circle cx={cx + dx} cy={cy + dy} r="5.5" fill="#c03030" />
          <circle cx={cx + dx} cy={cy + dy} r="3" fill="rgba(255,100,100,0.6)" />
          <circle cx={cx + dx - 1.5} cy={cy + dy - 1.5} r="1.5" fill="rgba(255,200,200,0.8)" />
        </g>
      ))}
      {/* Bridges (steel strips) */}
      <rect x={cx - 80} y={cy - 12} width="95" height="24" rx="4"
        fill="url(#mv-bridge)" opacity="0.85" />
      <rect x={cx - 20} y={cy - 85} width="24" height="70" rx="4"
        fill="url(#mv-bridge)" opacity="0.85" />
      <rect x={cx + 20} y={cy + 20} width="70" height="22" rx="4"
        fill="url(#mv-bridge)" opacity="0.85" />
      {/* Côtes de Genève stripes on bridges */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i}
          x1={cx - 80 + i * 12} y1={cy - 12} x2={cx - 80 + i * 12} y2={cy + 12}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}
      {/* Gear wheels */}
      {[[cx + 40, cy - 40, 18], [cx - 45, cy + 42, 14], [cx + 10, cy + 50, 10]].map(([gx, gy, gr], i) => (
        <g key={i}>
          <circle cx={gx} cy={gy} r={gr} fill="url(#mv-plate)" />
          {Array.from({ length: Math.round(gr * 2) }, (_, t) => {
            const a = (t / Math.round(gr * 2)) * Math.PI * 2
            const r1 = gr, r2 = gr + 4
            return (
              <line key={t}
                x1={gx + Math.cos(a) * r1} y1={gy + Math.sin(a) * r1}
                x2={gx + Math.cos(a) * r2} y2={gy + Math.sin(a) * r2}
                stroke="#806018" strokeWidth="2.5" />
            )
          })}
          <circle cx={gx} cy={gy} r="3" fill="rgba(0,0,0,0.5)" />
        </g>
      ))}
      {/* Rotor (oscillating weight) — D-shape */}
      <path d={`M ${cx},${cy} L ${cx + 95},${cy} A 95,95 0 1,0 ${cx},${cy - 95} Z`}
        fill="url(#mv-rotor)" opacity="0.88" />
      <path d={`M ${cx},${cy} L ${cx + 95},${cy} A 95,95 0 1,0 ${cx},${cy - 95} Z`}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Rotor cutout */}
      <circle cx={cx + 30} cy={cy - 30} r="32" fill="url(#mv-plate)" opacity="0.6" />
      {/* Rotor center pivot */}
      <circle cx={cx} cy={cy} r="8" fill="#8a9aaa" />
      <circle cx={cx} cy={cy} r="4" fill="rgba(0,0,0,0.6)" />
      {/* Outer edge */}
      <circle cx={cx} cy={cy} r="111" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* "NH35A" text */}
      <text x={cx} y={cy - 70} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="sans-serif" letterSpacing="3">
        NH35A
      </text>
    </svg>
  )
}

function SvgStrapTop() {
  return (
    <svg viewBox="0 0 102 195" width="102" height="195" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="st-center" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a7880" />
          <stop offset="50%" stopColor="#9aaab8" />
          <stop offset="100%" stopColor="#6a7880" />
        </linearGradient>
        <linearGradient id="st-outer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a9aa8" />
          <stop offset="50%" stopColor="#c0d0dc" />
          <stop offset="100%" stopColor="#8a9aa8" />
        </linearGradient>
      </defs>
      {/* 5 rows of 3 links */}
      {Array.from({ length: 5 }, (_, row) => (
        <g key={row}>
          {/* Left outer link */}
          <rect x="1" y={row * 38 + 2} width="26" height="34" rx="3" fill="url(#st-outer)" />
          <rect x="3" y={row * 38 + 4} width="22" height="30" rx="2" fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {/* Center link */}
          <rect x="29" y={row * 38 + 1} width="44" height="36" rx="3" fill="url(#st-center)" />
          {/* Brushed lines on center */}
          {Array.from({ length: 6 }, (_, l) => (
            <line key={l} x1="29" y1={row * 38 + 6 + l * 5} x2="73" y2={row * 38 + 6 + l * 5}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
          {/* Right outer link */}
          <rect x="75" y={row * 38 + 2} width="26" height="34" rx="3" fill="url(#st-outer)" />
          <rect x="77" y={row * 38 + 4} width="22" height="30" rx="2" fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {/* Link separator shadow */}
          <line x1="0" y1={row * 38} x2="102" y2={row * 38}
            stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        </g>
      ))}
      {/* Top edge where it meets the case lug */}
      <rect x="0" y="190" width="102" height="5" rx="2" fill="rgba(0,0,0,0.5)" />
      {/* Side highlight */}
      <rect x="0" y="0" width="3" height="190" fill="rgba(255,255,255,0.12)" rx="1" />
      <rect x="99" y="0" width="3" height="190" fill="rgba(255,255,255,0.12)" rx="1" />
    </svg>
  )
}

function SvgStrapBottom() {
  return (
    <svg viewBox="0 0 102 195" width="102" height="195" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sb-center" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a7880" />
          <stop offset="50%" stopColor="#9aaab8" />
          <stop offset="100%" stopColor="#6a7880" />
        </linearGradient>
        <linearGradient id="sb-outer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a9aa8" />
          <stop offset="50%" stopColor="#c0d0dc" />
          <stop offset="100%" stopColor="#8a9aa8" />
        </linearGradient>
      </defs>
      {/* Clasp at bottom */}
      <rect x="15" y="155" width="72" height="38" rx="6" fill="url(#sb-center)" />
      <rect x="18" y="158" width="66" height="32" rx="4" fill="none"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <line x1="51" y1="155" x2="51" y2="193" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
      <text x="51" y="174" textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="sans-serif" letterSpacing="1">
        MODWATCH
      </text>
      {/* 4 rows of links */}
      {Array.from({ length: 4 }, (_, row) => (
        <g key={row}>
          <rect x="1" y={row * 38 + 2} width="26" height="34" rx="3" fill="url(#sb-outer)" />
          <rect x="29" y={row * 38 + 1} width="44" height="36" rx="3" fill="url(#sb-center)" />
          {Array.from({ length: 6 }, (_, l) => (
            <line key={l} x1="29" y1={row * 38 + 6 + l * 5} x2="73" y2={row * 38 + 6 + l * 5}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
          <rect x="75" y={row * 38 + 2} width="26" height="34" rx="3" fill="url(#sb-outer)" />
          <line x1="0" y1={row * 38} x2="102" y2={row * 38}
            stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        </g>
      ))}
      <rect x="0" y="0" width="3" height="152" fill="rgba(255,255,255,0.12)" rx="1" />
      <rect x="99" y="0" width="3" height="152" fill="rgba(255,255,255,0.12)" rx="1" />
    </svg>
  )
}

// ─── PIECES CONFIG ────────────────────────────────────────────────────────────

const PIECES = [
  {
    id: 'strap-top', Svg: SvgStrapTop, label: 'Correa Integrada', spec: 'Acero 316L · Oyster',
    assembled: { x: 0, y: -285 }, exploded: { x: 0, y: -430, rotation: 0 },
    zIndex: 1,
  },
  {
    id: 'strap-bottom', Svg: SvgStrapBottom, label: 'Cierre de Seguridad', spec: 'Doble mariposa',
    assembled: { x: 0, y: 285 }, exploded: { x: 0, y: 420, rotation: 0 },
    zIndex: 1,
  },
  {
    id: 'caseback', Svg: SvgCaseback, label: 'Fondo Exhibition', spec: 'Cristal mineral · Ver movimiento',
    assembled: { x: 0, y: 0 }, exploded: { x: 80, y: 235, rotation: 10 },
    zIndex: 2,
  },
  {
    id: 'movement', Svg: SvgMovement, label: 'Calibre NH35A', spec: '21 rubíes · 41h reserva',
    assembled: { x: 0, y: 0, opacity: 0 }, exploded: { x: 0, y: 0, rotation: 0, opacity: 1 },
    zIndex: 3,
  },
  {
    id: 'case-body', Svg: SvgCaseBody, label: 'Caja Acero 316L', spec: 'Satinado · 47mm',
    assembled: { x: 0, y: 0 }, exploded: { x: -100, y: 150, rotation: -6 },
    zIndex: 4,
  },
  {
    id: 'crown', Svg: SvgCrown, label: 'Corona Roscada', spec: 'Rosca doble · 100m WR',
    assembled: { x: 152, y: 0 }, exploded: { x: 295, y: 55, rotation: 22 },
    zIndex: 4,
  },
  {
    id: 'bezel', Svg: SvgBezel, label: 'Bisel Cerámico GMT', spec: 'Cerámica inyectada · Escala 24h',
    assembled: { x: 0, y: 0 }, exploded: { x: -245, y: -52, rotation: -18 },
    zIndex: 5,
  },
  {
    id: 'dial', Svg: SvgDial, label: 'Esfera Sunburst', spec: 'Índices aplicados · Lume Pro',
    assembled: { x: 0, y: 0 }, exploded: { x: 118, y: -138, rotation: 8 },
    zIndex: 6,
  },
  {
    id: 'crystal', Svg: SvgCrystal, label: 'Cristal Zafiro AR', spec: 'Doble anti-reflectante',
    assembled: { x: 0, y: 0 }, exploded: { x: -142, y: -218, rotation: -14 },
    zIndex: 7,
  },
]

// ─── FADE UP HELPER ───────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

function BlurText({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, filter: 'blur(14px)', y: 12 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}>
          {w}
        </motion.span>
      ))}
    </span>
  )
}

// ─── HERO EXPLODED ────────────────────────────────────────────────────────────

export default function HeroExploded({ onAddToCart }) {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const explodedMsgRef = useRef(null)
  const bgRef = useRef(null)

  const heroProduct = products.find(p => p.id === 'gmt-bruiser') || products[0]

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const factor = isMobile ? 0.55 : 1

    const ctx = gsap.context(() => {
      // ── Initial assembled positions ──
      gsap.set('.watch-piece', { xPercent: -50, yPercent: -50 })
      PIECES.forEach(p => {
        gsap.set(`#piece-${p.id}`, {
          x: p.assembled.x,
          y: p.assembled.y,
          rotation: 0,
          opacity: p.assembled.opacity !== undefined ? p.assembled.opacity : 1,
          zIndex: p.zIndex,
        })
      })
      gsap.set('.piece-label', { opacity: 0 })
      gsap.set(explodedMsgRef.current, { opacity: 0 })

      // ── ScrollTrigger timeline ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      })

      // Phase 0-2: Static (hero text visible)

      // Phase 2-5.5: Explode pieces + fade hero text
      tl.to(textRef.current, { opacity: 0, y: -30, duration: 1 }, 1.5)
      tl.to(bgRef.current, { opacity: 0.6, duration: 1.5 }, 1.8)

      PIECES.forEach((p, idx) => {
        const ex = p.exploded
        tl.to(`#piece-${p.id}`, {
          x: ex.x * factor,
          y: ex.y * factor,
          rotation: (ex.rotation || 0),
          ...(p.id === 'movement' ? { opacity: 1 } : {}),
          duration: 1.5,
          ease: 'power2.out',
        }, 2 + idx * 0.07)
      })

      // Phase 5-6: Labels appear + center message
      tl.to('.piece-label', { opacity: 1, duration: 0.5 }, 4.8)
      tl.to(explodedMsgRef.current, { opacity: 1, duration: 0.6 }, 5)

      // Phase 6.5-9: Reassemble
      tl.to('.piece-label', { opacity: 0, duration: 0.4 }, 6.2)
      tl.to(explodedMsgRef.current, { opacity: 0, duration: 0.4 }, 6.2)

      PIECES.forEach((p, idx) => {
        tl.to(`#piece-${p.id}`, {
          x: p.assembled.x,
          y: p.assembled.y,
          rotation: 0,
          ...(p.id === 'movement' ? { opacity: 0 } : {}),
          duration: 1.4,
          ease: 'power2.inOut',
        }, 6.5 + idx * 0.06)
      })

      // Phase 9-10: Scale down + exit
      tl.to('.watch-stage', { scale: 0.35, opacity: 0, y: -60, duration: 1, ease: 'power2.in' }, 9)
      tl.to(textRef.current, { opacity: 1, y: 0, duration: 0.8 }, 9.1)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero-exploded" ref={sectionRef} aria-label="Presentación del reloj">
      <div className="hero-exploded-sticky">
        {/* Background glow */}
        <div className="hero-exp-bg" ref={bgRef} />

        {/* Watch stage — all SVG pieces live here */}
        <div className="watch-stage">
          {PIECES.map(({ id, Svg, label, spec, zIndex }) => (
            <div key={id} id={`piece-${id}`} className="watch-piece" style={{ zIndex }}>
              <Svg />
              <div className={`piece-label piece-label-${id}`}>
                <span className="piece-label-name">{label}</span>
                <span className="piece-label-spec">{spec}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hero text overlay */}
        <div className="hero-text-overlay" ref={textRef}>
          <FadeUp delay={0.1}>
            <div className="hero-badge liquid-glass">Pieza del mes · Edición limitada</div>
          </FadeUp>
          <h1 className="hero-title">
            <BlurText text={heroProduct.name} />
          </h1>
          <FadeUp delay={0.4}>
            <p className="hero-specs">{heroProduct.movement} · {heroProduct.specs}</p>
          </FadeUp>
          <FadeUp delay={0.55}>
            <div className="hero-ctas">
              <button className="btn btn-gold" onClick={() => onAddToCart(heroProduct, 0)}>
                Comprar · {heroProduct.variants[0].price}€
              </button>
              <a href="#catalogo" className="btn btn-glass">Ver Catálogo</a>
            </div>
          </FadeUp>
        </div>

        {/* Exploded state message */}
        <div className="hero-exploded-msg" ref={explodedMsgRef}>
          <div className="section-badge" style={{ justifyContent: 'center' }}>Ingeniería de precisión</div>
          <h2 className="hero-exploded-headline">Artesanía en<br /><em>cada componente</em></h2>
          <p className="hero-exploded-sub">Cada pieza seleccionada, ensamblada y ajustada a mano<br />en nuestro taller de Sant Cugat del Vallès.</p>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  )
}
