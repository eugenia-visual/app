import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Recibos() {
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(false)
  const [recibos, setRecibos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    cliente_id: '',
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    items: [''],
    total: '',
    medio_pago: 'Transferencia bancaria',
    alias: 'eugenia.visual',
    titular: 'Eugenia',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => setClientes(data || []))
    cargar()
  }, [])

  async function cargar() {
    const { data } = await supabase.from('recibos').select('*, clientes(nombre)').order('fecha', { ascending: false })
    setRecibos(data || [])
    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    await supabase.from('recibos').insert([form])
    setModal(false)
    await cargar()
    setSaving(false)
  }

  const agregarItem = () => setForm({ ...form, items: [...form.items, ''] })
  const editarItem = (i, v) => {
    const items = [...form.items]
    items[i] = v
    setForm({ ...form, items })
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display">Recibos</h2>
        <button onClick={() => setModal(true)} className="btn-primary">+ Nuevo recibo</button>
      </div>

      {loading ? (
        <p className="text-brand-muted text-sm">Cargando...</p>
      ) : recibos.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>Todavía no hay recibos generados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recibos.map(r => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{r.clientes?.nombre}</p>
                <p className="text-xs text-brand-muted">{r.fecha} · {r.concepto}</p>
              </div>
              <p className="font-display text-lg">${Number(r.total).toLocaleString('es-AR')}</p>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-auto">
            <h3 className="font-display text-lg">Nuevo recibo</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cliente</label>
                <select className="input" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                  <option value="">Seleccionar</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fecha</label>
                <input type="date" className="input" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="label">Concepto</label>
              <input className="input" value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} placeholder="Ej: Gestión de redes — Junio 2026" />
            </div>

            <div>
              <label className="label">Alcance del servicio</label>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <input key={i} className="input" value={item} onChange={e => editarItem(i, e.target.value)} placeholder={`Ítem ${i + 1}`} />
                ))}
                <button onClick={agregarItem} className="text-xs text-brand-rose hover:underline">+ Agregar ítem</button>
              </div>
            </div>

            <div>
              <label className="label">Total</label>
              <input className="input" type="number" value={form.total} onChange={e => setForm({...form, total: e.target.value})} placeholder="Ej: 35000" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Medio de pago</label>
                <input className="input" value={form.medio_pago} onChange={e => setForm({...form, medio_pago: e.target.value})} />
              </div>
              <div>
                <label className="label">Alias</label>
                <input className="input" value={form.alias} onChange={e => setForm({...form, alias: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={guardar} className="btn-primary flex-1" disabled={saving || !form.cliente_id || !form.total}>
                {saving ? 'Guardando...' : 'Guardar recibo'}
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
