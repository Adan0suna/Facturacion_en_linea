// Clases y atributos compartidos por los campos de formulario.

export function claseEntrada(error) {
  return [
    'w-full rounded-lg border bg-white px-3 py-2.5 text-base text-tinta shadow-xs outline-none transition',
    'placeholder:text-slate-400 focus:ring-3',
    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
    error
      ? 'border-acento/60 focus:border-acento focus:ring-acento-50'
      : 'border-linea focus:border-marca-600 focus:ring-marca-100',
  ].join(' ')
}

export function propsAccesibles(id, error, ayuda) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined,
  }
}
