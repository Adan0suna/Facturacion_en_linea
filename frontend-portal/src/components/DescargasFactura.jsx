import { useState } from 'react'
import { Check, Copy, FileCode2, FileText, Mail } from 'lucide-react'
import { descargarArchivo, reenviarFactura } from '../api/portal'
import { formatoFechaHora, formatoMoneda, guardarArchivo } from '../lib/formato'
import { validarCorreo } from '../lib/validaciones'
import { Alerta, Boton, Campo, Dato } from './ui'
import { claseEntrada, propsAccesibles } from '../lib/estilos'

export default function DescargasFactura({ factura, rfc }) {
  const [descargando, setDescargando] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [error, setError] = useState(null)
  const [correo, setCorreo] = useState('')
  const [errorCorreo, setErrorCorreo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [enviadoA, setEnviadoA] = useState(null)

  const nombreBase = `Factura_${factura.serie}${factura.folio}_${rfc}`

  async function descargar(tipo) {
    setDescargando(tipo)
    setError(null)
    try {
      const archivo = await descargarArchivo(factura.uuid, tipo, rfc)
      guardarArchivo(archivo, `${nombreBase}.${tipo}`)
    } catch (e) {
      setError(e)
    } finally {
      setDescargando(null)
    }
  }

  async function copiarUuid() {
    try {
      await navigator.clipboard.writeText(factura.uuid)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso de portapapeles: el UUID sigue visible para copiarlo a mano.
    }
  }

  async function reenviar(evento) {
    evento.preventDefault()
    const destino = correo.trim().toLowerCase()
    const problema = validarCorreo(destino)
    setErrorCorreo(problema)
    if (problema) return
    setEnviando(true)
    setError(null)
    try {
      await reenviarFactura(factura.uuid, rfc, destino)
      setEnviadoA(destino)
      setCorreo('')
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-5">
      <dl className="space-y-2.5 rounded-xl border border-linea p-4">
        <Dato etiqueta="Serie y folio">
          {factura.serie}-{factura.folio}
        </Dato>
        <Dato etiqueta="Folio fiscal (UUID)" mono>
          <span className="inline-flex items-center gap-2">
            {factura.uuid}
            <button
              type="button"
              onClick={copiarUuid}
              className="rounded p-1 text-tenue hover:bg-slate-100 hover:text-tinta"
              aria-label="Copiar folio fiscal"
            >
              {copiado ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </button>
          </span>
        </Dato>
        <Dato etiqueta="Fecha de emisión">{formatoFechaHora(factura.fecha_timbrado)}</Dato>
        <Dato etiqueta="Total">{formatoMoneda(factura.total)}</Dato>
      </dl>

      <div className="grid gap-3 sm:grid-cols-2">
        <Boton onClick={() => descargar('pdf')} cargando={descargando === 'pdf'} disabled={!!descargando}>
          {descargando !== 'pdf' && <FileText className="size-4" aria-hidden="true" />}
          Descargar PDF
        </Boton>
        <Boton variante="secundario" onClick={() => descargar('xml')} cargando={descargando === 'xml'} disabled={!!descargando}>
          {descargando !== 'xml' && <FileCode2 className="size-4" aria-hidden="true" />}
          Descargar XML
        </Boton>
      </div>

      {error && (
        <Alerta tipo="error" titulo="Algo falló">
          {error.message}
        </Alerta>
      )}

      <form onSubmit={reenviar} noValidate className="space-y-3 border-t border-linea pt-5">
        <Campo id="reenviar" etiqueta="Enviar a otro correo" error={errorCorreo}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              {...propsAccesibles('reenviar', errorCorreo)}
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              className={claseEntrada(errorCorreo)}
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value)
                setErrorCorreo(null)
              }}
            />
            <Boton type="submit" variante="secundario" cargando={enviando} className="shrink-0">
              {!enviando && <Mail className="size-4" aria-hidden="true" />}
              Enviar
            </Boton>
          </div>
        </Campo>
        {enviadoA && <Alerta tipo="ok">Enviamos la factura a {enviadoA}.</Alerta>}
      </form>
    </div>
  )
}
