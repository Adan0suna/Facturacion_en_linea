# Portal de autofacturación

Front público donde el cliente genera su CFDI 4.0 a partir de su ticket de compra. React 19 + Vite + Tailwind 4.

## Correr en local

```bash
npm install
cp .env.example .env    # en Windows: copy
npm run dev             # http://localhost:5174
```

| Variable | Valores | Uso |
|---|---|---|
| `VITE_API_URL` | URL del backend | Base de la API (`/api/portal` se agrega solo) |
| `VITE_API_MODE` | `simulado` \| `api` | `simulado` no llama al backend; usa datos de prueba en memoria |

Si `VITE_API_MODE` no se define, el portal arranca en `simulado` y lo indica con una franja amarilla arriba.

## Tickets de prueba (modo simulado)

| Sucursal | Folio | Fecha | Total | Resultado |
|---|---|---|---|---|
| Matriz | 10234 | hace 3 días | 1856.00 | Se puede facturar |
| Boulevard Durango | 20011 | 12/09/2026 | 742.40 | Fuera de plazo |
| Factor | 30578 | hace 2 días | 348.00 | Ya facturado (consultar con RFC `VIGJ850312AB4`) |

El código postal `00000` simula el rechazo del SAT por datos del receptor.

## Flujo

1. **Ticket:** sucursal, folio, fecha y total → `POST /tickets/consultar`.
2. **Datos fiscales:** RFC, nombre o razón social, C.P., régimen y uso del CFDI. Los régimenes se filtran por tipo de persona y los usos por régimen, según los catálogos del SAT.
3. **Confirmar:** resumen y aceptación del aviso de privacidad → `POST /facturas` con `Idempotency-Key`.
4. **Factura:** UUID, descarga de PDF y XML y reenvío por correo.

Aparte, **Consultar factura** (`/consultar`) permite volver a descargar una factura con sucursal, folio y RFC.

El contrato completo de la API está en `docs/API_PORTAL.md`.

## Estructura

```
src/
  api/          client.js (axios y errores), portal.js (llamadas), simulado.js (modo de prueba)
  lib/          catálogos SAT, validaciones, formatos y clases de formulario
  components/   Layout, pasos, resumen del ticket, descargas y piezas de UI
  pages/        Facturar (asistente de 4 pasos), Consultar, Aviso de privacidad
```

## Producción

```bash
npm run build    # genera dist/
```

`dist/` se sirve como sitio estático. El servidor debe redirigir cualquier ruta a `index.html` para que funcionen `/consultar` y `/aviso-de-privacidad` (en Apache, `FallbackResource /index.html`).
