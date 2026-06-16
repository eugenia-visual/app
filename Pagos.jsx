import { useState } from 'react'

const EFEMERIDES = [
  // Enero
  { mes: 1, dia: 1, nombre: 'Año Nuevo', categoria: 'general' },
  // Febrero
  { mes: 2, dia: 14, nombre: 'Día de los Enamorados / San Valentín', categoria: 'comercial' },
  // Marzo
  { mes: 3, dia: 8, nombre: 'Día Internacional de la Mujer', categoria: 'social' },
  { mes: 3, dia: 20, nombre: 'Inicio del Otoño', categoria: 'estación' },
  // Abril
  { mes: 4, dia: 2, nombre: 'Día del Veterano y Caídos en Malvinas', categoria: 'nacional' },
  // Mayo
  { mes: 5, dia: 1, nombre: 'Día del Trabajador', categoria: 'nacional' },
  { mes: 5, dia: 25, nombre: 'Día de la Patria', categoria: 'nacional' },
  // Junio
  { mes: 6, dia: 16, nombre: 'Día del Padre', categoria: 'comercial' },
  { mes: 6, dia: 20, nombre: 'Día de la Bandera', categoria: 'nacional' },
  { mes: 6, dia: 21, nombre: 'Inicio del Invierno', categoria: 'estación' },
  // Julio
  { mes: 7, dia: 9, nombre: 'Día de la Independencia', categoria: 'nacional' },
  // Agosto
  { mes: 8, dia: 17, nombre: 'Paso a la Inmortalidad del Gral. San Martín', categoria: 'nacional' },
  // Septiembre
  { mes: 9, dia: 11, nombre: 'Día del Maestro', categoria: 'social' },
  { mes: 9, dia: 21, nombre: 'Primavera / Día del Estudiante', categoria: 'social' },
  // Octubre
  { mes: 10, dia: 16, nombre: 'Día de la Madre', categoria: 'comercial' },
  // Noviembre
  { mes: 11, dia: 6, nombre: 'Día del Médico', categoria: 'social' },
  // Diciembre
  { mes: 12, dia: 25, nombre: 'Navidad', categoria: 'general' },
  { mes: 12, dia: 31, nombre: 'Fin de Año', categoria: 'general' },
]

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const CATEGORIAS = { general: '#C8A99A', comercial: '#A0C8C4', social: '#A8C8A0', nacional: '#B4A0C8', estación: '#C8C4A0' }

export default function Efemerides() {
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1)

  const del_mes = EFEMERIDES.filter(e => e.mes === mesActual)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display">Efemérides</h2>
        <select
          className="input w-auto text-sm"
          value={mesActual}
          onChange={e => setMesActual(Number(e.target.value))}
        >
          {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
      </div>

      {/* Leyenda */}
      <div className="flex gap-3 flex-wrap mb-6">
        {Object.entries(CATEGORIAS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-brand-muted">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </div>
        ))}
      </div>

      {del_mes.length === 0 ? (
        <div className="card text-center py-12 text-brand-muted">
          <p>Sin efemérides cargadas para este mes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {del_mes.map((e, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: CATEGORIAS[e.categoria] }}
              >
                {e.dia}
              </div>
              <div>
                <p className="font-medium text-sm">{e.nombre}</p>
                <p className="text-xs text-brand-muted">{MESES[e.mes-1]} {e.dia} · {e.categoria}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
