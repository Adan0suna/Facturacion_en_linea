// Validaciones del lado del cliente. No sustituyen las del backend ni las del PAC:
// sirven para que el cliente corrija lo evidente antes de mandar la solicitud.

const RFC_FISICA = /^[A-ZÑ&]{4}\d{6}[A-Z\d]{3}$/
const RFC_MORAL = /^[A-ZÑ&]{3}\d{6}[A-Z\d]{3}$/
const RFC_GENERICOS = ['XAXX010101000', 'XEXX010101000']

// Sufijos de régimen societario. En CFDI 4.0 el nombre del receptor persona moral
// se captura sin ellos, tal como aparece en la Constancia de Situación Fiscal.
const REGIMEN_SOCIETARIO =
  /[\s,]+(S\.?\s?A\.?\s?P\.?\s?I\.?|S\.?\s?A\.?\s?B\.?|S\.?\s?A\.?|S\.?\s?DE\s?R\.?\s?L\.?|S\.?\s?EN\s?C\.?|S\.?\s?C\.?|A\.?\s?C\.?|S\.?\s?A\.?\s?S\.?)(\s?DE\s?C\.?\s?V\.?)?\s*$/

export function normalizarRfc(valor) {
  return valor.toUpperCase().replace(/[\s-]/g, '')
}

export function tipoPersona(rfc) {
  if (RFC_FISICA.test(rfc)) return 'fisica'
  if (RFC_MORAL.test(rfc)) return 'moral'
  return null
}

function fechaRfcValida(rfc) {
  const inicio = rfc.length === 13 ? 4 : 3
  const mes = Number(rfc.slice(inicio + 2, inicio + 4))
  const dia = Number(rfc.slice(inicio + 4, inicio + 6))
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31
}

export function validarRfc(rfc) {
  if (!rfc) return 'Escribe tu RFC.'
  if (RFC_GENERICOS.includes(rfc)) {
    return 'Ese es un RFC genérico. Para facturar necesitas tu RFC personal o el de tu empresa.'
  }
  if (!tipoPersona(rfc)) {
    return 'El RFC debe tener 13 caracteres (persona física) o 12 (persona moral).'
  }
  if (!fechaRfcValida(rfc)) return 'La fecha dentro del RFC no es válida. Revísalo.'
  return null
}

export function validarNombre(nombre) {
  if (!nombre.trim()) return 'Escribe tu nombre o razón social.'
  if (nombre.trim().length < 3) return 'El nombre es demasiado corto.'
  return null
}

export function detectarRegimenSocietario(nombre) {
  const coincidencia = nombre.toUpperCase().match(REGIMEN_SOCIETARIO)
  return coincidencia ? coincidencia[0].trim().replace(/^,\s*/, '') : null
}

export function quitarRegimenSocietario(nombre) {
  return nombre.toUpperCase().replace(REGIMEN_SOCIETARIO, '').trim()
}

export function validarCodigoPostal(cp) {
  if (!cp) return 'Escribe el código postal de tu domicilio fiscal.'
  if (!/^\d{5}$/.test(cp)) return 'El código postal debe tener 5 dígitos.'
  return null
}

export function validarCorreo(correo) {
  if (!correo) return 'Escribe un correo para enviarte la factura.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return 'El correo no tiene un formato válido.'
  return null
}

export function validarFolio(folio) {
  if (!folio.trim()) return 'Escribe el folio de tu ticket.'
  if (!/^[A-Za-z0-9-]{1,20}$/.test(folio.trim())) return 'El folio solo lleva letras, números y guiones.'
  return null
}

export function validarTotal(total) {
  if (total === '') return 'Escribe el total que aparece en tu ticket.'
  const numero = Number(total)
  if (Number.isNaN(numero) || numero <= 0) return 'El total debe ser mayor a cero.'
  return null
}

export function validarFecha(fecha) {
  if (!fecha) return 'Selecciona la fecha de compra.'
  if (fecha > hoyIso()) return 'La fecha no puede ser posterior a hoy.'
  return null
}

export function hoyIso() {
  const ahora = new Date()
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
