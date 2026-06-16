import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Panel() {
  const [clientes, setClientes] = useState([])
  const [piezasPendientes, setPiezasPendientes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: clientesData } = await supabase.from('clientes').select('*').order('nombre')
      const { count } = await supabase.from('piezas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')
      setClientes(clientesData || [])
      setPiezasPendientes(count || 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-brand-muted text-sm">Cargando...</div>

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-display">Panel</h2>
        <p className="text-brand-muted text-sm mt-1">Resumen general</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="card text-center">
          <p className="text-3xl font-display">{clientes.length}</p>
          <p className="text-xs text-brand-muted mt-1 uppercase tracking-wide">Clientes activos</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-display">{piezasPendientes}</p>
          <p className="text-xs text-brand-muted mt-1 uppercase tracking-wide">Piezas pendientes</p>
        </div>
        <Link to="/piezas" className="card text-center hover:border-brand-rose transition-colors cursor-pointer">
          <p className="text-3xl font-display">→</p>
          <p className="text-xs text-brand-muted mt-1 uppercase tracking-wide">Ver todas las piezas</p>
        </Link>
      </div>

      {/* Clientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wide text-brand-muted">Clientes</h3>
          <Link to="/clientes" className="text-xs text-brand-rose hover:underline">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {clientes.map(c => (
            <Link
              key={c.id}
              to={`/calendario?cliente=${c.id}`}
              className="card hover:border-brand-rose transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color || '#C8A99A' }}
                />
                <div>
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <p className="text-xs text-brand-muted">{c.instagram || '—'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
