import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth/use-auth"
import { homePorRol } from "@/config/nav"

export function LoginRedirect() {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (usuario) return <Navigate to={homePorRol(usuario.rol)} replace />
  return <Navigate to="/login" replace />
}

export function RutaNoEncontrada() {
  return <Navigate to="/login" replace />
}