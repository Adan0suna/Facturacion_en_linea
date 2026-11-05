import { nombreSucursal } from '../lib/catalogosSat'
import { formatoFecha, formatoMoneda } from '../lib/formato'

export default function ResumenTicket({ ticket }) {
  return (
    <div className="rounded-xl border border-linea bg-slate-50/70">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-linea px-4 py-3">
        <p className="text-sm font-semibold text-tinta">
          Ticket {ticket.folio} · {nombreSucursal(ticket.sucursal)}
        </p>
        <p className="text-xs text-tenue">
          {formatoFecha(ticket.fecha)}
          {ticket.forma_pago && ` · ${ticket.forma_pago}`}
        </p>
      </div>

      {ticket.conceptos?.length > 0 && (
        <ul className="divide-y divide-linea px-4">
          {ticket.conceptos.map((c, i) => (
            <li key={i} className="flex justify-between gap-4 py-2.5 text-sm">
              <span className="text-tinta">
                <span className="mr-1.5 tabular-nums text-tenue">{c.cantidad}×</span>
                {c.descripcion}
              </span>
              <span className="shrink-0 tabular-nums text-tinta">
                {formatoMoneda(c.cantidad * c.precio_unitario)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="space-y-1 border-t border-linea px-4 py-3 text-sm">
        <div className="flex justify-between text-tenue">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatoMoneda(ticket.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-tenue">
          <dt>IVA 16 %</dt>
          <dd className="tabular-nums">{formatoMoneda(ticket.iva)}</dd>
        </div>
        <div className="flex justify-between pt-1 text-base font-semibold text-tinta">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatoMoneda(ticket.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
