# MODWATCH — Seiko Mod Store | Guía Maestra de Desarrollo

> Este archivo es la fuente única de verdad del proyecto. Léelo completo antes de tocar cualquier archivo.

---

## 0. VISIÓN DEL PROYECTO

Estamos construyendo una tienda online premium de relojes Seiko modificados artesanalmente. La web debe transmitir la misma sensación que las páginas de producto de Apple, Omega o Hodinkee: cinematográfica, táctil, inmersiva. El usuario debe sentir que está tocando el reloj a través de la pantalla.

**Lo que el usuario ve:** una experiencia 3D donde los relojes rotan con el scroll, flotan en el espacio, y cada interacción se siente física y premium.

**Lo que hay por debajo:** una tienda funcional completa con catálogo, carrito, configurador de mods, checkout con Stripe, y formulario de contacto.

**Referencia visual:** Apple AirPods Pro page + Omega Seamaster page + Hodinkee shop. Esa intersección exacta.

---

## 1. STACK TÉCNICO — NO NEGOCIABLE

```
Vite + React 18 + TypeScript
Tailwind CSS v4 (@theme directive)
Three.js + @react-three/fiber + @react-three/drei
Framer Motion (motion/react) — texto y elementos UI
GSAP + ScrollTrigger — scroll-linked animations y scrub
shadcn/ui (button, accordion, sheet, dialog)
Stripe.js — checkout y pagos
lucide-react — iconos
```

### Instalación de dependencias

```bash
npm install -D tailwindcss@next @tailwindcss/vite autoprefixer
npm install motion gsap @gsap/react
npm install three @react-three/fiber @react-three/drei
npm install lucide-react stripe @stripe/stripe-js
npx shadcn@latest init -d
npx shadcn@latest add button accordion sheet dialog
```

---

## 2. ESTRUCTURA DE ARCHIVOS

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── three/
│   │   ├── WatchScene.tsx          # Escena 3D principal del hero
│   │   ├── WatchModel.tsx          # Modelo 3D del reloj (geometría procedural)
│   │   ├── ProductViewer360.tsx    # Visor 360° con fotos reales en catálogo
│   │   ├── FloatingWatch.tsx       # Reloj flotante para secciones intermedias
│   │   └── WatchConfigurator3D.tsx # Preview 3D del configurador de mods
│   ├── layout/
│   │   ├── Navbar.tsx              # Nav flotante liquid-glass
│   │   └── Footer.tsx              # Footer cinematográfico
│   ├── sections/
│   │   ├── Hero.tsx                # Hero con reloj 3D + scroll-scrub
│   │   ├── Marquee.tsx             # Franja animada de features
│   │   ├── Catalog.tsx             # Grid de productos con filtros
│   │   ├── ProductCard.tsx         # Card individual con hover 3D
│   │   ├── FeaturedProduct.tsx     # Producto destacado pantalla completa
│   │   ├── ModsSection.tsx         # Sección de personalización
│   │   ├── ModConfigurator.tsx     # Configurador interactivo
│   │   ├── Lookbook.tsx            # Galería horizontal con parallax
│   │   ├── StatsBar.tsx            # Stats con fondo cinematic
│   │   ├── Testimonials.tsx        # Reviews en marquee doble
│   │   ├── Faq.tsx                 # FAQ accordion dos columnas
│   │   ├── Contact.tsx             # Formulario de contacto
│   │   └── CtaBanner.tsx           # CTA final antes del footer
│   ├── cart/
│   │   ├── CartSidebar.tsx         # Carrito lateral slide-in
│   │   ├── CartItem.tsx            # Item individual del carrito
│   │   └── CheckoutModal.tsx       # Modal de pago Stripe
│   ├── ui/
│   │   ├── BlurText.tsx            # Animación de texto word-by-word
│   │   ├── LiquidGlass.tsx         # Wrapper reutilizable liquid-glass
│   │   ├── SectionBadge.tsx        # Badge "Catálogo", "Mods", etc.
│   │   ├── ParallaxImage.tsx       # Imagen con efecto parallax
│   │   └── MagneticButton.tsx      # Botón con efecto magnético al hover
│   └── ui/ (shadcn)
│       ├── button.tsx
│       ├── accordion.tsx
│       ├── sheet.tsx
│       └── dialog.tsx
├── lib/
│   ├── constants.ts                # Datos del catálogo, precios, specs
│   ├── cart-store.ts               # Estado global del carrito (zustand o context)
│   ├── utils.ts                    # Helpers
│   └── stripe.ts                   # Config de Stripe
├── hooks/
│   ├── useScrollProgress.ts        # Hook para scroll progress 0→1
│   ├── useSmoothScroll.ts          # Lenis smooth scroll
│   └── useMediaQuery.ts            # Responsive breakpoints
public/
├── watches/                        # FOTOS REALES DE LOS RELOJES
│   ├── obsidian-diver/             # Una subcarpeta por modelo
│   │   ├── 001.jpg ... 060.jpg     # Fotos desde todos los ángulos
│   ├── midnight-blue/
│   ├── desert-field/
│   ├── forest-diver/
│   ├── red-dial-dress/
│   └── violet-night/
├── videos/                         # Vídeos de fondo para Stats y CTA
├── logo.svg
└── og-image.jpg
```

---

## 3. PALETA DE COLOR Y TOKENS DE DISEÑO

```css
:root {
  /* Paleta base — HSL sin wrapper */
  --ink:         15 10% 7%;        /* Casi negro cálido */
  --ink-soft:    15 6% 22%;
  --ink-muted:   20 4% 52%;
  --cream:       38 30% 93%;       /* Blanco cálido */
  --cream-dark:  36 20% 86%;
  --gold:        36 60% 52%;       /* Dorado relojero */
  --gold-light:  38 50% 72%;
  --gold-muted:  34 30% 40%;
  --terra:       14 55% 31%;       /* Tierra — acentos secundarios */

  /* Semánticos */
  --background:       var(--ink);
  --foreground:       var(--cream);
  --primary:          var(--gold);
  --primary-foreground: var(--ink);
  --accent:           var(--gold);
  --border:           38 30% 93% / 0.12;
  --ring:             var(--gold);

  /* Tipografía */
  --font-display: "Playfair Display", "Georgia", serif;
  --font-body:    "Outfit", -apple-system, system-ui, sans-serif;

  /* Layout */
  --gutter: clamp(20px, 4.2vw, 56px);
  --max:    1440px;
  --nav-h:  72px;
  --ease:   cubic-bezier(0.22, 1, 0.36, 1);
}
```

**Regla de oro:** El fondo es SIEMPRE oscuro (ink). Los textos son cream. Los acentos son gold. No hay otro color. La sofisticación viene de la restricción.

---

## 4. LIQUID-GLASS SYSTEM

Estas dos clases son el ADN visual de toda la web. Cada card, pill, botón, nav, modal las usa.

```css
@layer components {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
    position: relative;
    overflow: hidden;
  }
  .liquid-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.2px;
    background: linear-gradient(180deg,
      rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 25%,
      rgba(255,255,255,0)    45%, rgba(255,255,255,0)    55%,
      rgba(255,255,255,0.10) 75%, rgba(255,255,255,0.35) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .liquid-glass-strong {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1),
                inset 0 1px 1px rgba(255, 255, 255, 0.12);
    position: relative;
    overflow: hidden;
  }
  .liquid-glass-strong::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.4px;
    background: linear-gradient(180deg,
      rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 25%,
      rgba(255,255,255,0)    45%, rgba(255,255,255,0)    55%,
      rgba(255,255,255,0.15) 75%, rgba(255,255,255,0.45) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .noise::after {
    content: "";
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    opacity: .4; mix-blend-mode: overlay; pointer-events: none;
  }
}
```

**NUNCA uses `border` normal en dark mode.** Siempre liquid-glass ::before.
**NUNCA uses `shadow-xl` o `shadow-2xl`.** Profundidad = backdrop-blur + inset highlights.

---

## 5. SISTEMA DE ANIMACIONES — 5 PRIMITIVAS, NADA MÁS

Toda animación del sitio viene de una de estas cinco. No inventes nuevas.

### 5.1 BlurText — Headings
Cada heading de sección usa esto. Palabra por palabra, con blur de entrada.
- Delay entre palabras: 0.07s
- Duración por palabra: 0.7s
- Easing: cubic-bezier(0.22, 1, 0.36, 1)
- Trigger: inView, once: true

### 5.2 Fade-Up-On-View — Subtextos, CTAs, cards
```tsx
initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
viewport={{ once: true, amount: 0.3 }}
transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
```

### 5.3 Scroll-Scrub 3D — HERO Y PRODUCTO DESTACADO
El reloj 3D rota controlado por el scroll progress (0→1).
- Hero: el reloj gira 360° en Y mientras el usuario hace scroll
- Las fotos reales se mapean como textura del reloj o se muestran en secuencia canvas
- GSAP ScrollTrigger con scrub: true, snap: false
- El contenido de texto tiene parallax con velocidad diferente

### 5.4 Marquee — Partners, features, testimonios
- Velocidad: 28s dirección normal, 32s reversa
- Máscara de gradiente en los bordes (fade)
- Pausa on hover
- Array duplicado para loop seamless

### 5.5 Hover 3D — Product Cards
Cada product card tiene un tilt 3D sutil al mover el ratón:
```tsx
// El card rota en perspectiva siguiendo la posición del cursor
// rotateX: ±8deg, rotateY: ±8deg
// La imagen del reloj tiene translate3d en dirección opuesta (efecto parallax)
// transition: spring, stiffness: 260, damping: 26
```

---

## 6. SECCIÓN POR SECCIÓN — ESPECIFICACIONES

### SECCIÓN 1: NAVBAR
- Fixed, centrada, floating 16px del top
- Liquid-glass pill con rounded-full
- Logo: "MODWATCH" en font-display, ® en dorado como superíndice
- Links centro: Catálogo, Mods, Lookbook, Reseñas, Contacto
- Derecha: icono carrito con badge count + botón CTA
- On scroll > 40px: reduce padding, aumenta blur
- Mobile: hamburger que abre sheet lateral con links

### SECCIÓN 2: HERO — LA PIEZA CENTRAL
**Estructura:** Section de 300vh. Inner sticky h-screen.

**Fondo:** Escena Three.js con un modelo 3D del reloj Obsidian Diver (el modelo estrella). El reloj está centrado en la escena con iluminación premium:
- Key light: dorada suave desde arriba-derecha
- Fill light: cream desde la izquierda
- Rim light: blanca fría desde atrás (contorno)
- Environment map: estudio oscuro

**Comportamiento del reloj 3D en scroll:**
- 0-30% scroll: el reloj está de frente, ligeramente inclinado. Texto del hero visible.
- 30-60% scroll: el reloj rota 180° mostrando la espalda/laterales. El texto se desvanece.
- 60-90% scroll: el reloj completa 360° volviendo al frente. Aparece el precio/CTA.
- 90-100% scroll: el reloj se aleja (scale down) haciendo transición a la siguiente sección.

**Texto overlay (z-10, sobre el canvas):**
```
[Badge liquid-glass] "Pieza del mes · Edición limitada"

[BlurText h1] "Obsidian Diver"
              font-display uppercase
              clamp(56px, 9vw, 144px)
              leading-[0.92] tracking-[-0.02em]

[Fade-up p]   "Movimiento NH35A · Cristal zafiro AR · 200m WR"
              font-body text-foreground/65

[Fade-up CTAs] [Comprar · 385€] (solid gold)
               [Ver detalles]    (glass outline)
```

**Fallback si el navegador no soporta WebGL:** Mostrar las fotos reales del reloj en secuencia canvas (scroll-scrub con las fotos de public/watches/obsidian-diver/ ordenadas del 001 al 060+).

### SECCIÓN 3: MARQUEE
- Fondo: ink sólido
- Contenido: "Movimiento NH35A ◆ Cristal Zafiro ◆ Montaje Artesanal ◆ 200m WR ◆ Garantía 2 Años ◆ Made in Spain ◆ Envío Asegurado"
- Dos filas: una normal, una reversa
- Texto: font-body, 0.65rem, uppercase, tracking 0.22em, color cream/50%
- Diamantes (◆) en color gold

### SECCIÓN 4: CATÁLOGO
**Layout:** Grid 3 columnas desktop, 2 tablet, 1 mobile.
**Filtros:** Todos | Divers | Dress | Field — pills liquid-glass con active state solid.

**Cada ProductCard:**
- Contenedor: liquid-glass rounded-2xl, hover tilt 3D (±8deg)
- Imagen: aspecto 1:1, fondo surface oscuro, la foto real del reloj centrada
- Al hacer hover: la imagen hace scale 1.05 + rotate sutil + sombra dorada suave
- Badge esquina: "Nuevo" (ink) / "Limitado · X uds" (gold) / "Agotado" (muted)
- Quick-add button: aparece desde abajo con fade-up on hover
- Info debajo: nombre (font-display), referencia (font-body muted), precio (font-display grande)
- Botón +: cuadrado 34px, borde glass, hover se llena ink y pasa a check al añadir

**Catálogo de productos:**
```ts
const PRODUCTS = [
  {
    id: "obsidian-diver",
    name: "Obsidian Diver",
    ref: "MW-001",
    price: 385,
    category: "divers",
    badge: "new",
    specs: { movement: "NH35A", crystal: "Zafiro AR", wr: "200m", case: "Acero 316L" },
    images: "/watches/obsidian-diver/",
    imageCount: 60, // número de fotos disponibles
    description: "Nuestra pieza insignia. Dial negro profundo con indices aplicados en oro."
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    ref: "MW-002",
    price: 390,
    originalPrice: 450,
    category: "dress",
    badge: "limited",
    badgeText: "5 uds",
    specs: { movement: "NH38", crystal: "Zafiro", wr: "100m", case: "Acero 316L" },
    images: "/watches/midnight-blue/",
    imageCount: 45,
    description: "Elegancia nocturna. Esfera azul sunburst con lume aplicado X1."
  },
  {
    id: "desert-field",
    name: "Desert Field",
    ref: "MW-003",
    price: 320,
    category: "field",
    badge: "new",
    specs: { movement: "NH35A", crystal: "Mineral endurecido", wr: "100m", case: "PVD Bronce" },
    images: "/watches/desert-field/",
    imageCount: 50,
    description: "Espíritu aventurero. Acabado PVD bronce con correa NATO tejida a mano."
  },
  {
    id: "forest-diver",
    name: "Forest Diver",
    ref: "MW-004",
    price: 410,
    category: "divers",
    specs: { movement: "NH35A", crystal: "Zafiro AR", wr: "300m", case: "Acero 316L" },
    images: "/watches/forest-diver/",
    imageCount: 40,
    description: "Verde militar profundo. Bisel cerámico unidireccional con escala de buceo."
  },
  {
    id: "red-dial-dress",
    name: "Red Dial Dress",
    ref: "MW-005",
    price: 365,
    category: "dress",
    badge: "limited",
    badgeText: "3 uds",
    specs: { movement: "NH38", crystal: "Zafiro", wr: "50m", case: "Acero pulido" },
    images: "/watches/red-dial-dress/",
    imageCount: 35,
    description: "Rojo profundo que cambia con la luz. Caja slim de 38mm, puro vestir."
  },
  {
    id: "violet-night",
    name: "Violet Night",
    ref: "MW-006",
    price: 440,
    category: "field",
    specs: { movement: "NH35A", crystal: "Zafiro doble AR", wr: "200m", case: "Acero bicolor" },
    images: "/watches/violet-night/",
    imageCount: 55,
    description: "Nuestra pieza más atrevida. Violeta que danza entre púrpura y medianoche."
  }
];
```

### SECCIÓN 5: PRODUCTO DESTACADO
- Layout: 2 columnas. Izquierda = specs + CTA. Derecha = visor 360° del reloj.
- Fondo: ink sólido con gradiente radial dorado sutil en la zona del reloj.
- El visor 360° usa las fotos reales: al arrastrar horizontalmente, recorre las fotos creando efecto de rotación. También funciona con scroll vertical (parallax).
- Specs en grid 2×3: Movimiento, Cristal, Estanqueidad, Reserva, Caja, Unidades.
- Precio grande: font-display 2.5rem, con "desde" en italic dorado como superíndice.
- Botones: [Añadir al Carrito] solid + [Preguntar] glass outline.

### SECCIÓN 6: MODS / PERSONALIZACIÓN
**Dos partes:**

**Parte 1 — Grid de mods disponibles (4 columnas):**
Cards liquid-glass con icono, nombre, descripción, precio "desde X€".
- Cambio de Esfera (desde 45€)
- Upgrade Movimiento (desde 80€)
- Cristal Zafiro (desde 55€)
- Mod Completo (desde 250€)

**Parte 2 — Configurador interactivo:**
- Layout 2 columnas: opciones izquierda, preview derecha
- Opciones: swatches de color esfera, swatches acabado caja, select movimiento, select cristal, select correa
- Preview: visor 3D/foto del reloj que CAMBIA EN TIEMPO REAL al seleccionar opciones
  - El color de fondo del visor cambia según el color de esfera seleccionado
  - El borde/marco cambia según el acabado de caja
- Precio dinámico: se actualiza instantáneamente al cambiar cualquier opción
- Botón: [Solicitar este Mod] + nota "Se confirma precio tras revisión"

### SECCIÓN 7: LOOKBOOK / GALERÍA
- Scroll horizontal con fotos a diferentes tamaños (alternas grande/pequeño)
- Las fotos impares: 320×420px. Las pares: 260×340px con margin-top 3rem (escalonado)
- Efecto parallax: cada foto se mueve a velocidad ligeramente diferente
- Overlay al hover: caption con nombre del modelo en font-display italic
- AQUÍ van las fotos lifestyle (si las hay) o las fotos más artísticas de los relojes

### SECCIÓN 8: STATS BAR
- Fondo: vídeo desaturado (filter: saturate(0)) con gradientes de fade arriba y abajo
- Overlay: card liquid-glass centrada con grid de 4 stats:
  - "147+" Relojes entregados
  - "4.9★" Valoración media
  - "100%" Montaje manual
  - "2 años" Garantía
- Los números cuentan desde 0 al entrar en viewport (countUp animation)
- Separadores verticales entre cada stat (solo desktop)

### SECCIÓN 9: TESTIMONIOS
- Dos filas de marquee en direcciones opuestas
- Cards liquid-glass de 380px ancho con: ícono quote, texto en font-display italic, nombre, modelo comprado, "✓ Compra verificada"
- Máscara de gradiente en los bordes para fade seamless
- Pausa on hover

### SECCIÓN 10: FAQ
- Layout dos columnas: título sticky izquierda, accordion derecha
- Izquierda: badge + BlurText heading "Preguntas frecuentes" + párrafo + botón "Contactar"
- Derecha: shadcn Accordion con 6-8 preguntas
- Trigger: font-display uppercase, se vuelve dorado al abrir
- Content: font-body color muted, max 60ch

### SECCIÓN 11: CONTACTO
- Dos columnas: info izquierda, formulario derecha
- Info: dirección (Sant Cugat del Vallès), WhatsApp, email, plazos de entrega
- Formulario: nombre, teléfono, email, asunto (select), mensaje, botón enviar
- Inputs: fondo surface oscuro, borde glass, focus = borde cream

### SECCIÓN 12: CTA FINAL
- Pantalla completa con vídeo de fondo (brightness 0.5)
- Heading enorme: font-display italic, clamp(56px, 10vw, 160px)
- "¿Tu próximo reloj?" con BlurText
- Dos CTAs: [Ver Catálogo] gold solid + [Contactar] glass
- Footer debajo: copyright + links legales + redes sociales

### CARRITO SIDEBAR
- Sheet lateral derecho (shadcn Sheet)
- Header: "Tu Carrito" + botón cerrar
- Items: foto miniatura + nombre + ref + qty control + precio + botón eliminar
- Footer sticky: total + nota envío + botón [Pagar con Stripe] + badge seguridad
- Animación: slide-in desde derecha con spring

### CHECKOUT MODAL
- Dialog centrado (shadcn Dialog)
- Resumen del pedido arriba
- Formulario: nombre, email, dirección, ciudad, CP
- Stripe Elements card input
- Botón pagar con precio
- Nota: "Pago encriptado SSL · Powered by Stripe"
- STRIPE_PK configurable en lib/stripe.ts

---

## 7. EFECTOS 3D ESPECÍFICOS

### 7.1 Reloj Hero 3D (Three.js)
```
Escena:
- Canvas fullscreen, fondo transparente (se ve el fondo ink de CSS)
- Cámara: PerspectiveCamera, fov: 45, position: [0, 0, 5]
- OrbitControls: DESACTIVADOS (el scroll controla la rotación)

Modelo del reloj (geometría procedural):
- Caja: CylinderGeometry para el cuerpo principal (radio 1.2, height 0.35)
  - Material: MeshPhysicalMaterial, metalness: 0.9, roughness: 0.15, color: acero
  - Bisel: TorusGeometry alrededor del cilindro (radio ligeramente mayor)
  - Material bisel: MeshPhysicalMaterial, metalness: 0.95, roughness: 0.1
- Esfera (dial): CircleGeometry, con la FOTO REAL del dial como textura
  - Cargar: /watches/obsidian-diver/dial.jpg (o la foto más frontal)
- Cristal: CircleGeometry encima del dial
  - Material: MeshPhysicalMaterial, transmission: 0.95, thickness: 0.5, roughness: 0
- Corona: CylinderGeometry pequeño en el lateral derecho
- Correa: NO renderizar en 3D, se ve raro. Solo la caja y dial.

Luces:
- DirectionalLight(gold, 1.2) position [3, 4, 2]       // Key
- DirectionalLight(cream, 0.5) position [-3, 1, 2]     // Fill  
- DirectionalLight(white, 0.3) position [0, -1, -3]    // Rim
- AmbientLight(cream, 0.15)                             // Ambient base

Post-processing (opcional, solo si el rendimiento lo permite):
- Bloom sutil en los reflejos metálicos
- Vignette suave en los bordes del canvas
```

### 7.2 Product Card Tilt 3D
```tsx
// Cada card escucha mousemove y calcula rotación en perspectiva
// perspective: 800px en el contenedor padre
// rotateX: map(mouseY, 0, height, 8, -8) deg
// rotateY: map(mouseX, 0, width, -8, 8) deg
// La imagen interior hace translateZ(20px) para efecto de profundidad
// Transición: spring con stiffness 260, damping 26
// Al salir (mouseleave): vuelve a rotateX(0) rotateY(0) con spring
```

### 7.3 Visor 360° de Producto (fotos reales)
```tsx
// Componente que carga todas las fotos de un modelo
// Array: /watches/{model}/001.jpg ... /watches/{model}/{imageCount}.jpg
// Interacción: drag horizontal para rotar (o scroll si está en sección scrub)
// Pre-carga: todas las imágenes al montar, muestra spinner mientras carga
// Canvas: dibuja la imagen actual con object-cover
// Índice actual: Math.floor(dragProgress * imageCount)
// Momentum: al soltar el drag, sigue rotando con deceleración
// Autoplay sutil si no hay interacción (1 revolución cada 20s)
```

---

## 8. FOTOS — CONVENCIÓN DE NOMBRES

Las 200 fotos del cliente están en `public/watches/`. Deben organizarse así:

```
public/watches/
├── obsidian-diver/
│   ├── 001.jpg    # Frontal
│   ├── 002.jpg    # 6° rotación
│   ├── 003.jpg    # 12° rotación
│   ├── ...        # Cada foto es ~6° más de rotación
│   └── 060.jpg    # Casi 360° completo
├── midnight-blue/
│   ├── 001.jpg
│   └── ...
└── ... (un directorio por modelo)
```

**Si las fotos NO están organizadas así todavía**, crear un script en `scripts/organize-photos.mjs` que:
1. Lee la carpeta `public/watches/` plana
2. Agrupa por nombre (el usuario indicará qué fotos son de qué modelo)
3. Renombra a secuencia numérica 001, 002, etc.

---

## 9. SCROLL FLOW COMPLETO

El viaje del usuario de arriba a abajo:

```
[NAVBAR] — siempre visible, liquid-glass, se compacta al scroll

[HERO · 300vh]
  → 0-30%: Reloj 3D frente + headline "Obsidian Diver"
  → 30-60%: Reloj rota 180° + texto fade out  
  → 60-90%: Reloj completa 360° + precio aparece
  → 90-100%: Reloj se miniaturiza → transición suave

[MARQUEE] — franja oscura con texto loop

[CATÁLOGO] — cambio de orientación: el scroll ahora es normal
  → Cards con tilt 3D al hover
  → Filtros sticky en móvil

[PRODUCTO DESTACADO · 200vh]
  → Scroll-scrub: el reloj rota con fotos reales 360°
  → Specs aparecen con fade-up escalonado
  → El reloj flota en el centro con parallax

[MODS] — orientación normal
  → Grid de servicios
  → Configurador interactivo con preview

[LOOKBOOK] — scroll horizontal
  → Las fotos se mueven a diferentes velocidades (parallax)
  → Efecto de profundidad con scale y blur

[STATS] — pantalla completa con vídeo fondo

[TESTIMONIOS] — marquee doble dirección

[FAQ] — dos columnas, accordion

[CONTACTO] — formulario

[CTA FINAL] — pantalla completa, vídeo fondo, heading enorme

[FOOTER] — liquid-glass sobre ink
```

---

## 10. ANTI-SLOP — REGLAS INVIOLABLES

Cada violación de estas reglas es un defecto. Auto-verifica antes de commitear.

1. **NO emoji en ningún lugar del UI.** Ni en cards, ni en botones, ni en badges. Los iconos vienen de lucide-react o son SVG custom.
2. **NO gradientes violeta/púrpura.** La paleta es ink + cream + gold. Punto.
3. **NO shadow-xl ni shadow-2xl en cards.** Profundidad = backdrop-blur + inset highlights (liquid-glass).
4. **NO rounded-3xl en botones.** Botones: rounded-full. Cards: rounded-2xl. Nunca valores intermedios.
5. **NO lorem ipsum ni texto placeholder.** Si falta contenido, marca [TODO: nombre] visible.
6. **NO text-center en párrafos** excepto en hero y CTA final. Párrafos siempre left-aligned.
7. **Headings:** SIEMPRE font-display uppercase tracking-tight O font-display italic. NUNCA sentence-case serif en fondo oscuro.
8. **Cada sección tiene badge + heading + sub** excepto hero y footer.
9. **NO iconos de otros paquetes** que no sean lucide-react.
10. **NO `<video>` en el hero.** El hero es Three.js canvas O secuencia de fotos en canvas.
11. **Animaciones máximo 0.9s.** Nada de duration: 2s. Los sites lentos se sienten mal.
12. **NO console.log, NO código comentado, NO imports sin usar.**
13. **Todo el copy en español (es-ES).** No mezclar idiomas.
14. **Responsive:** 1440px es el canvas principal, pero todo funciona en 375px sin scroll horizontal.
15. **Accesibilidad:** focus-visible ring en todo elemento interactivo. Canvas tiene aria-hidden + sr-only description.
16. **Performance:** LCP < 2.5s. Primera foto del hero precargada con `<link rel="preload">`.

---

## 11. STRIPE — INTEGRACIÓN

```ts
// lib/stripe.ts
// La Publishable Key se configura aquí. NO hardcodear en componentes.
export const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || "pk_test_PLACEHOLDER";

// Para producción: el backend crea el PaymentIntent y devuelve client_secret.
// Para demo: usar createPaymentMethod para validar la tarjeta y mostrar confirmación.
```

**Flujo checkout:**
1. Usuario pulsa "Pagar con Stripe" en el carrito
2. Se abre CheckoutModal (shadcn Dialog)
3. Formulario de envío + Stripe Elements card input
4. Al submit: crear PaymentMethod → enviar al backend → confirmar PaymentIntent
5. Éxito: toast "✓ Pedido recibido" + vaciar carrito + cerrar modal
6. Error: mostrar mensaje bajo el card input

---

## 12. VERIFICACIÓN FINAL

Antes de declarar la web terminada, verificar:

### Build
- [ ] `npm run dev` arranca sin errores
- [ ] `npm run build` compila sin errores TypeScript ni Vite

### Visual
- [ ] Hero: reloj 3D visible en el primer frame, rota con scroll
- [ ] Catálogo: fotos reales cargadas, filtros funcionan, tilt 3D al hover
- [ ] Carrito: añadir, quitar, cambiar cantidad, total correcto
- [ ] Configurador: swatches cambian preview, precio se actualiza
- [ ] Marquee: loop seamless, pausa on hover
- [ ] FAQ: accordion abre/cierra suavemente
- [ ] Checkout: modal se abre, Stripe Elements renderiza
- [ ] Mobile 375px: sin overflow horizontal, todo legible, menú funciona

### Consola
- [ ] 0 warnings de React
- [ ] 0 errores 404 en fotos
- [ ] 0 errores de WebGL

### Performance
- [ ] Lighthouse Performance ≥ 85 desktop
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

---

*Última actualización: Abril 2025*
*Proyecto: MODWATCH — Seiko Mod Store*
*Propietario: poltr*
