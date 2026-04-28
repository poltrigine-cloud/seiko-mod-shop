import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import PageLayout from '../../components/PageLayout'

const CATEGORIES = ['date', 'gmt', 'icon', 'field', 'dress', 'otros']

const emptyForm = {
  name: '', description: '', price: '', category: 'date',
  stock: 0, featured: false, specs: [{ key: '', value: '' }],
}

export default function AdminProductForm() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const isEdit          = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages]         = useState([]) // URLs existentes
  const [newFiles, setNewFiles]     = useState([]) // Archivos nuevos a subir
  const [previews, setPreviews]     = useState([]) // Previews locales
  const [loading,  setLoading]      = useState(isEdit)
  const [saving,   setSaving]       = useState(false)
  const [error,    setError]        = useState('')

  // Cargar datos si es edición
  useEffect(() => {
    if (!isEdit) return
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) { navigate('/admin/productos'); return }
      setForm({
        name:        data.name,
        description: data.description || '',
        price:       data.price,
        category:    data.category,
        stock:       data.stock,
        featured:    data.featured,
        specs:       Object.entries(data.specs || {}).map(([key, value]) => ({ key, value })),
      })
      setImages(data.images || [])
      setLoading(false)
    })
  }, [id, isEdit, navigate])

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  // Specs dinámicos
  const addSpec    = () => setForm(f => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }))
  const removeSpec = i  => setForm(f => ({ ...f, specs: f.specs.filter((_, j) => j !== i) }))
  const setSpec    = (i, field, val) =>
    setForm(f => ({ ...f, specs: f.specs.map((s, j) => j === i ? { ...s, [field]: val } : s) }))

  // Seleccionar imágenes nuevas
  const handleFileChange = e => {
    const files = Array.from(e.target.files)
    setNewFiles(prev => [...prev, ...files])
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls])
  }

  const removeExistingImage = url => setImages(prev => prev.filter(u => u !== url))
  const removeNewFile       = i   => {
    URL.revokeObjectURL(previews[i])
    setNewFiles(prev => prev.filter((_, j) => j !== i))
    setPreviews(prev => prev.filter((_, j) => j !== i))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Subir imágenes nuevas a Supabase Storage
    const uploadedUrls = []
    for (const file of newFiles) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const { data, error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })
      if (upErr) { setError(`Error subiendo imagen: ${upErr.message}`); setSaving(false); return }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
      uploadedUrls.push(publicUrl)
    }

    const specsObj = form.specs.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value.trim()
      return acc
    }, {})

    const payload = {
      name:        form.name,
      description: form.description,
      price:       parseFloat(form.price),
      category:    form.category,
      stock:       parseInt(form.stock, 10),
      featured:    form.featured,
      specs:       specsObj,
      images:      [...images, ...uploadedUrls],
    }

    const { error: dbErr } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload)

    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    navigate('/admin/productos')
  }

  const inp = {
    className: 'cf-input',
    style: { width: '100%' },
  }

  if (loading) return (
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="page-spinner" />
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <Helmet>
        <title>{isEdit ? 'Editar producto' : 'Nuevo producto'} — Admin MODWATCH</title>
      </Helmet>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem var(--gutter)' }}>
        <button
          onClick={() => navigate('/admin/productos')}
          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'none', fontSize: '0.8rem', marginBottom: '2rem', padding: 0 }}
        >
          ← Volver a productos
        </button>

        <div className="section-badge" style={{ marginBottom: '1rem' }}>
          {isEdit ? 'Editar' : 'Nuevo'}
        </div>
        <h1 className="sec-title" style={{ marginBottom: '2.5rem' }}>
          {isEdit ? form.name || 'Producto' : 'Nuevo producto'}
        </h1>

        {error && (
          <div style={{
            background: 'rgba(220,53,69,0.12)', border: '1px solid rgba(220,53,69,0.3)',
            borderRadius: '8px', padding: '0.75rem 1rem',
            color: '#ff6b7a', fontSize: '0.82rem', marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Nombre */}
          <div className="cf-group">
            <label>Nombre del producto *</label>
            <input {...inp} type="text" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej. Seiko Coca-Cola GMT" />
          </div>

          {/* Descripción */}
          <div className="cf-group">
            <label>Descripción</label>
            <textarea {...inp} rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del reloj..." />
          </div>

          {/* Precio y stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="cf-group">
              <label>Precio (€) *</label>
              <input {...inp} type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="149" />
            </div>
            <div className="cf-group">
              <label>Stock</label>
              <input {...inp} type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
          </div>

          {/* Categoría */}
          <div className="cf-group">
            <label>Categoría</label>
            <select {...inp} value={form.category} onChange={e => set('category', e.target.value)} className="cf-input cf-select">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Destacado */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'none', fontSize: '0.82rem', color: 'rgba(248,244,234,0.75)' }}>
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ accentColor: 'var(--gold)', width: '16px', height: '16px' }} />
            Producto destacado (aparece en la landing)
          </label>

          {/* Specs */}
          <div>
            <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.45)', display: 'block', marginBottom: '0.75rem' }}>
              Especificaciones
            </label>
            {form.specs.map((spec, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  className="cf-input"
                  type="text"
                  placeholder="Movimiento"
                  value={spec.key}
                  onChange={e => setSpec(i, 'key', e.target.value)}
                />
                <input
                  className="cf-input"
                  type="text"
                  placeholder="NH35A"
                  value={spec.value}
                  onChange={e => setSpec(i, 'value', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSpec(i)}
                  style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'none', fontSize: '1.2rem', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addSpec} className="btn btn-glass" style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
              + Añadir spec
            </button>
          </div>

          {/* Imágenes existentes */}
          {images.length > 0 && (
            <div>
              <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.45)', display: 'block', marginBottom: '0.75rem' }}>
                Imágenes actuales
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {images.map(url => (
                  <div key={url} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ff6b7a', border: 'none', cursor: 'none', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload imágenes nuevas */}
          <div>
            <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(248,244,234,0.45)', display: 'block', marginBottom: '0.75rem' }}>
              {isEdit ? 'Añadir imágenes' : 'Imágenes'}
            </label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '2rem', borderRadius: '12px', border: '1px dashed rgba(196,150,74,0.3)',
              cursor: 'none', color: 'rgba(248,244,234,0.45)', fontSize: '0.82rem',
              transition: 'border-color 0.2s',
            }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</span>
              Seleccionar imágenes (JPG, PNG, WebP)
              <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ff6b7a', border: 'none', cursor: 'none', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
            <button type="submit" className="btn btn-gold" disabled={saving} style={{ justifyContent: 'center' }}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button type="button" className="btn btn-glass" onClick={() => navigate('/admin/productos')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}
