// Punto único de acceso a la API del portal.
// VITE_API_MODE=simulado  → datos de prueba en el navegador (no toca el backend).
// VITE_API_MODE=api       → backend real (Laravel), que a su vez usa FACTURACION_DRIVER.
import { convertirError, http } from './client'
import * as simulado from './simulado'

export const modoSimulado = import.meta.env.VITE_API_MODE !== 'api'

async function llamar(peticion) {
  try {
    const respuesta = await peticion()
    return respuesta.data
  } catch (error) {
    throw await convertirError(error)
  }
}

export async function consultarTicket({ sucursal, folio, fecha, total }) {
  if (modoSimulado) return simulado.consultarTicket({ sucursal, folio, fecha, total })
  const datos = await llamar(() =>
    http.post('/tickets/consultar', { sucursal, folio, fecha, total: Number(total) }),
  )
  return datos.ticket
}

export async function generarFactura(ticketId, receptor, claveIdempotencia) {
  if (modoSimulado) return simulado.generarFactura(ticketId, receptor, claveIdempotencia)
  const datos = await llamar(() =>
    http.post(
      '/facturas',
      { ticket_id: ticketId, receptor },
      { headers: { 'Idempotency-Key': claveIdempotencia } },
    ),
  )
  return datos.factura
}

export async function buscarFactura({ sucursal, folio, rfc }) {
  if (modoSimulado) return simulado.buscarFactura({ sucursal, folio, rfc })
  const datos = await llamar(() => http.post('/facturas/consultar', { sucursal, folio, rfc }))
  return datos.factura
}

export async function descargarArchivo(uuid, tipo, rfc) {
  if (modoSimulado) return simulado.descargarArchivo(uuid, tipo, rfc)
  return llamar(() =>
    http.get(`/facturas/${uuid}/${tipo}`, { params: { rfc }, responseType: 'blob' }),
  )
}

export async function reenviarFactura(uuid, rfc, correo) {
  if (modoSimulado) return simulado.reenviarFactura(uuid, rfc, correo)
  return llamar(() => http.post(`/facturas/${uuid}/reenviar`, { rfc, correo }))
}
