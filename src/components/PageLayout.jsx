import PageNav from './PageNav'

// Wrapper para páginas internas (no la landing).
// Añade el nav compartido y el footer mínimo.
export default function PageLayout({ children, noPadding = false }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--cream)' }}>
      <PageNav />
      <main style={noPadding ? {} : { paddingTop: '96px' }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem var(--gutter)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.72rem',
        color: 'rgba(248,244,234,0.35)',
        letterSpacing: '0.06em',
      }}>
        <span>© 2025 MODWATCH. Todos los derechos reservados.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Términos</a>
        </div>
      </footer>
    </div>
  )
}
