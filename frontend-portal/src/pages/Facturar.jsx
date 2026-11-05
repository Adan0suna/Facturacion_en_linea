import { useEffect, useRef, useState } from 'react'
import { nuevaClave } from '../lib/formato'
import { Tarjeta } from '../components/ui'
import Pasos from '../components/Pasos'
import PasoTicket from './facturar/PasoTicket'
import PasoDatosFiscales from './facturar/PasoDatosFiscales'
import PasoConfirmar from './facturar/PasoConfirmar'
import PasoResultado from './facturar/PasoResultado'
import PanelSimulado from '../components/PanelSimulado'
import { modoSimulado } from '../api/portal'

const PASO = { TICKET: 0, DATOS: 1, CONFIRMAR: 2, LISTO: 3 }

export default function Facturar() {
  const [paso, setPaso] = useState(PASO.TICKET)
  const [consulta, setConsulta] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [receptor, setReceptor] = useState(null)
  const [errorReceptor, setErrorReceptor] = useState(null)
  const [factura, setFactura] = useState(null)
  // Una clave por intento de emisión. Si el cliente reintenta tras un corte de red,
  // se manda la misma clave y el backend devuelve la factura ya timbrada en vez de otra.
  const [clave, setClave] = useState(null)
  // Datos pre-cargados desde el panel simulado
  const [datosIniciales, setDatosIniciales] = useState(null)
  const contenedor = useRef(null)

  function autoRellenarTicket(t) {
    setDatosIniciales({ sucursal: t.sucursal, folio: t.folio, fecha: t.fecha, total: t.total })
  }

  useEffect(() => {
    contenedor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [paso])

  // Evita perder lo capturado por un cierre accidental mientras se llena el formulario.
  useEffect(() => {
    if (paso === PASO.TICKET || paso === PASO.LISTO) return
    const avisar = (e) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [paso])

  function reiniciar() {
    setPaso(PASO.TICKET)
    setConsulta(null)
    setTicket(null)
    setReceptor(null)
    setErrorReceptor(null)
    setFactura(null)
    setClave(null)
    setDatosIniciales(null)
  }

  return (
    <div ref={contenedor} className="scroll-mt-6">
      {modoSimulado && paso === PASO.TICKET && (
        <PanelSimulado onAutoRellenarTicket={autoRellenarTicket} />
      )}
      <Pasos actual={paso} />
      <Tarjeta>
        {paso === PASO.TICKET && (
          <PasoTicket
            inicial={datosIniciales ?? consulta}
            alEncontrar={(t, datosConsulta) => {
              setTicket(t)
              setConsulta(datosConsulta)
              setPaso(PASO.DATOS)
            }}
          />
        )}

        {paso === PASO.DATOS && (
          <PasoDatosFiscales
            ticket={ticket}
            inicial={receptor}
            errorPrevio={errorReceptor}
            alRegresar={() => setPaso(PASO.TICKET)}
            alContinuar={(datos) => {
              setReceptor(datos)
              setErrorReceptor(null)
              setClave(nuevaClave())
              setPaso(PASO.CONFIRMAR)
            }}
          />
        )}

        {paso === PASO.CONFIRMAR && (
          <PasoConfirmar
            ticket={ticket}
            receptor={receptor}
            claveIdempotencia={clave}
            alRegresar={() => setPaso(PASO.DATOS)}
            alCorregir={(error) => {
              setErrorReceptor(error)
              setPaso(PASO.DATOS)
            }}
            alTimbrar={(f) => {
              setFactura(f)
              setPaso(PASO.LISTO)
            }}
          />
        )}

        {paso === PASO.LISTO && <PasoResultado factura={factura} receptor={receptor} alReiniciar={reiniciar} />}
      </Tarjeta>
    </div>
  )
}
