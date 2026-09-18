import * as React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./use-auth"
import { homePorRol } from "@/config/nav"
import type { Rol } from "@/types/api"
import { Loader2 } from "lucide-react"

export function PantallaDeCarga() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Rol[]
  children: React.ReactNode
}) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return <PantallaDeCarga />
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={homePorRol(usuario.rol)} replace />
  }

  return <>{children}</>
}