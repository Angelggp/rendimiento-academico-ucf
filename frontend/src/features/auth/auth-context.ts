import * as React from "react"
import type { LoginRequest, UsuarioPerfil } from "@/types/api"

export interface AuthContextValue {
  usuario: UsuarioPerfil | null
  cargando: boolean
  iniciarSesion: (payload: LoginRequest) => Promise<UsuarioPerfil>
  cerrarSesion: () => void
}

export const AuthContext = React.createContext<AuthContextValue | null>(null)