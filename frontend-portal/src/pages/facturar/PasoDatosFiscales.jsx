import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { regimenesPara, usosPara } from '../../lib/catalogosSat'
import {
  detectarRegimenSocietario,
  normalizarRfc,
  quitarRegimenSocietario,
  tipoPersona,
  validarCodigoPostal,
  validarCorreo,
  validarNombre,
  validarRfc,
} from '../../lib/validaciones'
import { Alerta, Boton, Campo } from '../../components/ui'
import { claseEntrada, propsAccesibles } from '../../lib/estilos'
import ResumenTicket from '../../components/ResumenTicket'

const RECEPTOR_VACIO = {
  rfc: '',
  nombre: '',
  codigo_postal: '',
  regimen_fiscal: '',
  uso_cfdi: '',
  correo: '',
  correo_confirmacion: '',
}

function validar(r) {
  const errores = {
    rfc: validarRfc(r.rfc),
    nombre: validarNombre(r.nombre),
    codigo_postal: validarCodigoPostal(r.codigo_postal),
    regimen_fiscal: r.regimen_fiscal ? null : 'Selecciona tu régimen fiscal.',
    uso_cfdi: r.uso_cfdi ? null : 'Selecciona el uso que le darás a la factura.',
    correo: validarCorreo(r.correo),
    correo_confirmacion:
      r.correo && r.correo_confirmacion.trim().toLowerCase() !== r.correo.trim().toLowerCase()
        ? 'Los correos no coinciden.'
        : null,
  }
  return Object.fromEntries(Object.entries(errores).filter(([, v]) => v))
}

export default function PasoDatosFiscales({ ticket, inicial, errorPrevio, alRegresar, alContinuar }) {
  const [r, setR] = useState(inicial ?? RECEPTOR_VACIO)
  const [errores, setErrores] = useState(errorPrevio?.detalles ? aplanar(errorPrevio.detalles) : {})

  const persona = tipoPersona(r.rfc)
  const regimenes = useMemo(() => regimenesPara(persona), [persona])
  const usos = useMemo(() => usosPara(r.regimen_fiscal), [r.regimen_fiscal])
  const sufijo = persona === 'moral' ? detectarRegimenSocietario(r.nombre) : null

  function cambiar(campo, valor) {
    setR((actual) => {
      const nuevo = { ...actual, [campo]: valor }
      // Al cambiar el tipo de persona o el régimen, se limpian las opciones que dejan de ser válidas.
      if (campo === 'rfc' && tipoPersona(valor) !== tipoPersona(actual.rfc)) {
        nuevo.regimen_fiscal = ''
        nuevo.uso_cfdi = ''
      }
      if (campo === 'regimen_fiscal' && !usosPara(valor).some((u) => u.clave === actual.uso_cfdi)) {
        nuevo.uso_cfdi = ''
      }
      return nuevo
    })
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: null }))
  }

  function revisarCampo(campo) {
    const error = validar(r)[campo]
    if (error && r[campo]) setErrores((e) => ({ ...e, [campo]: error }))
  }

  function enviar(evento) {
    evento.preventDefault()
    const encontrados = validar(r)
    setErrores(encontrados)
    if (Object.keys(encontrados).length) {
      document.getElementById(Object.keys(encontrados)[0])?.focus()
      return
    }
    alContinuar({ ...r, nombre: r.nombre.trim().toUpperCase(), correo: r.correo.trim().toLowerCase() })
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-tinta sm:text-2xl">Tus datos fiscales</h1>
        <p className="mt-1 text-sm text-tenue">
          Deben ser idénticos a los de tu Constancia de Situación Fiscal. Si no coinciden, el SAT rechaza la factura.
        </p>
      </div>

      <ResumenTicket ticket={ticket} />

      {errorPrevio && (
        <Alerta tipo="error" titulo="El SAT no aceptó los datos">
          {errorPrevio.message}
        </Alerta>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="rfc" etiqueta="RFC" error={errores.rfc}>
          <input
            {...propsAccesibles('rfc', errores.rfc)}
            className={`${claseEntrada(errores.rfc)} font-mono uppercase tracking-wide`}
            autoComplete="off"
            maxLength={13}
            placeholder="13 o 12 caracteres"
            value={r.rfc}
            onChange={(e) => cambiar('rfc', normalizarRfc(e.target.value))}
            onBlur={() => revisarCampo('rfc')}
          />
        </Campo>

        <Campo id="codigo_postal" etiqueta="Código postal fiscal" error={errores.codigo_postal}>
          <input
            {...propsAccesibles('codigo_postal', errores.codigo_postal)}
            className={`${claseEntrada(errores.codigo_postal)} tabular-nums`}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="Ej. 34000"
            value={r.codigo_postal}
            onChange={(e) => cambiar('codigo_postal', e.target.value.replace(/\D/g, ''))}
            onBlur={() => revisarCampo('codigo_postal')}
          />
        </Campo>

        <div className="sm:col-span-2">
          <Campo
            id="nombre"
            etiqueta={persona === 'moral' ? 'Razón social' : 'Nombre completo'}
            error={errores.nombre}
            ayuda={
              persona === 'moral'
                ? 'Sin el régimen de capital (S.A. de C.V., S. de R.L., etc.).'
                : 'Como aparece en tu constancia, sin abreviaturas.'
            }
          >
            <input
              {...propsAccesibles('nombre', errores.nombre, true)}
              className={`${claseEntrada(errores.nombre)} uppercase`}
              autoComplete="off"
              maxLength={254}
              value={r.nombre}
              onChange={(e) => cambiar('nombre', e.target.value.toUpperCase())}
              onBlur={() => revisarCampo('nombre')}
            />
          </Campo>
          {sufijo && (
            <div className="mt-2">
              <Alerta tipo="aviso">
                Parece que la razón social incluye “{sufijo}”. Para CFDI 4.0 va sin el régimen de capital.{' '}
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => cambiar('nombre', quitarRegimenSocietario(r.nombre))}
                >
                  Quitarlo
                </button>
              </Alerta>
            </div>
          )}
        </div>

        <Campo
          id="regimen_fiscal"
          etiqueta="Régimen fiscal"
          error={errores.regimen_fiscal}
          ayuda={persona ? null : 'Primero escribe tu RFC.'}
        >
          <select
            {...propsAccesibles('regimen_fiscal', errores.regimen_fiscal, !persona)}
            className={claseEntrada(errores.regimen_fiscal)}
            disabled={!persona}
            value={r.regimen_fiscal}
            onChange={(e) => cambiar('regimen_fiscal', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {regimenes.map((reg) => (
              <option key={reg.clave} value={reg.clave}>
                {reg.clave} · {reg.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          id="uso_cfdi"
          etiqueta="Uso de la factura"
          error={errores.uso_cfdi}
          ayuda={r.regimen_fiscal ? null : 'Depende de tu régimen fiscal.'}
        >
          <select
            {...propsAccesibles('uso_cfdi', errores.uso_cfdi, !r.regimen_fiscal)}
            className={claseEntrada(errores.uso_cfdi)}
            disabled={!r.regimen_fiscal}
            value={r.uso_cfdi}
            onChange={(e) => cambiar('uso_cfdi', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {usos.map((u) => (
              <option key={u.clave} value={u.clave}>
                {u.clave} · {u.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="correo" etiqueta="Correo electrónico" error={errores.correo} ayuda="Ahí te enviamos el PDF y el XML.">
          <input
            {...propsAccesibles('correo', errores.correo, true)}
            type="email"
            autoComplete="email"
            className={claseEntrada(errores.correo)}
            value={r.correo}
            onChange={(e) => cambiar('correo', e.target.value)}
            onBlur={() => revisarCampo('correo')}
          />
        </Campo>

        <Campo id="correo_confirmacion" etiqueta="Confirma tu correo" error={errores.correo_confirmacion}>
          <input
            {...propsAccesibles('correo_confirmacion', errores.correo_confirmacion)}
            type="email"
            autoComplete="off"
            className={claseEntrada(errores.correo_confirmacion)}
            value={r.correo_confirmacion}
            onChange={(e) => cambiar('correo_confirmacion', e.target.value)}
            onPaste={(e) => e.preventDefault()}
          />
        </Campo>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Boton variante="secundario" onClick={alRegresar}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Cambiar ticket
        </Boton>
        <Boton type="submit">
          Revisar y confirmar
          <ArrowRight className="size-4" aria-hidden="true" />
        </Boton>
      </div>
    </form>
  )
}

// El backend devuelve los errores por campo como { campo: ['mensaje'] }.
function aplanar(detalles) {
  return Object.fromEntries(
    Object.entries(detalles).map(([campo, mensajes]) => [campo.replace(/^receptor\./, ''), [].concat(mensajes)[0]]),
  )
}
