import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function MisPendientes() {
  const { user } = useAuth()
  const [cliente, setCliente] = useState(null)
  const [pendientes, setPendientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [abierto, setAbierto] = useState(null)
  const [texto, setTexto] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('clientes').select('*').eq('email', user?.email).single()
      setCliente(c)
      if (c) {
        const { data } = await supabase.from('pendientes').select('*').eq('cliente_id', c.id).order('created_at', { ascending: false })
        setPendientes(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function enviarRespuesta(id) {
    if (!texto.trim() && !archivo) return
    setSaving(true)

    let url = null
    if (archivo) {
      const ext = archivo.name.split('.').pop()
      const path = `pendientes/${id}/${Date.now()}.${ext}`
      await supabase.storage.from('archivos').upload(path, archivo)
      const { data: urlData } = supabase.storage.from('archivos').getPublicUrl(path)
      url = urlData.publicUrl
    }

    await supabase.from('pendientes').update({
      estado: 'enviado',
      respuesta_texto: texto,
      respuesta_url: url,
      visto_admin: false,
    }).eq('id', id)

    setTexto('')
    setArchivo(null)
    setAbierto(null)

    const { data } = await supabase.from('pendientes').select('*').eq('cliente_id', cliente.id).order('created_at', { ascending: false })
    setPendientes(data || [])
    setSaving(false)
  }

  const badge = (estado) => ({
    pendiente: 'bg-yellow-100 text-yellow-700',
    enviado: 'bg-green-100 text-green-700',
    visto: 'bg-gray-100 text-gray-600',
  }[estado] || 'bg-gray-100 text-gray-600')

  if (loading) return <div className="text-brand-muted text-sm">Cargando...</div>
  if (!cliente) return <div className="card text-brand-muted text-sm p-8">Tu cuenta no está vinculada. Contactá a Eugenia.</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-display">Pendientes</h2>
        <p className="text-brand-muted text-sm mt-1">Tareas que te dejó Eugenia</p>
      </div>

      {pendientes.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <p>No tenés tareas pendientes por ahora. 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{p.titulo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge(p.estado)}`}>{p.estado}</span>
                    <span className="text-xs text-brand-muted px-2 py-0.5 rounded-full bg-brand-sand">{p.tipo}</span>
                  </div>
                  {p.descripcion && <p className="text-xs text-brand-muted">{p.descripcion}</p>}

                  {p.estado === 'enviado' && (
                    <div className="bg-green-50 rounded p-2 mt-2">
                      <p className="text-xs text-green-700">✓ Enviado</p>
                      {p.respuesta_texto && <p className="text-xs mt-1">{p.respuesta_texto}</p>}
                    </div>
                  )}

                  {p.estado === 'pendiente' && (
                    abierto === p.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          className="input text-sm"
                          rows={3}
                          placeholder="Escribí tu respuesta, caption, info..."
                          value={texto}
                          onChange={e => setTexto(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <button onClick={() => fileRef.current.click()} className="btn-secondary text-xs px-3">
                            {archivo ? `📎 ${archivo.name}` : '📎 Adjuntar foto/video'}
                          </button>
                          <input ref={fileRef} type="file" className="hidden" onChange={e => setArchivo(e.target.files[0])} accept="image/*,video/*" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => enviarRespuesta(p.id)} className="btn-primary text-xs px-4" disabled={saving || (!texto.trim() && !archivo)}>
                            {saving ? 'Enviando...' : 'Enviar'}
                          </button>
                          <button onClick={() => setAbierto(null)} className="btn-secondary text-xs px-4">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAbierto(p.id)} className="mt-2 btn-primary text-xs px-3 py-1.5">
                        Responder
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
