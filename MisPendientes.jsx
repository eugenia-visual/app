import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function IAImport() {
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [año, setAño] = useState(new Date().getFullYear())
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [archivo, setArchivo] = useState(null)
  const [texto, setTexto] = useState('')
  const [piezasDetectadas, setPiezasDetectadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const fileRef = useRef()

  useState(() => {
    supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => setClientes(data || []))
  }, [])

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  async function procesarTexto(contenido) {
    setLoading(true)
    setError('')
    setPiezasDetectadas([])

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: `Sos un asistente que extrae piezas de contenido de calendarios de redes sociales.
Dado un texto de calendario, extraé SOLO las piezas que tienen publicación en grilla (no las que dicen "Sin publicación en grilla").
Para cada pieza retorná un JSON array con objetos que tengan exactamente estos campos:
- titulo: string (el título en mayúsculas que aparece en la descripción, o el eje si no hay título)
- fecha: string en formato YYYY-MM-DD
- tipo: string (CARRUSEL, REEL, HISTORIA, PLACA, o OTRO)
- red: string (siempre "Instagram" a menos que diga otra cosa)
- descripcion: string (la descripción completa de la publicación)
- estado: string (siempre "borrador")
Respondé SOLO con el JSON array, sin texto adicional, sin markdown, sin explicaciones.`,
          messages: [{
            role: 'user',
            content: `Año: ${año}, Mes: ${mes}\n\nCalendario:\n${contenido}`
          }]
        })
      })

      const data = await response.json()
      const respuesta = data.content?.[0]?.text || ''
      
      try {
        const clean = respuesta.replace(/```json|```/g, '').trim()
        const piezas = JSON.parse(clean)
        setPiezasDetectadas(piezas)
      } catch {
        setError('No pude interpretar el calendario. Revisá que el formato sea correcto.')
      }
    } catch {
      setError('Error al conectar con la IA. Intentá de nuevo.')
    }

    setLoading(false)
  }

  async function handleArchivo(e) {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target.result
      setTexto(content)
    }
    reader.readAsText(file)
  }

  async function guardarPiezas() {
    if (!clienteId || piezasDetectadas.length === 0) return
    setGuardando(true)

    const piezasConCliente = piezasDetectadas.map(p => ({
      ...p,
      cliente_id: clienteId,
    }))

    await supabase.from('piezas').insert(piezasConCliente)
    setListo(true)
    setGuardando(false)
  }

  function editarPieza(i, campo, valor) {
    const nuevas = [...piezasDetectadas]
    nuevas[i] = { ...nuevas[i], [campo]: valor }
    setPiezasDetectadas(nuevas)
  }

  function eliminarPieza(i) {
    setPiezasDetectadas(prev => prev.filter((_, idx) => idx !== i))
  }

  if (listo) return (
    <div className="max-w-2xl">
      <div className="card text-center py-16">
        <p className="text-4xl mb-4">🎉</p>
        <h3 className="font-display text-xl mb-2">¡Listo!</h3>
        <p className="text-brand-muted text-sm mb-6">{piezasDetectadas.length} piezas cargadas en el calendario.</p>
        <button onClick={() => { setListo(false); setPiezasDetectadas([]); setTexto(''); setArchivo(null) }} className="btn-secondary">
          Importar otro calendario
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-display">IA Import</h2>
        <p className="text-brand-muted text-sm mt-1">Subí tu calendario y la IA distribuye las piezas automáticamente</p>
      </div>

      {piezasDetectadas.length === 0 ? (
        <div className="space-y-4">
          <div className="card space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Cliente</label>
                <select className="input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Mes</label>
                <select className="input" value={mes} onChange={e => setMes(Number(e.target.value))}>
                  {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Año</label>
                <input className="input" type="number" value={año} onChange={e => setAño(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="label">Pegá el texto del calendario</label>
              <textarea
                className="input font-mono text-xs"
                rows={10}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Pegá acá el contenido de tu doc de planificación..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current.click()}
                className="btn-secondary text-sm"
              >
                {archivo ? `📄 ${archivo.name}` : '📄 O subí un .txt'}
              </button>
              <input ref={fileRef} type="file" className="hidden" accept=".txt,.md" onChange={handleArchivo} />
              <span className="text-xs text-brand-muted">(.docx: copiá y pegá el texto)</span>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={() => procesarTexto(texto)}
              className="btn-primary w-full"
              disabled={loading || !texto.trim() || !clienteId}
            >
              {loading ? '🤖 Analizando con IA...' : '🤖 Detectar piezas'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Piezas detectadas</h3>
              <p className="text-xs text-brand-muted">{piezasDetectadas.length} piezas · Podés editar o eliminar antes de guardar</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPiezasDetectadas([])} className="btn-secondary text-sm">Volver</button>
              <button onClick={guardarPiezas} className="btn-primary text-sm" disabled={guardando}>
                {guardando ? 'Guardando...' : `Cargar ${piezasDetectadas.length} piezas`}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {piezasDetectadas.map((p, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="label">Fecha</label>
                        <input className="input text-xs" type="date" value={p.fecha} onChange={e => editarPieza(i, 'fecha', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Tipo</label>
                        <select className="input text-xs" value={p.tipo} onChange={e => editarPieza(i, 'tipo', e.target.value)}>
                          {['Reel','Carrusel','Historia','Placa','Otro'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Red</label>
                        <select className="input text-xs" value={p.red} onChange={e => editarPieza(i, 'red', e.target.value)}>
                          {['Instagram','Facebook','Ambas'].map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Título</label>
                      <input className="input text-xs" value={p.titulo} onChange={e => editarPieza(i, 'titulo', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Descripción</label>
                      <textarea className="input text-xs" rows={2} value={p.descripcion} onChange={e => editarPieza(i, 'descripcion', e.target.value)} />
                    </div>
                  </div>
                  <button onClick={() => eliminarPieza(i)} className="text-brand-muted hover:text-red-500 text-lg mt-1">×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={guardarPiezas} className="btn-primary flex-1" disabled={guardando}>
              {guardando ? 'Guardando...' : `Cargar ${piezasDetectadas.length} piezas al calendario`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
