import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLORES = ['#C8A99A', '#A0B4C8', '#A8C8A0', '#C8C4A0', '#B4A0C8', '#C8A0A8', '#A0C8C4']

const CLIENTES_INICIALES = [
  { nombre: 'Ana María González Inmobiliaria', instagram: '@anamariagonzalezinmobiliaria', color: '#C8A99A' },
  { nombre: 'Dick Fish Pescadería', instagram: '@dickfishpescaderia', color: '#A0B4C8' },
  { nombre: 'Squalo Natación', instagram: '@squalonatacion', color: '#A8C8A0' },
  { nombre: 'Ceibo Espacio Integral', instagram: '@ceiboespacio', color: '#C8C4A0' },
  { nombre: 'Curva.Estudio', instagram: '@curva.estudio', color: '#B4A0C8' },
  { nombre: 'MAC Indumentaria', instagram: '@mac_indumentaria', color: '#C8A0A8' },
  { nombre: 'Bar On Fire', instagram: '@baronfire', color: '#A0C8C4' },
]

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', instagram: '', whatsapp: '', contacto: '', color: COLORES[0], notas: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase.from('clientes').select('*').order('nombre')
    setClientes(data || [])
    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    await supabase.from('clientes').insert([form])
    setModal(false)
    setForm({ nombre: '', instagram: '', whatsapp: '', contacto: '', color: COLORES[0], notas: '' })
    await cargar()
    setSaving(false)
  }

  async function seedClientes() {
    await supabase.from('clientes').insert(CLIENTES_INICIALES)
    await cargar()
  }

  if (loading) return <div className="text-brand-muted text-sm">Cargando...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display">Clientes</h2>
          <p className="text-brand-muted text-sm mt-1">{clientes.length} clientes activos</p>
        </div>
        <div className="flex gap-2">
          {clientes.length === 0 && (
            <button onClick={seedClientes} className="btn-secondary text-xs">
              Cargar mis clientes actuales
            </button>
          )}
          <button onClick={() => setModal(true)} className="btn-primary">
            + Nuevo cliente
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {clientes.map(c => (
          <div key={c.id} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
            <div className="flex-1">
              <p className="font-medium text-sm">{c.nombre}</p>
              <p className="text-xs text-brand-muted">{c.instagram} {c.whatsapp && `· ${c.whatsapp}`}</p>
              {c.notas && <p className="text-xs text-brand-muted mt-1 italic">{c.notas}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal nuevo cliente */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="font-display text-lg">Nuevo cliente</h3>

            <div>
              <label className="label">Nombre</label>
              <input className="input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            </div>
            <div>
              <label className="label">Instagram</label>
              <input className="input" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@usuario" />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="2284..." />
            </div>
            <div>
              <label className="label">Contacto</label>
              <input className="input" value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})} placeholder="Nombre de la persona" />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2">
                {COLORES.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm({...form, color: c})}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: form.color === c ? '#0D0D0D' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="label">Notas internas</label>
              <textarea className="input" rows={2} value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={guardar} className="btn-primary flex-1" disabled={saving || !form.nombre}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
