import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const EXTRAS_TIPOS = [
  { label: 'Jornada extra', precio: 0 },
  { label: 'Reel extra', precio: 0 },
  { label: 'Sesión de fotos', precio: 0 },
  { label: 'Placa WhatsApp 72hs', precio: 0 },
  { label: 'Placa WhatsApp 24hs', precio: 0 },
  { label: 'Otro', precio: 0 },
]

export default function Pagos() {
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [precioBase, setPrecioBase] = useState('')
  const [extras, setExtras] = useState([])
  const [mes, setMes] = useState(format(new Date(), 'MMMM yyyy', { locale: es }))
  const [concepto, setConcepto] = useState('Gestión de redes sociales')
  const [saving, setSaving] = useState(false)

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, color').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  useEffect(() => {
    if (clienteId) cargar()
  }, [clienteId])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from('pagos').select('*, clientes(nombre)').eq('cliente_id', clienteId).order('created_at', { ascending: false })
    setPagos(data || [])
    setLoading(false)
  }

  function agregarExtra() {
    setExtras([...extras, { tipo: 'Jornada extra', cantidad: 1, precio: 0 }])
  }

  function editarExtra(i, campo, valor) {
    const nuevos = [...extras]
    nuevos[i] = { ...nuevos[i], [campo]: valor }
    setExtras(nuevos)
  }

  function eliminarExtra(i) {
    setExtras(extras.filter((_, idx) => idx !== i))
  }

  const totalExtras = extras.reduce((sum, e) => sum + (Number(e.precio) * Number(e.cantidad)), 0)
  const total = Number(precioBase) + totalExtras

  async function confirmarPago() {
    setSaving(true)
    const clienteActual = clientes.find(c => c.id === clienteId)
    await supabase.from('pagos').insert([{
      cliente_id: clienteId,
      mes,
      concepto,
      precio_base: Number(precioBase),
      extras,
      total,
      estado: 'pagado',
      fecha: new Date().toISOString().split('T')[0],
      cliente_nombre: clienteActual?.nombre,
    }])
    setModal(false)
    setPrecioBase('')
    setExtras([])
    await cargar()
    setSaving(false)
  }

  const clienteActual = clientes.find(c => c.id === clienteId)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display">Pagos</h2>
          <p className="text-brand-muted text-sm mt-1">Registrá pagos y generá recibos</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto text-sm" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {clienteId && (
            <button onClick={() => setModal(true)} className="btn-primary">+ Nuevo pago</button>
          )}
        </div>
      </div>

      {!clienteId ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>Seleccioná un cliente para ver sus pagos.</p>
        </div>
      ) : loading ? (
        <p className="text-brand-muted text-sm">Cargando...</p>
      ) : pagos.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>No hay pagos registrados para {clienteActual?.nombre}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagos.map(p => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{p.mes} — {p.concepto}</p>
                <p className="text-xs text-brand-muted">{p.fecha}</p>
                {p.extras?.length > 0 && (
                  <p className="text-xs text-brand-muted mt-0.5">
                    Base: ${Number(p.precio_base).toLocaleString('es-AR')} + extras: ${(p.extras.reduce((s, e) => s + Number(e.precio) * Number(e.cantidad), 0)).toLocaleString('es-AR')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-xl">${Number(p.total).toLocaleString('es-AR')}</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{p.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo pago */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-auto">
            <h3 className="font-display text-lg">Nuevo pago — {clienteActual?.nombre}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Mes</label>
                <select className="input" value={mes} onChange={e => setMes(e.target.value)}>
                  {MESES.map(m => <option key={m}>{m} {new Date().getFullYear()}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Precio base</label>
                <input className="input" type="number" value={precioBase} onChange={e => setPrecioBase(e.target.value)} placeholder="35000" />
              </div>
            </div>

            <div>
              <label className="label">Concepto</label>
              <input className="input" value={concepto} onChange={e => setConcepto(e.target.value)} />
            </div>

            {/* Extras */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Extras</label>
                <button onClick={agregarExtra} className="text-xs text-brand-rose hover:underline">+ Agregar extra</button>
              </div>
              {extras.length === 0 && <p className="text-xs text-brand-muted">Sin extras este mes.</p>}
              <div className="space-y-2">
                {extras.map((e, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select className="input text-xs flex-1" value={e.tipo} onChange={ev => editarExtra(i, 'tipo', ev.target.value)}>
                      {EXTRAS_TIPOS.map(t => <option key={t.label}>{t.label}</option>)}
                    </select>
                    <input className="input text-xs w-16" type="number" min="1" value={e.cantidad} onChange={ev => editarExtra(i, 'cantidad', ev.target.value)} placeholder="Cant." />
                    <input className="input text-xs w-24" type="number" value={e.precio} onChange={ev => editarExtra(i, 'precio', ev.target.value)} placeholder="Precio c/u" />
                    <button onClick={() => eliminarExtra(i)} className="text-brand-muted hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-brand-sand pt-3">
              <div className="flex justify-between text-sm text-brand-muted mb-1">
                <span>Base</span>
                <span>${Number(precioBase || 0).toLocaleString('es-AR')}</span>
              </div>
              {extras.length > 0 && (
                <div className="flex justify-between text-sm text-brand-muted mb-1">
                  <span>Extras</span>
                  <span>${totalExtras.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={confirmarPago} className="btn-primary flex-1" disabled={saving || !precioBase}>
                {saving ? 'Guardando...' : 'Confirmar pago'}
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
