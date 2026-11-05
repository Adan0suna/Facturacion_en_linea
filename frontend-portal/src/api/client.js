import axios from 'axios'

export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/portal`,
  timeout: 45000,
  headers: { Accept: 'application/json' },
})

export class ErrorPortal extends Error {
  constructor(codigo, mensaje, detalles = null) {
    super(mensaje)
    this.codigo = codigo
    this.detalles = detalles
  }
}

const MENSAJES_POR_ESTADO = {
  404: ['NO_ENCONTRADO', 'No encontramos la información solicitada.'],
  409: ['CONFLICTO', 'La solicitud ya fue procesada.'],
  422: ['DATOS_INVALIDOS', 'Algunos datos no son válidos. Revísalos e intenta de nuevo.'],
  429: ['DEMASIADOS_INTENTOS', 'Hiciste demasiados intentos seguidos. Espera un minuto y vuelve a intentar.'],
  503: ['FACTURACION_NO_DISPONIBLE', 'El servicio de facturación no está disponible en este momento.'],
}

async function leerCuerpo(data) {
  // Las descargas piden la respuesta como Blob; si falla, el error también llega como Blob.
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())
    } catch {
      return null
    }
  }
  return data
}

export async function convertirError(error) {
  if (error instanceof ErrorPortal) return error
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new ErrorPortal('TIEMPO_AGOTADO', 'El servidor tardó demasiado en responder. Intenta de nuevo.')
    }
    return new ErrorPortal('SIN_CONEXION', 'No pudimos conectar con el servidor. Revisa tu conexión a internet.')
  }
  const { status } = error.response
  const cuerpo = await leerCuerpo(error.response.data)
  const [codigoBase, mensajeBase] = MENSAJES_POR_ESTADO[status] ?? [
    'ERROR_SERVIDOR',
    'Ocurrió un error inesperado. Intenta de nuevo en unos minutos.',
  ]
  return new ErrorPortal(cuerpo?.codigo ?? codigoBase, cuerpo?.mensaje ?? mensajeBase, cuerpo?.errores ?? null)
}
