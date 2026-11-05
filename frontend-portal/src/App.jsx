import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Facturar from './pages/Facturar'
import Consultar from './pages/Consultar'
import AvisoPrivacidad from './pages/AvisoPrivacidad'
import { Tarjeta } from './components/ui'

function NoEncontrada() {
  return (
    <Tarjeta className="text-center">
      <h1 className="text-xl font-bold text-tinta">Página no encontrada</h1>
      <Link to="/" className="mt-3 inline-block text-sm font-medium text-marca-700 underline">
        Ir a facturar un ticket
      </Link>
    </Tarjeta>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Facturar />} />
        <Route path="consultar" element={<Consultar />} />
        <Route path="aviso-de-privacidad" element={<AvisoPrivacidad />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
