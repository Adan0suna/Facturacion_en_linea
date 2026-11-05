import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react'

export function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-acento">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-ayuda`} className="text-xs text-tenue">
            {ayuda}
          </p>
        )
      )}
    </div>
  )
}

const ESTILOS_ALERTA = {
  error: ['border-acento/25 bg-acento-50 text-acento', AlertCircle],
  aviso: ['border-amber-200 bg-amber-50 text-amber-900', AlertTriangle],
  ok: ['border-emerald-200 bg-emerald-50 text-emerald-800', CheckCircle2],
  info: ['border-sky-200 bg-sky-50 text-sky-900', Info],
}

export function Alerta({ tipo = 'info', titulo, children }) {
  const [clases, Icono] = ESTILOS_ALERTA[tipo]
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-lg border p-3.5 text-sm ${clases}`}>
      <Icono className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function Boton({ variante = 'primario', cargando = false, disabled = false, children, className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60'
  const variantes = {
    primario: 'bg-marca-600 text-white hover:bg-marca-700 focus-visible:ring-marca-200',
    secundario: 'border border-linea bg-white text-tinta hover:bg-slate-50 focus-visible:ring-slate-200',
    texto: 'text-marca-700 hover:bg-marca-50 focus-visible:ring-marca-100',
  }
  return (
    <button
      type="button"
      className={`${base} ${variantes[variante]} ${className}`}
      {...props}
      disabled={cargando || disabled}
      aria-busy={cargando || undefined}
    >
      {cargando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Tarjeta({ children, className = '' }) {
  return <section className={`rounded-2xl border border-linea bg-white p-5 shadow-sm sm:p-7 ${className}`}>{children}</section>
}

export function Dato({ etiqueta, children, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-tenue">{etiqueta}</dt>
      <dd className={`text-sm font-medium text-tinta sm:text-right ${mono ? 'font-mono break-all' : ''}`}>{children}</dd>
    </div>
  )
}
