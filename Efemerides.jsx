import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TIPOS = ['Foto', 'Video', 'Caption', 'Información', 'Mixto']

export default function Pendientes() {
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [pendientes, setPendientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'Foto' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, color').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  useEffect(() => {
    if (clienteId) cargar()
  }, [clienteId])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from('pendientes')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
    setPendientes(data || [])
    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    await supabase.from('pendientes').insert([{
      ...form,
      cliente_id: clienteId,
      estado: 'pendiente',
    }])
    setModal(false)
    setForm({ titulo: '', descripcion: '', tipo: 'Foto' })
    await cargar()
    setSaving(false)
  }

  async function marcarVisto(id) {
    await supabase.from('pendientes').update({ visto_admin: true }).eq('id', id)
    await cargar()
  }

  const clienteActual = clientes.find(c => c.id === clienteId)

  const badge = (estado) => ({
    pendiente: 'bg-yellow-100 text-yellow-700',
    enviado: 'bg-blue-100 text-blue-700',
    visto: 'bg-green-100 text-green-700',
  }[estado] || 'bg-gray-100 text-gray-600')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display">Pendientes</h2>
          <p className="text-brand-muted text-sm mt-1">Tareas para tus clientes</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto text-sm" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {clienteId && (
            <button onClick={() => setModal(true)} className="btn-primary">+ Nueva tarea</button>
          )}
        </div>
      </div>

      {!clienteId ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>Seleccioná un cliente para ver sus pendientes.</p>
        </div>
      ) : loading ? (
        <p className="text-brand-muted text-sm">Cargando...</p>
      ) : pendientes.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>No hay tareas pendientes para {clienteActual?.nombre}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: clienteActual?.color }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{p.titulo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge(p.estado)}`}>{p.estado}</span>
                    <span className="text-xs text-brand-muted px-2 py-0.5 rounded-full bg-brand-sand">{p.tipo}</span>
                  </div>
                  {p.descripcion && <p className="text-xs text-brand-muted mb-2">{p.descripcion}</p>}

                  {/* Respuesta del cliente */}
                  {p.estado === 'enviado' && (
                    <div className="bg-blue-50 rounded p-3 mt-2">
                      <p className="text-xs font-medium text-blue-700 mb-1">Respuesta del cliente:</p>
                      {p.respuesta_texto && <p className="text-sm">{p.respuesta_texto}</p>}
                      {p.respuesta_url && (
                        <a href={p.respuesta_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-rose hover:underline">
                          Ver archivo adjunto →
                        </a>
                      )}
                      {!p.visto_admin && (
                        <button onClick={() => marcarVisto(p.id)} className="mt-2 text-xs btn-primary px-3 py-1">
                          Marcar como visto
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva tarea */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="font-display text-lg">Nueva tarea para {clienteActual?.nombre}</h3>

            <div>
              <label className="label">Título</label>
              <input className="input" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ej: Mandame la foto del local" />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea className="input" rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Aclaraciones, referencias, formato..." />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={guardar} className="btn-primary flex-1" disabled={saving || !form.titulo}>
                {saving ? 'Guardando...' : 'Crear tarea'}
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
