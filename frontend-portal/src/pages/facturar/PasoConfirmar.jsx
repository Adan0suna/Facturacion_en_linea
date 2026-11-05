import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileCheck2 } from 'lucide-react'
import { generarFactura } from '../../api/portal'
import { nombreRegimen, nombreUso } from '../../lib/catalogosSat'
import { Alerta, Boton, Dato } from '../../components/ui'
import ResumenTicket from '../../components/ResumenTicket'

// Errores que se corrigen cambiando los datos del receptor; los demás se reintentan.
const ERRORES_DE_RECEPTOR = ['RECEPTOR_NO_COINCIDE', 'DATOS_INVALIDOS']

export default function PasoConfirmar({ ticket, receptor, claveIdempotencia, alRegresar, alCorregir, alTimbrar }) {
  const [acepta, setAcepta] = useState(false)
  const [timbrando, setTimbrando] = useState(false)
  const [error, setError] = useState(null)

  async function timbrar() {
    setTimbrando(true)
    setError(null)
    try {
      const { correo_confirmacion: _confirmacion, ...datosReceptor } = receptor
      const factura = await generarFactura(ticket.id, datosReceptor, claveIdempotencia)
      alTimbrar(factura)
    } catch (e) {
      if (ERRORES_DE_RECEPTOR.includes(e.codigo)) {
        alCorregir(e)
        return
      }
      setError(e)
      setTimbrando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-tinta sm:text-2xl">Revisa antes de facturar</h1>
        <p className="mt-1 text-sm text-tenue">
          Una vez emitida, la factura no se puede modificar desde el portal. Si algo no está bien, regresa y corrígelo.
        </p>
      </div>

      <ResumenTicket ticket={ticket} />

      <div className="rounded-xl border border-linea p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-tinta">Receptor</h2>
          <button
            type="button"
            className="text-sm font-medium text-marca-700 underline-offset-2 hover:underline"
            onClick={alRegresar}
            disabled={timbrando}
          >
            Editar
          </button>
        </div>
        <dl className="space-y-2.5">
          <Dato etiqueta="RFC" mono>
            {receptor.rfc}
          </Dato>
          <Dato etiqueta="Nombre o razón social">{receptor.nombre}</Dato>
          <Dato etiqueta="Código postal">{receptor.codigo_postal}</Dato>
          <Dato etiqueta="Régimen fiscal">
            {receptor.regimen_fiscal} · {nombreRegimen(receptor.regimen_fiscal)}
          </Dato>
          <Dato etiqueta="Uso del CFDI">
            {receptor.uso_cfdi} · {nombreUso(receptor.uso_cfdi)}
          </Dato>
          <Dato etiqueta="Enviar a">{receptor.correo}</Dato>
        </dl>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-tinta">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-marca-600"
          checked={acepta}
          onChange={(e) => setAcepta(e.target.checked)}
          disabled={timbrando}
        />
        <span>
          Leí el{' '}
          <Link to="/aviso-de-privacidad" target="_blank" className="font-medium text-marca-700 underline underline-offset-2">
            aviso de privacidad
          </Link>{' '}
          y acepto que mis datos se usen para emitir y enviarme esta factura.
        </span>
      </label>

      {error && (
        <Alerta tipo="error" titulo="No se pudo emitir la factura">
          {error.message}
          {error.codigo === 'TICKET_FACTURADO' ? (
            <>
              {' '}
              <Link to="/consultar" state={{ sucursal: ticket.sucursal, folio: ticket.folio }} className="font-semibold underline">
                Consultar factura
              </Link>
            </>
          ) : (
            <span className="mt-1 block">
              Puedes intentar de nuevo: si la factura ya se había emitido, no se duplicará.
            </span>
          )}
        </Alerta>
      )}

      {timbrando && (
        <Alerta tipo="info">Estamos generando tu factura con el SAT. Puede tardar unos segundos; no cierres esta página.</Alerta>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Boton variante="secundario" onClick={alRegresar} disabled={timbrando}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Regresar
        </Boton>
        <Boton onClick={timbrar} cargando={timbrando} disabled={!acepta || error?.codigo === 'TICKET_FACTURADO'}>
          {!timbrando && <FileCheck2 className="size-4" aria-hidden="true" />}
          {timbrando ? 'Generando factura…' : error ? 'Intentar de nuevo' : 'Generar factura'}
        </Boton>
      </div>
    </div>
  )
}
