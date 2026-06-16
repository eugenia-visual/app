import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const ESTADOS = ['todos', 'borrador', 'pendiente', 'aprobado', 'cambios']

export default function Piezas() {
  const { isAdmin } = useAuth()
  const [piezas, setPiezas] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [estado, setEstado] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [pieza, setPieza] = useState(null) // detalle abierto
  const [comentario, setComentario] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, color').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  useEffect(() => { cargar() }, [clienteId, estado])

  async function cargar() {
    setLoading(true)
    let q = supabase.from('piezas').select('*, clientes(nombre, color)').order('fecha', { ascending: false })
    if (clienteId) q = q.eq('cliente_id', clienteId)
    if (estado !== 'todos') q = q.eq('estado', estado)
    const { data } = await q
    setPiezas(data || [])
    setLoading(false)
  }

  async function cambiarEstado(id, nuevoEstado) {
    setSaving(true)
    await supabase.from('piezas').update({ estado: nuevoEstado }).eq('id', id)
    if (pieza?.id === id) setPieza({ ...pieza, estado: nuevoEstado })
    await cargar()
    setSaving(false)
  }

  async function enviarComentario(id) {
    if (!comentario.trim()) return
    setSaving(true)
    const { data: p } = await supabase.from('piezas').select('comentarios').eq('id', id).single()
    const anteriores = p?.comentarios || []
    await supabase.from('piezas').update({
      comentarios: [...anteriores, { texto: comentario, fecha: new Date().toISOString(), admin: isAdmin }]
    }).eq('id', id)
    setComentario('')
    await cargar()
    if (pieza?.id === id) {
      const { data } = await supabase.from('piezas').select('*, clientes(nombre, color)').eq('id', id).single()
      setPieza(data)
    }
    setSaving(false)
  }

  const estadoColor = (e) => ({
    borrador: 'bg-gray-100 text-gray-600',
    pendiente: 'bg-yellow-100 text-yellow-700',
    aprobado: 'bg-green-100 text-green-700',
    cambios: 'bg-red-100 text-red-600',
  }[e] || 'bg-gray-100 text-gray-600')

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Piezas</h2>
        <div className="flex gap-2">
          <select className="input w-auto text-sm" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">Todos los clientes</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select className="input w-auto text-sm" value={estado} onChange={e => setEstado(e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{e === 'todos' ? 'Todos los estados' : e}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-brand-muted text-sm">Cargando...</p>
      ) : piezas.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>No hay piezas con estos filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {piezas.map(p => (
            <div
              key={p.id}
              className="card flex items-center gap-4 cursor-pointer hover:border-brand-rose transition-colors"
              onClick={() => setPieza(p)}
            >
              <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: p.clientes?.color || '#ccc' }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.titulo}</p>
                <p className="text-xs text-brand-muted">{p.clientes?.nombre} · {p.fecha} · {p.tipo} · {p.red}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${estadoColor(p.estado)}`}>{p.estado}</span>
              {p.comentarios?.length > 0 && (
                <span className="text-xs text-brand-muted flex-shrink-0">💬 {p.comentarios.length}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detalle pieza */}
      {pieza && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={() => setPieza(null)}>
          <div className="bg-white w-96 h-full p-6 overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">{pieza.titulo}</h3>
              <button onClick={() => setPieza(null)} className="text-brand-muted">✕</button>
            </div>

            <div className="space-y-1 mb-4 text-sm text-brand-muted">
              <p>{pieza.clientes?.nombre}</p>
              <p>{pieza.fecha} · {pieza.tipo} · {pieza.red}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${estadoColor(pieza.estado)}`}>{pieza.estado}</span>
            </div>

            {pieza.descripcion && (
              <div className="bg-brand-cream rounded p-3 text-sm mb-4 whitespace-pre-wrap">{pieza.descripcion}</div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button onClick={() => cambiarEstado(pieza.id, 'aprobado')} className="btn-primary text-xs px-3 py-1.5" disabled={saving}>✓ Aprobar</button>
              <button onClick={() => cambiarEstado(pieza.id, 'cambios')} className="btn-secondary text-xs px-3 py-1.5" disabled={saving}>↩ Pedir cambios</button>
              {isAdmin && <button onClick={() => cambiarEstado(pieza.id, 'pendiente')} className="btn-secondary text-xs px-3 py-1.5" disabled={saving}>Marcar pendiente</button>}
            </div>

            {/* Comentarios */}
            <div className="mb-4">
              <p className="label mb-2">Comentarios</p>
              <div className="space-y-2 mb-3 max-h-48 overflow-auto">
                {(pieza.comentarios || []).length === 0 && <p className="text-xs text-brand-muted">Sin comentarios todavía.</p>}
                {(pieza.comentarios || []).map((c, i) => (
                  <div key={i} className={`text-xs p-2 rounded ${c.admin ? 'bg-brand-sand' : 'bg-blue-50'}`}>
                    <p className="font-medium mb-0.5">{c.admin ? 'Eugenia' : 'Cliente'}</p>
                    <p>{c.texto}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input text-xs"
                  placeholder="Escribir comentario..."
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && enviarComentario(pieza.id)}
                />
                <button onClick={() => enviarComentario(pieza.id)} className="btn-primary text-xs px-3" disabled={saving}>→</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
