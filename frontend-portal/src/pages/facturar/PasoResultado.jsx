import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Boton } from '../../components/ui'
import DescargasFactura from '../../components/DescargasFactura'

export default function PasoResultado({ factura, receptor, alReiniciar }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-12 text-emerald-600" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-bold text-tinta sm:text-2xl">Tu factura está lista</h1>
          <p className="mt-1 text-sm text-tenue">
            También la enviamos a <span className="font-medium text-tinta">{factura.correo ?? receptor.correo}</span>. Si no
            la ves, revisa la carpeta de correo no deseado.
          </p>
        </div>
      </div>

      <DescargasFactura factura={factura} rfc={receptor.rfc} />

      <div className="flex justify-center border-t border-linea pt-5">
        <Boton variante="texto" onClick={alReiniciar}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Facturar otro ticket
        </Boton>
      </div>
    </div>
  )
}
