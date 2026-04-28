import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Nav compartido para todas las páginas que no son la landing (/).
// Los links de sección (#mods, #contacto) navegan a /#anchor — el navegador
// hace el scroll nativo al llegar a la landing.

export default function PageNav() {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const isAdmin_ = location.pathname.startsWith('/admin')

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/login')
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Usuario'

  return (
    <>
      <nav className="nav liquid-glass-strong">
        <a
          href="/"
          className="nav-logo"
          onClick={e => { e.preventDefault(); navigate('/') }}
        >
          MODWATCH<sup>®</sup>
        </a>

        <ul className="nav-links">
          <li>
            <button className="nav-link-btn" onClick={() => navigate('/tienda')}>
              Catálogo
            </button>
          </li>
          <li><a href="/#mods">Mods</a></li>
          <li><a href="/#lookbook">Lookbook</a></li>
          <li><a href="/#reviews">Reseñas</a></li>
          <li>
            <button className="nav-link-btn" onClick={() => navigate('/contacto')}>
              Contacto
            </button>
          </li>
          {isAdmin && (
            <li>
              <button
                className="nav-link-btn"
                style={{ color: 'var(--gold)' }}
                onClick={() => navigate('/admin')}
              >
                Admin
              </button>
            </li>
          )}
        </ul>

        <div className="nav-right">
          {user ? (
            <div className="nav-user" style={{ position: 'relative' }}>
              <button className="nav-cta" onClick={() => setUserMenuOpen(o => !o)}>
                {displayName}
              </button>
              {userMenuOpen && (
                <div className="nav-dropdown liquid-glass-strong">
                  {isAdmin && (
                    <button onClick={() => { navigate('/admin'); setUserMenuOpen(false) }}>
                      Panel Admin
                    </button>
                  )}
                  <button onClick={() => { navigate('/cuenta'); setUserMenuOpen(false) }}>
                    Mi cuenta
                  </button>
                  <button onClick={handleSignOut}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-cta" onClick={() => navigate('/login')}>
              Entrar
            </button>
          )}

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Menú"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>
          <X size={24} />
        </button>
        <button className="mobile-nav-btn" onClick={() => { navigate('/tienda'); setMenuOpen(false) }}>
          Catálogo
        </button>
        <a href="/#mods"     onClick={() => setMenuOpen(false)}>Mods</a>
        <a href="/#lookbook" onClick={() => setMenuOpen(false)}>Lookbook</a>
        <a href="/#reviews"  onClick={() => setMenuOpen(false)}>Reseñas</a>
        <button className="mobile-nav-btn" onClick={() => { navigate('/contacto'); setMenuOpen(false) }}>
          Contacto
        </button>
        {user ? (
          <>
            {isAdmin && (
              <button className="mobile-nav-btn" onClick={() => { navigate('/admin'); setMenuOpen(false) }}>
                Panel Admin
              </button>
            )}
            <button className="mobile-nav-btn" onClick={() => { navigate('/cuenta'); setMenuOpen(false) }}>
              Mi cuenta
            </button>
            <button className="mobile-nav-btn" onClick={() => { handleSignOut(); setMenuOpen(false) }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <button className="mobile-nav-btn" onClick={() => { navigate('/login'); setMenuOpen(false) }}>
            Entrar
          </button>
        )}
      </div>
    </>
  )
}
