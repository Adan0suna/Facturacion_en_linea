// Catálogos del SAT para CFDI 4.0 (c_RegimenFiscal y c_UsoCFDI).
// Solo se listan los usos que tienen sentido para la compra de refacciones.
// Si la empresa decide ofrecer otros usos, se agregan aquí con sus regímenes válidos.

export const SUCURSALES = [
  { clave: 'MATRIZ', nombre: 'Matriz' },
  { clave: 'BOULEVARD', nombre: 'Boulevard Durango' },
  { clave: 'FACTOR', nombre: 'Factor' },
]

export const REGIMENES = [
  { clave: '601', nombre: 'General de Ley Personas Morales', fisica: false, moral: true },
  { clave: '603', nombre: 'Personas Morales con Fines no Lucrativos', fisica: false, moral: true },
  { clave: '605', nombre: 'Sueldos y Salarios e Ingresos Asimilados a Salarios', fisica: true, moral: false },
  { clave: '606', nombre: 'Arrendamiento', fisica: true, moral: false },
  { clave: '607', nombre: 'Régimen de Enajenación o Adquisición de Bienes', fisica: true, moral: false },
  { clave: '608', nombre: 'Demás ingresos', fisica: true, moral: false },
  { clave: '611', nombre: 'Ingresos por Dividendos (socios y accionistas)', fisica: true, moral: false },
  { clave: '612', nombre: 'Personas Físicas con Actividades Empresariales y Profesionales', fisica: true, moral: false },
  { clave: '614', nombre: 'Ingresos por intereses', fisica: true, moral: false },
  { clave: '615', nombre: 'Régimen de los ingresos por obtención de premios', fisica: true, moral: false },
  { clave: '616', nombre: 'Sin obligaciones fiscales', fisica: true, moral: false },
  { clave: '620', nombre: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos', fisica: false, moral: true },
  { clave: '621', nombre: 'Incorporación Fiscal', fisica: true, moral: false },
  { clave: '622', nombre: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', fisica: false, moral: true },
  { clave: '623', nombre: 'Opcional para Grupos de Sociedades', fisica: false, moral: true },
  { clave: '624', nombre: 'Coordinados', fisica: false, moral: true },
  { clave: '625', nombre: 'Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', fisica: true, moral: false },
  { clave: '626', nombre: 'Régimen Simplificado de Confianza', fisica: true, moral: true },
]

const REGIMENES_CON_DEDUCCION = ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626']

export const USOS_CFDI = [
  { clave: 'G01', nombre: 'Adquisición de mercancías', regimenes: REGIMENES_CON_DEDUCCION },
  { clave: 'G03', nombre: 'Gastos en general', regimenes: REGIMENES_CON_DEDUCCION },
  { clave: 'I08', nombre: 'Otra maquinaria y equipo', regimenes: REGIMENES_CON_DEDUCCION },
  { clave: 'S01', nombre: 'Sin efectos fiscales', regimenes: REGIMENES.map((r) => r.clave) },
]

export function regimenesPara(tipoPersona) {
  if (!tipoPersona) return []
  return REGIMENES.filter((r) => r[tipoPersona])
}

export function usosPara(claveRegimen) {
  if (!claveRegimen) return []
  return USOS_CFDI.filter((u) => u.regimenes.includes(claveRegimen))
}

export function nombreSucursal(clave) {
  return SUCURSALES.find((s) => s.clave === clave)?.nombre ?? clave
}

export function nombreRegimen(clave) {
  return REGIMENES.find((r) => r.clave === clave)?.nombre ?? clave
}

export function nombreUso(clave) {
  return USOS_CFDI.find((u) => u.clave === clave)?.nombre ?? clave
}
