// Modo simulado: imita las respuestas del backend para programar y probar el portal
// sin conexión al POS ni al módulo de facturación. Los datos viven en memoria y se
// reinician al recargar la página. Nada de lo que se genera aquí tiene validez fiscal.
//
// Tickets de prueba (sucursal · folio · fecha · total):
//   Matriz    · 10234 · 3 días antes de hoy · 1856.00  → disponible para facturar
//   Boulevard · 20011 · 2026-09-12          ·  742.40  → fuera de plazo
//   Factor    · 30578 · 2 días antes de hoy ·  348.00  → ya facturado (RFC VIGJ850312AB4)
// Para simular el rechazo del SAT por datos del receptor, usa el código postal 00000.

import { ErrorPortal } from './client'
import { nuevaClave } from '../lib/formato'

function haceDias(n) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - n)
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function conImpuestos(conceptos) {
  const subtotal = conceptos.reduce((suma, c) => suma + c.cantidad * c.precio_unitario, 0)
  const iva = Math.round(subtotal * 0.16 * 100) / 100
  return { subtotal, iva, total: Math.round((subtotal + iva) * 100) / 100 }
}

function crearTicket(base) {
  return { ...base, ...conImpuestos(base.conceptos) }
}

const tickets = [
  crearTicket({
    id: 101,
    sucursal: 'MATRIZ',
    folio: '10234',
    fecha: haceDias(3),
    forma_pago: 'Efectivo',
    estado: 'disponible',
    conceptos: [
      { cantidad: 2, descripcion: 'RÓTULA INFERIOR ES-2019-R-SYD', precio_unitario: 420 },
      { cantidad: 1, descripcion: 'TERMINAL DE DIRECCIÓN ES-3366-L-SYD', precio_unitario: 760 },
    ],
  }),
  crearTicket({
    id: 102,
    sucursal: 'BOULEVARD',
    folio: '20011',
    fecha: '2026-09-12',
    forma_pago: 'Tarjeta de débito',
    estado: 'fuera_de_plazo',
    conceptos: [{ cantidad: 1, descripcion: 'BASE DE AMORTIGUADOR 5004', precio_unitario: 640 }],
  }),
  crearTicket({
    id: 103,
    sucursal: 'FACTOR',
    folio: '30578',
    fecha: haceDias(2),
    forma_pago: 'Transferencia',
    estado: 'facturado',
    conceptos: [{ cantidad: 2, descripcion: 'BUJE DE HORQUILLA', precio_unitario: 150 }],
  }),
]

const facturas = new Map()
const porClave = new Map()
let siguienteFolio = 1501

registrarFactura(tickets[2], {
  rfc: 'VIGJ850312AB4',
  nombre: 'JUAN VILLA GARCIA',
  codigo_postal: '34000',
  regimen_fiscal: '612',
  uso_cfdi: 'G03',
  correo: 'cliente@ejemplo.com',
})

function registrarFactura(ticket, receptor) {
  const factura = {
    uuid: nuevaClave().toUpperCase(),
    serie: 'PV',
    folio: String(siguienteFolio++),
    fecha_timbrado: new Date().toISOString(),
    total: ticket.total,
    correo: receptor.correo,
    rfc: receptor.rfc,
    ticket: { sucursal: ticket.sucursal, folio: ticket.folio, fecha: ticket.fecha },
  }
  ticket.estado = 'facturado'
  facturas.set(factura.uuid, { factura, receptor, ticket })
  return factura
}

function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

function folioLimpio(folio) {
  return String(folio).trim().toUpperCase().replace(/^0+/, '')
}

function sinDatosInternos(ticket) {
  const { estado: _estado, ...publico } = ticket
  return publico
}

export async function consultarTicket({ sucursal, folio, fecha, total }) {
  await esperar(500)
  const ticket = tickets.find(
    (t) =>
      t.sucursal === sucursal &&
      folioLimpio(t.folio) === folioLimpio(folio) &&
      t.fecha === fecha &&
      Math.abs(t.total - Number(total)) < 0.01,
  )
  if (!ticket) {
    throw new ErrorPortal(
      'TICKET_NO_ENCONTRADO',
      'No encontramos un ticket con esos datos. Revisa que la sucursal, el folio, la fecha y el total coincidan con tu ticket impreso.',
    )
  }
  if (ticket.estado === 'facturado') {
    throw new ErrorPortal('TICKET_FACTURADO', 'Este ticket ya fue facturado. Puedes descargar la factura desde "Consultar factura".')
  }
  if (ticket.estado === 'fuera_de_plazo') {
    throw new ErrorPortal(
      'FUERA_DE_PLAZO',
      'El plazo para facturar este ticket en línea ya terminó. Acude a la sucursal donde hiciste tu compra para revisar tu caso.',
    )
  }
  return sinDatosInternos(ticket)
}

export async function generarFactura(ticketId, receptor, claveIdempotencia) {
  await esperar(1400)
  // Misma clave = misma solicitud: se devuelve la factura ya emitida, no se timbra otra.
  if (porClave.has(claveIdempotencia)) return porClave.get(claveIdempotencia)

  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket) throw new ErrorPortal('TICKET_NO_ENCONTRADO', 'El ticket ya no está disponible.')
  if (ticket.estado === 'facturado') {
    throw new ErrorPortal('TICKET_FACTURADO', 'Este ticket ya fue facturado.')
  }
  if (receptor.codigo_postal === '00000') {
    throw new ErrorPortal(
      'RECEPTOR_NO_COINCIDE',
      'El SAT rechazó la factura: el código postal no corresponde al domicilio fiscal registrado para ese RFC. Revisa tu Constancia de Situación Fiscal.',
      { codigo_postal: ['No coincide con el registro del SAT.'] },
    )
  }
  const factura = registrarFactura(ticket, receptor)
  porClave.set(claveIdempotencia, factura)
  return factura
}

export async function buscarFactura({ sucursal, folio, rfc }) {
  await esperar(500)
  for (const { factura } of facturas.values()) {
    if (
      factura.ticket.sucursal === sucursal &&
      folioLimpio(factura.ticket.folio) === folioLimpio(folio) &&
      factura.rfc === rfc
    ) {
      return factura
    }
  }
  throw new ErrorPortal(
    'FACTURA_NO_ENCONTRADA',
    'No encontramos una factura para ese ticket con el RFC indicado.',
  )
}

export async function reenviarFactura(uuid, rfc, correo) {
  await esperar(600)
  const registro = facturas.get(uuid)
  if (!registro || registro.factura.rfc !== rfc) {
    throw new ErrorPortal('FACTURA_NO_ENCONTRADA', 'No encontramos la factura.')
  }
  return { enviado_a: correo }
}

export async function descargarArchivo(uuid, tipo, rfc) {
  await esperar(300)
  const registro = facturas.get(uuid)
  if (!registro || registro.factura.rfc !== rfc) {
    throw new ErrorPortal('FACTURA_NO_ENCONTRADA', 'No encontramos la factura.')
  }
  if (tipo === 'xml') {
    return new Blob([xmlDePrueba(registro)], { type: 'application/xml' })
  }
  return new Blob([pdfDePrueba(registro)], { type: 'application/pdf' })
}

function escXml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function xmlDePrueba({ factura, receptor: r, ticket }) {
  const receptor = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, escXml(v)]))
  const conceptos = ticket.conceptos
    .map(
      (c) =>
        `    <cfdi:Concepto Cantidad="${c.cantidad}" Descripcion="${escXml(c.descripcion)}" ValorUnitario="${c.precio_unitario.toFixed(2)}" Importe="${(c.cantidad * c.precio_unitario).toFixed(2)}"/>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- DOCUMENTO SIMULADO: SIN VALIDEZ FISCAL -->
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" Serie="${factura.serie}" Folio="${factura.folio}" Fecha="${factura.fecha_timbrado.slice(0, 19)}" SubTotal="${ticket.subtotal.toFixed(2)}" Total="${ticket.total.toFixed(2)}" Moneda="MXN" TipoDeComprobante="I">
  <cfdi:Receptor Rfc="${receptor.rfc}" Nombre="${receptor.nombre}" DomicilioFiscalReceptor="${receptor.codigo_postal}" RegimenFiscalReceptor="${receptor.regimen_fiscal}" UsoCFDI="${receptor.uso_cfdi}"/>
  <cfdi:Conceptos>
${conceptos}
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" UUID="${factura.uuid}"/>
  </cfdi:Complemento>
</cfdi:Comprobante>
`
}

// PDF mínimo de una página, armado a mano para no agregar dependencias.
function pdfDePrueba({ factura, receptor, ticket }) {
  const ascii = (texto) =>
    String(texto)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/([\\()])/g, '\\$1')
  const lineas = [
    'REFACCIONES VICTORINO - FACTURA SIMULADA (SIN VALIDEZ FISCAL)',
    '',
    `Serie y folio: ${factura.serie}-${factura.folio}`,
    `UUID: ${factura.uuid}`,
    `Fecha de timbrado: ${factura.fecha_timbrado.slice(0, 19).replace('T', ' ')}`,
    '',
    `Receptor: ${receptor.nombre}`,
    `RFC: ${receptor.rfc}   C.P.: ${receptor.codigo_postal}`,
    `Regimen fiscal: ${receptor.regimen_fiscal}   Uso CFDI: ${receptor.uso_cfdi}`,
    '',
    'Conceptos:',
    ...ticket.conceptos.map(
      (c) => `  ${c.cantidad} x ${c.descripcion}  $${(c.cantidad * c.precio_unitario).toFixed(2)}`,
    ),
    '',
    `Subtotal: $${ticket.subtotal.toFixed(2)}`,
    `IVA 16%: $${ticket.iva.toFixed(2)}`,
    `Total: $${ticket.total.toFixed(2)}`,
  ].map(ascii)

  const contenido = `BT /F1 11 Tf 16 TL 50 760 Td ${lineas.map((l) => `(${l}) '`).join(' ')} ET`
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const posiciones = []
  objetos.forEach((obj, i) => {
    posiciones.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const inicioXref = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  pdf += posiciones.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`
  return pdf
}
