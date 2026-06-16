import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Ideas() {
  const { user, isAdmin } = useAuth()
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [ideas, setIdeas] = useState([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => setClientes(data || []))
    } else {
      // cliente: buscar su ID
      supabase.from('clientes').select('id').eq('email', user?.email).single().then(({ data }) => {
        if (data) setClienteId(data.id)
      })
    }
  }, [isAdmin, user])

  useEffect(() => {
    if (clienteId) cargar()
  }, [clienteId])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from('ideas').select('*').eq('cliente_id', clienteId).order('created_at', { ascending: false })
    setIdeas(data || [])
    setLoading(false)
  }

  async function enviar() {
    if (!texto.trim() || !clienteId) return
    setSaving(true)
    await supabase.from('ideas').insert([{
      cliente_id: clienteId,
      texto,
      autor: isAdmin ? 'eugenia' : 'cliente',
      link: texto.startsWith('http') ? texto : null,
    }])
    setTexto('')
    await cargar()
    setSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display">Ideas próximas</h2>
        {isAdmin && (
          <select className="input w-auto text-sm" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        )}
      </div>

      {!clienteId ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>Seleccioná un cliente para ver las ideas.</p>
        </div>
      ) : (
        <>
          {/* Input nueva idea */}
          <div className="card mb-6">
            <label className="label">Nueva idea o link</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Escribí una idea, pegá un link..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviar()}
              />
              <button onClick={enviar} className="btn-primary px-4" disabled={saving || !texto.trim()}>
                {saving ? '...' : 'Agregar'}
              </button>
            </div>
          </div>

          {/* Lista de ideas */}
          {loading ? <p className="text-brand-muted text-sm">Cargando...</p> : (
            <div className="space-y-3">
              {ideas.length === 0 && <p className="text-sm text-brand-muted">Sin ideas todavía. ¡Tirá la primera!</p>}
              {ideas.map(idea => (
                <div key={idea.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${idea.autor === 'eugenia' ? 'bg-brand-rose' : 'bg-brand-muted'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-muted mb-1">{idea.autor === 'eugenia' ? 'Eugenia' : 'Cliente'}</p>
                      {idea.link ? (
                        <a href={idea.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-rose hover:underline break-all">{idea.texto}</a>
                      ) : (
                        <p className="text-sm">{idea.texto}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
