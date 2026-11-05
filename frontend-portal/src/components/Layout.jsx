import { NavLink, Link, Outlet } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { modoSimulado } from '../api/portal'

function Enlace({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

const ANIO = new Date().getFullYear()

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-fondo">
      {modoSimulado && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
          <FlaskConical className="size-3.5" aria-hidden="true" />
          Modo de prueba: los tickets son de ejemplo y las facturas no tienen validez fiscal.
        </div>
      )}

      <header className="bg-marca-800 text-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-white font-black tracking-tight text-marca-800">
              RV
            </span>
            <span className="leading-tight">
              <span className="block font-bold">Refacciones Victorino</span>
              <span className="block text-xs text-white/70">Facturación en línea</span>
            </span>
          </Link>
          <nav className="flex gap-1" aria-label="Principal">
            <Enlace to="/">Facturar ticket</Enlace>
            <Enlace to="/consultar">Consultar factura</Enlace>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-linea bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-tenue">
          <span>© {ANIO} Refacciones Victorino · Victoria de Durango, Dgo.</span>
          <Link to="/aviso-de-privacidad" className="underline-offset-2 hover:text-tinta hover:underline">
            Aviso de privacidad
          </Link>
        </div>
      </footer>
    </div>
  )
}
