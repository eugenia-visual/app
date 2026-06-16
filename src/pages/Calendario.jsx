import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPOS = ['Reel', 'Carrusel', 'Historia', 'Placa', 'Otro']
const REDES = ['Instagram', 'Facebook', 'Ambas']

export default function Calendario() {
  const [searchParams] = useSearchParams()
  const clienteIdParam = searchParams.get('cliente')

  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState(clienteIdParam || '')
  const [mes, setMes] = useState(new Date())
  const [piezas, setPiezas] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null) // fecha seleccionada
  const [diaDetalle, setDiaDetalle] = useState(null)
  const [form, setForm] = useState({ titulo: '', tipo: 'Reel', red: 'Instagram', descripcion: '', estado: 'borrador' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, color').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  useEffect(() => {
    if (!clienteId) return
    cargarPiezas()
  }, [clienteId, mes])

  async function cargarPiezas() {
    setLoading(true)
    const inicio = format(startOfMonth(mes), 'yyyy-MM-dd')
    const fin = format(endOfMonth(mes), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('piezas')
      .select('*')
      .eq('cliente_id', clienteId)
      .gte('fecha', inicio)
      .lte('fecha', fin)
    setPiezas(data || [])
    setLoading(false)
  }

  const dias = eachDayOfInterval({ start: startOfMonth(mes), end: endOfMonth(mes) })
  const primerDia = getDay(startOfMonth(mes)) // 0=dom
  const offset = primerDia === 0 ? 6 : primerDia - 1 // lunes primero

  const piezasDia = (fecha) => piezas.filter(p => p.fecha === format(fecha, 'yyyy-MM-dd'))

  async function guardarPieza() {
    if (!modal || !clienteId) return
    setSaving(true)
    await supabase.from('piezas').insert([{
      ...form,
      cliente_id: clienteId,
      fecha: format(modal, 'yyyy-MM-dd'),
    }])
    setModal(null)
    setForm({ titulo: '', tipo: 'Reel', red: 'Instagram', descripcion: '', estado: 'borrador' })
    await cargarPiezas()
    setSaving(false)
  }

  const clienteActual = clientes.find(c => c.id === clienteId)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Calendario</h2>
        <div className="flex gap-3 items-center">
          <select
            className="input w-auto text-sm"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <button onClick={() => setMes(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="btn-secondary px-3">‹</button>
          <span className="text-sm font-medium capitalize min-w-[120px] text-center">
            {format(mes, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setMes(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="btn-secondary px-3">›</button>
        </div>
      </div>

      {!clienteId ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>Seleccioná un cliente para ver su calendario.</p>
        </div>
      ) : (
        <>
          {clienteActual && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: clienteActual.color }} />
              <span className="text-sm text-brand-muted">{clienteActual.nombre}</span>
            </div>
          )}

          {/* Grilla */}
          <div className="border border-brand-sand rounded-lg overflow-hidden">
            {/* Cabecera días */}
            <div className="grid grid-cols-7 bg-brand-sand">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="text-xs font-medium text-brand-muted text-center py-2">{d}</div>
              ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7">
              {Array(offset).fill(null).map((_, i) => (
                <div key={`e-${i}`} className="h-20 border-b border-r border-brand-sand/50 bg-brand-cream/30" />
              ))}
              {dias.map(dia => {
                const pp = piezasDia(dia)
                return (
                  <div
                    key={dia.toISOString()}
                    className="h-20 border-b border-r border-brand-sand/50 p-1 cursor-pointer hover:bg-brand-sand/30 transition-colors relative"
                    onClick={() => { setDiaDetalle(dia); setModal(null) }}
                  >
                    <span className="text-xs text-brand-muted">{format(dia, 'd')}</span>
                    <div className="mt-1 space-y-0.5">
                      {pp.slice(0, 2).map(p => (
                        <div
                          key={p.id}
                          className="text-xs px-1 rounded truncate"
                          style={{ backgroundColor: clienteActual?.color + '40', color: '#0D0D0D' }}
                        >
                          {p.tipo} · {p.titulo}
                        </div>
                      ))}
                      {pp.length > 2 && <div className="text-xs text-brand-muted">+{pp.length - 2} más</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Panel lateral día */}
      {diaDetalle && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={() => setDiaDetalle(null)}>
          <div className="bg-white w-80 h-full p-6 overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg capitalize">
                {format(diaDetalle, "d 'de' MMMM", { locale: es })}
              </h3>
              <button onClick={() => setDiaDetalle(null)} className="text-brand-muted hover:text-brand-black">✕</button>
            </div>

            <div className="space-y-3 mb-6">
              {piezasDia(diaDetalle).length === 0 ? (
                <p className="text-sm text-brand-muted">Sin piezas este día.</p>
              ) : piezasDia(diaDetalle).map(p => (
                <div key={p.id} className="card">
                  <p className="font-medium text-sm">{p.titulo}</p>
                  <p className="text-xs text-brand-muted">{p.tipo} · {p.red}</p>
                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                    p.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                    p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{p.estado}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setModal(diaDetalle); setDiaDetalle(null) }}
              className="btn-primary w-full"
            >
              + Agregar pieza
            </button>
          </div>
        </div>
      )}

      {/* Modal nueva pieza */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="font-display text-lg">
              Nueva pieza — {format(modal, "d 'de' MMMM", { locale: es })}
            </h3>

            <div>
              <label className="label">Título</label>
              <input className="input" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Red social</label>
                <select className="input" value={form.red} onChange={e => setForm({...form, red: e.target.value})}>
                  {REDES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Descripción / copy</label>
              <textarea className="input" rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={guardarPieza} className="btn-primary flex-1" disabled={saving || !form.titulo}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
