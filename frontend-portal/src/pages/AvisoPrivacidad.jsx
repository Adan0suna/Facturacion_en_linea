import { Alerta, Tarjeta } from '../components/ui'
import { modoSimulado } from '../api/portal'

// TEXTO BASE. Antes de publicar el portal, la empresa debe revisarlo y aprobarlo
// (de preferencia con su contador o asesor legal) y completar lo marcado entre corchetes.
const RESPONSABLE = 'Dora Ma. García Luna (Refacciones Victorino)'
const DOMICILIO = 'calle María Bayona #505, colonia Santa Fe, C.P. 34240, Victoria de Durango, Durango'
const CONTACTO = '[correo para solicitudes de privacidad]'

export default function AvisoPrivacidad() {
  return (
    <Tarjeta className="space-y-5 text-sm leading-relaxed text-tinta">
      <h1 className="text-xl font-bold sm:text-2xl">Aviso de privacidad del portal de facturación</h1>

      {modoSimulado && (
        <Alerta tipo="aviso" titulo="Texto pendiente de aprobación">
          Este aviso es una base de trabajo. Debe revisarlo y aprobarlo la empresa antes de publicar el portal.
        </Alerta>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Responsable</h2>
        <p>
          {RESPONSABLE}, con domicilio en {DOMICILIO}, es responsable del tratamiento de los datos personales que
          proporcionas en este portal.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Datos que recabamos</h2>
        <p>
          RFC, nombre o razón social, código postal del domicilio fiscal, régimen fiscal, uso del CFDI y correo
          electrónico, además de los datos del ticket de compra que capturas para localizarlo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Para qué los usamos</h2>
        <p>
          Para emitir tu Comprobante Fiscal Digital por Internet (CFDI), enviártelo por correo, permitirte descargarlo
          de nuevo y conservarlo durante el plazo que exigen las disposiciones fiscales. No los usamos con fines
          publicitarios.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Con quién los compartimos</h2>
        <p>
          Con el Proveedor Autorizado de Certificación (PAC) que certifica la factura y con el Servicio de
          Administración Tributaria (SAT), únicamente para cumplir con la emisión del comprobante.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Tus derechos</h2>
        <p>
          Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus datos (derechos
          ARCO) escribiendo a {CONTACTO}. Ten en cuenta que los datos de una factura ya emitida se conservan por
          obligación fiscal.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Cambios a este aviso</h2>
        <p>Cualquier cambio se publicará en esta misma página. Última actualización: [fecha].</p>
      </section>
    </Tarjeta>
  )
}
