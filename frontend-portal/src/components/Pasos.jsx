import { Check } from 'lucide-react'

const PASOS = ['Ticket', 'Datos fiscales', 'Confirmar', 'Factura']

export default function Pasos({ actual }) {
  return (
    <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Avance">
      {PASOS.map((nombre, i) => {
        const hecho = i < actual
        const activo = i === actual
        return (
          <li key={nombre} className="flex flex-col gap-2" aria-current={activo ? 'step' : undefined}>
            <span className={`h-1.5 rounded-full ${hecho || activo ? 'bg-marca-600' : 'bg-slate-200'}`} />
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                activo ? 'text-marca-700' : hecho ? 'text-tinta' : 'text-slate-400'
              }`}
            >
              {hecho && <Check className="size-3.5" aria-hidden="true" />}
              <span className="sm:hidden">{i + 1}</span>
              <span className="hidden sm:inline">{nombre}</span>
              <span className="sr-only">{hecho ? ' (completado)' : ''}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
