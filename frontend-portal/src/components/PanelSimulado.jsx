import { useState } from 'react'
import { FlaskConical, ChevronDown, ChevronUp, ClipboardCopy, Check } from 'lucide-react'

// Calcula la fecha de hace N días en formato ISO (mismo cálculo que simulado.js)
function haceDias(n) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - n)
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

// Espejo exacto de los tickets en simulado.js
export const TICKETS_PRUEBA = [
  {
    etiqueta: '✅ Disponible para facturar',
    color: 'green',
    sucursal: 'MATRIZ',
    sucursalNombre: 'Matriz',
    folio: '10234',
    fecha: haceDias(3),
    total: '1856.00',
    descripcion: '2× Rótula + 1× Terminal de dirección',
  },
  {
    etiqueta: '⏰ Fuera de plazo',
    color: 'orange',
    sucursal: 'BOULEVARD',
    sucursalNombre: 'Boulevard Durango',
    folio: '20011',
    fecha: '2026-09-12',
    total: '742.40',
    descripcion: '1× Base de amortiguador',
  },
  {
    etiqueta: '📄 Ya facturado',
    color: 'blue',
    sucursal: 'FACTOR',
    sucursalNombre: 'Factor',
    folio: '30578',
    fecha: haceDias(2),
    total: '348.00',
    descripcion: '2× Buje de horquilla',
    rfcFacturado: 'VIGJ850312AB4',
  },
]

export const RECEPTOR_PRUEBA = {
  rfc: 'VIGJ850312AB4',
  nombre: 'JUAN VILLA GARCIA',
  tipo_persona: 'fisica',
  regimen_fiscal: '612',
  codigo_postal: '34000',
  uso_cfdi: 'G03',
  correo: 'cliente@ejemplo.com',
}

function CopiarBtn({ texto }) {
  const [copiado, setCopiado] = useState(false)
  function copiar() {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    })
  }
  return (
    <button
      type="button"
      onClick={copiar}
      className="ml-1 inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs text-amber-700 hover:bg-amber-200 transition"
      title={`Copiar: ${texto}`}
    >
      {copiado ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />}
    </button>
  )
}

function Fila({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-amber-700 shrink-0">{label}:</span>
      <span className="font-mono font-semibold text-amber-900 text-right">
        {value}
        <CopiarBtn texto={value} />
      </span>
    </div>
  )
}

const COLOR = {
  green: 'border-green-300 bg-green-50',
  orange: 'border-orange-300 bg-orange-50',
  blue: 'border-blue-300 bg-blue-50',
}
const COLOR_BADGE = {
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  blue: 'bg-blue-100 text-blue-800',
}

export default function PanelSimulado({ onAutoRellenarTicket, onAutoRellenarConsulta }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 shadow-sm text-sm">
      {/* Cabecera */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
      >
        <span className="flex items-center gap-2 font-semibold text-amber-900">
          <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
          Modo simulado — datos de prueba
        </span>
        {abierto ? (
          <ChevronUp className="size-4 text-amber-600 shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-amber-600 shrink-0" />
        )}
      </button>

      {abierto && (
        <div className="border-t border-amber-200 px-4 pb-4 pt-3 space-y-4">
          <p className="text-amber-700 text-xs">
            Ninguna factura generada aquí tiene validez fiscal. Usa los datos de abajo para recorrer el flujo completo.
          </p>

          {/* Tickets */}
          <div>
            <p className="mb-2 font-semibold text-amber-900">Tickets disponibles</p>
            <div className="space-y-2">
              {TICKETS_PRUEBA.map((t) => (
                <div key={t.folio} className={`rounded-lg border p-3 ${COLOR[t.color]}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLOR_BADGE[t.color]}`}>
                      {t.etiqueta}
                    </span>
                    {onAutoRellenarTicket && t.color === 'green' && (
                      <button
                        type="button"
                        onClick={() => onAutoRellenarTicket(t)}
                        className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition"
                      >
                        Auto-rellenar formulario
                      </button>
                    )}
                    {onAutoRellenarConsulta && t.color === 'blue' && (
                      <button
                        type="button"
                        onClick={() => onAutoRellenarConsulta(t)}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Auto-rellenar consulta
                      </button>
                    )}
                  </div>
                  <Fila label="Sucursal" value={t.sucursalNombre} />
                  <Fila label="Folio" value={t.folio} />
                  <Fila label="Fecha" value={t.fecha} />
                  <Fila label="Total" value={`$${t.total}`} />
                  <div className="mt-1 text-xs text-amber-600">{t.descripcion}</div>
                  {t.rfcFacturado && (
                    <div className="mt-1 text-xs text-blue-700">
                      RFC con factura: <span className="font-mono font-bold">{t.rfcFacturado}</span>
                      <CopiarBtn texto={t.rfcFacturado} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Datos fiscales */}
          <div className="rounded-lg border border-amber-300 bg-white p-3">
            <p className="mb-2 font-semibold text-amber-900">Datos fiscales del receptor (para Paso 2)</p>
            <Fila label="Tipo" value="Persona física" />
            <Fila label="RFC" value={RECEPTOR_PRUEBA.rfc} />
            <Fila label="Nombre" value={RECEPTOR_PRUEBA.nombre} />
            <Fila label="Régimen" value={`${RECEPTOR_PRUEBA.regimen_fiscal} – Act. Empresariales`} />
            <Fila label="C.P." value={RECEPTOR_PRUEBA.codigo_postal} />
            <Fila label="Uso CFDI" value={`${RECEPTOR_PRUEBA.uso_cfdi} – Gastos en general`} />
            <Fila label="Correo" value={RECEPTOR_PRUEBA.correo} />
            <p className="mt-2 text-xs text-amber-600">
              💡 Usa C.P. <strong>00000</strong> para simular el rechazo del SAT.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
