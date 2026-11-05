import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { buscarFactura } from '../api/portal'
import { SUCURSALES, nombreSucursal } from '../lib/catalogosSat'
import { normalizarRfc, validarFolio, validarRfc } from '../lib/validaciones'
import { Alerta, Boton, Campo, Tarjeta } from '../components/ui'
import { claseEntrada, propsAccesibles } from '../lib/estilos'
import DescargasFactura from '../components/DescargasFactura'

export default function Consultar() {
  const { state } = useLocation()
  const [datos, setDatos] = useState({
    sucursal: state?.sucursal ?? '',
    folio: state?.folio ?? '',
    rfc: '',
  })
  const [errores, setErrores] = useState({})
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: null }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    const encontrados = Object.fromEntries(
      Object.entries({
        sucursal: datos.sucursal ? null : 'Selecciona la sucursal.',
        folio: validarFolio(datos.folio),
        rfc: validarRfc(datos.rfc),
      }).filter(([, v]) => v),
    )
    setErrores(encontrados)
    setError(null)
    setResultado(null)
    if (Object.keys(encontrados).length) return

    setBuscando(true)
    try {
      const consulta = { ...datos, folio: datos.folio.trim() }
      const factura = await buscarFactura(consulta)
      setResultado({ factura, rfc: consulta.rfc })
    } catch (e) {
      setError(e)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tarjeta>
        <form onSubmit={enviar} noValidate className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-tinta sm:text-2xl">Consultar una factura</h1>
            <p className="mt-1 text-sm text-tenue">
              Descarga de nuevo el PDF y el XML de un ticket que ya facturaste. Pedimos el RFC para que solo su titular
              pueda verla.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo id="c-sucursal" etiqueta="Sucursal" error={errores.sucursal}>
              <select
                {...propsAccesibles('c-sucursal', errores.sucursal)}
                className={claseEntrada(errores.sucursal)}
                value={datos.sucursal}
                onChange={(e) => cambiar('sucursal', e.target.value)}
              >
                <option value="">Selecciona…</option>
                {SUCURSALES.map((s) => (
                  <option key={s.clave} value={s.clave}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo id="c-folio" etiqueta="Folio del ticket" error={errores.folio}>
              <input
                {...propsAccesibles('c-folio', errores.folio)}
                className={claseEntrada(errores.folio)}
                autoComplete="off"
                maxLength={20}
                value={datos.folio}
                onChange={(e) => cambiar('folio', e.target.value.toUpperCase())}
              />
            </Campo>
            <Campo id="c-rfc" etiqueta="RFC del receptor" error={errores.rfc}>
              <input
                {...propsAccesibles('c-rfc', errores.rfc)}
                className={`${claseEntrada(errores.rfc)} font-mono uppercase`}
                autoComplete="off"
                maxLength={13}
                value={datos.rfc}
                onChange={(e) => cambiar('rfc', normalizarRfc(e.target.value))}
              />
            </Campo>
          </div>

          {error && (
            <Alerta tipo="error" titulo="Sin resultados">
              {error.message}
            </Alerta>
          )}

          <div className="flex justify-end">
            <Boton type="submit" cargando={buscando}>
              {!buscando && <Search className="size-4" aria-hidden="true" />}
              {buscando ? 'Buscando…' : 'Buscar factura'}
            </Boton>
          </div>
        </form>
      </Tarjeta>

      {resultado && (
        <Tarjeta>
          <h2 className="mb-4 text-lg font-semibold text-tinta">
            Factura del ticket {resultado.factura.ticket?.folio ?? datos.folio}
            {resultado.factura.ticket?.sucursal && ` · ${nombreSucursal(resultado.factura.ticket.sucursal)}`}
          </h2>
          <DescargasFactura factura={resultado.factura} rfc={resultado.rfc} />
        </Tarjeta>
      )}
    </div>
  )
}
