import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { consultarTicket } from '../../api/portal'
import { SUCURSALES } from '../../lib/catalogosSat'
import { hoyIso, validarFecha, validarFolio, validarTotal } from '../../lib/validaciones'
import { Alerta, Boton, Campo } from '../../components/ui'
import { claseEntrada, propsAccesibles } from '../../lib/estilos'

const VACIO = { sucursal: '', folio: '', fecha: '', total: '' }

function validar(datos) {
  const errores = {
    sucursal: datos.sucursal ? null : 'Selecciona la sucursal donde compraste.',
    folio: validarFolio(datos.folio),
    fecha: validarFecha(datos.fecha),
    total: validarTotal(datos.total),
  }
  return Object.fromEntries(Object.entries(errores).filter(([, v]) => v))
}

export default function PasoTicket({ inicial, alEncontrar }) {
  const [datos, setDatos] = useState(inicial ?? VACIO)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [buscando, setBuscando] = useState(false)

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: null }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    const encontrados = validar(datos)
    setErrores(encontrados)
    setErrorServidor(null)
    if (Object.keys(encontrados).length) return

    setBuscando(true)
    try {
      const consulta = { ...datos, folio: datos.folio.trim() }
      const ticket = await consultarTicket(consulta)
      alEncontrar(ticket, consulta)
    } catch (error) {
      setErrorServidor(error)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-tinta sm:text-2xl">Factura tu compra</h1>
        <p className="mt-1 text-sm text-tenue">
          Captura los datos tal como aparecen en tu ticket impreso. Los usamos para localizar tu compra.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="sucursal" etiqueta="Sucursal" error={errores.sucursal}>
          <select
            {...propsAccesibles('sucursal', errores.sucursal)}
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

        <Campo id="folio" etiqueta="Folio del ticket" error={errores.folio}>
          <input
            {...propsAccesibles('folio', errores.folio)}
            className={claseEntrada(errores.folio)}
            inputMode="text"
            autoComplete="off"
            maxLength={20}
            placeholder="Ej. 10234"
            value={datos.folio}
            onChange={(e) => cambiar('folio', e.target.value.toUpperCase())}
          />
        </Campo>

        <Campo id="fecha" etiqueta="Fecha de compra" error={errores.fecha}>
          <input
            {...propsAccesibles('fecha', errores.fecha)}
            type="date"
            max={hoyIso()}
            className={claseEntrada(errores.fecha)}
            value={datos.fecha}
            onChange={(e) => cambiar('fecha', e.target.value)}
          />
        </Campo>

        <Campo id="total" etiqueta="Total pagado" error={errores.total} ayuda="Con IVA, como aparece en el ticket.">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">$</span>
            <input
              {...propsAccesibles('total', errores.total, true)}
              className={`${claseEntrada(errores.total)} pl-7 tabular-nums`}
              inputMode="decimal"
              placeholder="0.00"
              value={datos.total}
              onChange={(e) => cambiar('total', e.target.value.replace(/[^\d.]/g, ''))}
            />
          </div>
        </Campo>
      </div>

      {errorServidor && <ErrorTicket error={errorServidor} datos={datos} />}

      <div className="flex justify-end">
        <Boton type="submit" cargando={buscando}>
          {!buscando && <Search className="size-4" aria-hidden="true" />}
          {buscando ? 'Buscando ticket…' : 'Buscar ticket'}
        </Boton>
      </div>
    </form>
  )
}

function ErrorTicket({ error, datos }) {
  if (error.codigo === 'TICKET_FACTURADO') {
    return (
      <Alerta tipo="aviso" titulo="Este ticket ya tiene factura">
        {error.message}{' '}
        <Link
          to="/consultar"
          state={{ sucursal: datos.sucursal, folio: datos.folio.trim() }}
          className="font-semibold underline underline-offset-2"
        >
          Ir a consultar factura
        </Link>
      </Alerta>
    )
  }
  if (error.codigo === 'FUERA_DE_PLAZO') {
    return (
      <Alerta tipo="aviso" titulo="Fuera de plazo">
        {error.message}
      </Alerta>
    )
  }
  return (
    <Alerta tipo="error" titulo={error.codigo === 'TICKET_NO_ENCONTRADO' ? 'Ticket no encontrado' : 'No se pudo buscar el ticket'}>
      {error.message}
    </Alerta>
  )
}
