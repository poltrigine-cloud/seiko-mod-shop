import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Phone, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'

export default function Contact() {
  const [params]  = useSearchParams()
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [errors,  setErrors]  = useState({})
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const initialized = useRef(false)

  // Pre-rellenar mensaje si viene de una ficha de producto
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const producto = params.get('producto')
    if (producto) {
      setMessage(`Hola, me interesa el reloj ${decodeURIComponent(producto)}.\n\n`)
    }
  }, [params])

  const validate = () => {
    const e = {}
    if (!name.trim())                     e.name    = 'El nombre es obligatorio.'
    if (!email.trim())                    e.email   = 'El email es obligatorio.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email   = 'Email no válido.'
    if (!message.trim())                  e.message = 'El mensaje no puede estar vacío.'
    return e
  }

  const handle = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSending(true)

    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    })

    setSending(false)
    if (error) { setErrors({ form: 'Error al enviar. Inténtalo de nuevo.' }); return }
    setSent(true)
  }

  if (sent) {
    return (
      <PageLayout>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '6rem var(--gutter)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>✓</div>
          <h2 className="sec-title" style={{ marginBottom: '1rem' }}>Mensaje enviado</h2>
          <p className="sec-sub">Te respondemos en menos de 24h. ¡Gracias por contactar con MODWATCH!</p>
        </div>
      </PageLayout>
    )
  }

  const field = (label, children, err) => (
    <div className="cf-group">
      <label>{label}</label>
      {children}
      {err && <span style={{ fontSize: '0.72rem', color: '#ff6b7a', marginTop: '0.3rem', display: 'block' }}>{err}</span>}
    </div>
  )

  return (
    <PageLayout>
      <Helmet>
        <title>Contacto — MODWATCH</title>
        <meta name="description" content="Contacta con MODWATCH para consultas, encargos y mods personalizados." />
      </Helmet>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem var(--gutter) 6rem' }}>
        <div className="section-badge" style={{ marginBottom: '1rem' }}>¿Tienes dudas?</div>
        <h1 className="sec-title" style={{ marginBottom: '3rem' }}>
          Hablemos de<br /><em>tu próximo reloj</em>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', alignItems: 'start' }}>
          {/* Info */}
          <div>
            <p className="sec-sub" style={{ marginBottom: '2.5rem' }}>
              Cada encargo es una conversación. Cuéntanos qué tienes en mente y te respondemos en menos de 24h.
            </p>
            {[
              { icon: <MapPin size={16} />, label: 'Taller', value: 'Sant Cugat del Vallès, Barcelona' },
              { icon: <Phone size={16} />,  label: 'WhatsApp', value: 'Respuesta en < 24h' },
              { icon: <Mail size={16} />,   label: 'Email', value: 'hola@modwatch.es' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="contact-detail" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div className="contact-icon" style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(196,150,74,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  color: 'var(--gold)',
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.4)', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--cream)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario */}
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
            {errors.form && (
              <div style={{ background: 'rgba(220,53,69,0.12)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#ff6b7a', fontSize: '0.82rem' }}>
                {errors.form}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {field('Nombre *',
                <input className="cf-input" type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />,
                errors.name
              )}
              {field('Email *',
                <input className="cf-input" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />,
                errors.email
              )}
            </div>

            {field('Mensaje *',
              <textarea
                className="cf-input"
                rows={6}
                placeholder="Cuéntanos qué buscas..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ resize: 'vertical' }}
              />,
              errors.message
            )}

            <button
              type="submit"
              className="btn btn-gold"
              disabled={sending}
              style={{ justifyContent: 'center' }}
            >
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
