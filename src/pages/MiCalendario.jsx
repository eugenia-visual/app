import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { es } from 'date-fns/locale'

export default function MiCalendario() {
  const { user } = useAuth()
  const [cliente, setCliente] = useState(null)
  const [piezas, setPiezas] = useState([])
  const [mes, setMes] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('clientes').select('*').eq('email', user?.email).single()
      setCliente(c)
      if (c) {
        const inicio = format(startOfMonth(mes), 'yyyy-MM-dd')
        const fin = format(endOfMonth(mes), 'yyyy-MM-dd')
        const { data: p } = await supabase.from('piezas').select('*').eq('cliente_id', c.id).gte('fecha', inicio).lte('fecha', fin)
        setPiezas(p || [])
      }
      setLoading(false)
    }
    load()
  }, [user, mes])

  if (loading) return <div className="text-brand-muted text-sm">Cargando...</div>
  if (!cliente) return <div className="card text-brand-muted text-sm p-8">Tu cuenta todavía no está vinculada a un cliente. Contactá a Eugenia.</div>

  const dias = eachDayOfInterval({ start: startOfMonth(mes), end: endOfMonth(mes) })
  const offset = (() => { const d = getDay(startOfMonth(mes)); return d === 0 ? 6 : d - 1 })()
  const piezasDia = (f) => piezas.filter(p => p.fecha === format(f, 'yyyy-MM-dd'))

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display">Mi calendario</h2>
          <p className="text-brand-muted text-sm">{cliente.nombre}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setMes(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="btn-secondary px-3">‹</button>
          <span className="text-sm font-medium capitalize min-w-[120px] text-center">{format(mes, 'MMMM yyyy', { locale: es })}</span>
          <button onClick={() => setMes(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="btn-secondary px-3">›</button>
        </div>
      </div>

      <div className="border border-brand-sand rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-7 bg-brand-sand">
          {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
            <div key={d} className="text-xs font-medium text-brand-muted text-center py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array(offset).fill(null).map((_, i) => <div key={`e-${i}`} className="h-16 border-b border-r border-brand-sand/50" />)}
          {dias.map(dia => {
            const pp = piezasDia(dia)
            return (
              <div key={dia.toISOString()} className="h-16 border-b border-r border-brand-sand/50 p-1">
                <span className="text-xs text-brand-muted">{format(dia, 'd')}</span>
                {pp.map(p => (
                  <div key={p.id} className="text-xs mt-0.5 truncate px-1 rounded bg-brand-rose/20 text-brand-black">
                    {p.tipo}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium uppercase tracking-wide text-brand-muted mb-3">Piezas del mes</h3>
        <div className="space-y-2">
          {piezas.length === 0 ? <p className="text-sm text-brand-muted">Sin piezas cargadas todavía.</p> : piezas.map(p => (
            <div key={p.id} className="card flex items-center gap-4">
              <div>
                <p className="font-medium text-sm">{p.titulo}</p>
                <p className="text-xs text-brand-muted">{p.fecha} · {p.tipo} · {p.red}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                p.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                p.estado === 'cambios' ? 'bg-red-100 text-red-600' :
                'bg-yellow-100 text-yellow-700'
              }`}>{p.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
