# API del portal de autofacturación

Contrato que espera `frontend-portal` cuando corre con `VITE_API_MODE=api`. Todas las rutas son públicas (sin sesión) y cuelgan de `/api/portal`. El backend Laravel es el único que habla con el POS y con el módulo de facturación, a través de sus gateways (`POS_DRIVER`, `FACTURACION_DRIVER`).

## Formato de errores

Cualquier error responde con este cuerpo. El portal muestra `mensaje` tal cual, así que debe venir redactado para el cliente.

```json
{
  "codigo": "TICKET_NO_ENCONTRADO",
  "mensaje": "No encontramos un ticket con esos datos…",
  "errores": { "receptor.codigo_postal": ["No coincide con el registro del SAT."] }
}
```

`errores` es opcional; cuando viene, el portal marca cada campo en rojo.

| Código | HTTP | Cuándo |
|---|---|---|
| `TICKET_NO_ENCONTRADO` | 404 | Sucursal, folio, fecha o total no coinciden con un ticket del POS |
| `TICKET_FACTURADO` | 409 | El ticket ya tiene CFDI vigente |
| `FUERA_DE_PLAZO` | 422 | El ticket salió del plazo de autofacturación (plazo por definir en la empresa) |
| `RECEPTOR_NO_COINCIDE` | 422 | El PAC o el SAT rechazaron los datos del receptor |
| `DATOS_INVALIDOS` | 422 | Falla la validación de Laravel |
| `FACTURA_NO_ENCONTRADA` | 404 | Consulta, descarga o reenvío sin coincidencia de ticket + RFC |
| `DEMASIADOS_INTENTOS` | 429 | Límite de peticiones (recomendado: `throttle:10,1` por IP) |
| `FACTURACION_NO_DISPONIBLE` | 503 | El módulo de facturación o el PAC no responden |

## 1. Consultar ticket

`POST /api/portal/tickets/consultar`

```json
{ "sucursal": "MATRIZ", "folio": "10234", "fecha": "2026-11-02", "total": 1856.00 }
```

`sucursal` es `MATRIZ`, `BOULEVARD` o `FACTOR`. Se piden fecha y total además del folio para que nadie pueda recorrer folios y ver compras ajenas.

Respuesta `200`:

```json
{
  "ticket": {
    "id": 101,
    "sucursal": "MATRIZ",
    "folio": "10234",
    "fecha": "2026-11-02",
    "forma_pago": "Efectivo",
    "subtotal": 1600.00,
    "iva": 256.00,
    "total": 1856.00,
    "conceptos": [
      { "cantidad": 2, "descripcion": "RÓTULA INFERIOR ES-2019-R-SYD", "precio_unitario": 420.00 }
    ]
  }
}
```

## 2. Emitir factura

`POST /api/portal/facturas`

Encabezado obligatorio: `Idempotency-Key: <uuid>`. Si llega una clave ya usada, el backend devuelve la misma factura sin volver a timbrar. Así un reintento por corte de red no duplica el CFDI.

```json
{
  "ticket_id": 101,
  "receptor": {
    "rfc": "ABC010203XY1",
    "nombre": "REFACCIONARIA DEL NORTE",
    "codigo_postal": "34000",
    "regimen_fiscal": "601",
    "uso_cfdi": "G03",
    "correo": "compras@ejemplo.com"
  }
}
```

Respuesta `201`:

```json
{
  "factura": {
    "uuid": "11ECA021-4E68-4727-8E03-8097CB5C4311",
    "serie": "PV",
    "folio": "1502",
    "fecha_timbrado": "2026-11-05T13:38:00-06:00",
    "total": 1856.00,
    "correo": "compras@ejemplo.com",
    "ticket": { "sucursal": "MATRIZ", "folio": "10234", "fecha": "2026-11-02" }
  }
}
```

El backend vuelve a validar todo lo que valida el portal (RFC, régimen contra tipo de persona, uso CFDI contra régimen) antes de mandar la solicitud al módulo de facturación.

## 3. Consultar factura emitida

`POST /api/portal/facturas/consultar`

```json
{ "sucursal": "FACTOR", "folio": "30578", "rfc": "VIGJ850312AB4" }
```

Responde `200` con `{ "factura": { … } }`, con la misma forma que el punto 2.

## 4. Descargar PDF o XML

`GET /api/portal/facturas/{uuid}/pdf?rfc=VIGJ850312AB4`
`GET /api/portal/facturas/{uuid}/xml?rfc=VIGJ850312AB4`

Devuelve el archivo (`application/pdf` o `application/xml`). Si el RFC no corresponde al UUID, responde `404 FACTURA_NO_ENCONTRADA`.

## 5. Reenviar por correo

`POST /api/portal/facturas/{uuid}/reenviar`

```json
{ "rfc": "VIGJ850312AB4", "correo": "otro@ejemplo.com" }
```

Responde `200` con `{ "enviado_a": "otro@ejemplo.com" }`.

## Pendientes de la empresa

- Plazo permitido para facturar un ticket (define cuándo responder `FUERA_DE_PLAZO`).
- Contrato de la API del módulo de facturación del POS (lo consume `FacturacionGateway`).
- Texto definitivo del aviso de privacidad y correo para solicitudes ARCO (`src/pages/AvisoPrivacidad.jsx`).
