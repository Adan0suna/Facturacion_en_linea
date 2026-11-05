const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatoMoneda(valor) {
  return moneda.format(Number(valor) || 0)
}

export function formatoFecha(iso) {
  if (!iso) return ''
  // Las fechas sin hora (AAAA-MM-DD) se interpretan como día local, no UTC.
  const fecha = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso)
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatoFechaHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function guardarArchivo(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function nuevaClave() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  // Respaldo para navegadores sin contexto seguro (http por IP en red local).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
