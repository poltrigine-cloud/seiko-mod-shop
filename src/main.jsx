import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Contact from './pages/Contact.jsx'
import Account from './pages/Account.jsx'
import './index.css'

// Lazy load del panel admin (los usuarios normales nunca lo cargan)
const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard.jsx'))
const AdminProductList = lazy(() => import('./pages/admin/ProductList.jsx'))
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm.jsx'))
const AdminMessages    = lazy(() => import('./pages/admin/Messages.jsx'))

const AdminFallback = (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: 'var(--ink)',
  }}>
    <div className="page-spinner" />
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Landing — NO TOCAR */}
            <Route path="/" element={<App />} />

            {/* Auth */}
            <Route path="/login"    element={<Login />} />
            <Route path="/registro" element={<Register />} />

            {/* Tienda */}
            <Route path="/tienda"        element={<Shop />} />
            <Route path="/producto/:id"  element={<ProductDetail />} />
            <Route path="/contacto"      element={<Contact />} />

            {/* Cuenta de usuario */}
            <Route
              path="/cuenta"
              element={<ProtectedRoute><Account /></ProtectedRoute>}
            />

            {/* Panel admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Suspense fallback={AdminFallback}><AdminDashboard /></Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute adminOnly>
                  <Suspense fallback={AdminFallback}><AdminProductList /></Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos/nuevo"
              element={
                <ProtectedRoute adminOnly>
                  <Suspense fallback={AdminFallback}><AdminProductForm /></Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos/:id"
              element={
                <ProtectedRoute adminOnly>
                  <Suspense fallback={AdminFallback}><AdminProductForm /></Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mensajes"
              element={
                <ProtectedRoute adminOnly>
                  <Suspense fallback={AdminFallback}><AdminMessages /></Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
