import * as React from "react"
import { registrarHandler401, setApiToken } from "@/lib/api"
import { obtenerUsuarioActual, login as iniciarSesionRequest } from "./auth-api"
import { AuthContext } from "./auth-context"
import { guardarToken, obtenerToken } from "./auth-storage"
import type { LoginRequest, UsuarioPerfil } from "@/types/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<UsuarioPerfil | null>(null)
  const [cargando, setCargando] = React.useState(true)

  React.useEffect(() => {
    const inicializar = async () => {
      const token = obtenerToken()
      if (!token) {
        setCargando(false)
        return
      }
      setApiToken(token)
      try {
        setUsuario(await obtenerUsuarioActual())
      } catch {
        guardarToken(null)
        setApiToken(null)
      } finally {
        setCargando(false)
      }
    }
    void inicializar()
  }, [])

  React.useEffect(() => {
    registrarHandler401((tokenQueFalló) => {
      if (tokenQueFalló && tokenQueFalló !== obtenerToken()) {
        return
      }
      guardarToken(null)
      setApiToken(null)
      setUsuario(null)
    })
    return () => registrarHandler401(() => {})
  }, [])

  const iniciarSesion = React.useCallback(
    async (payload: LoginRequest) => {
      const { access_token, usuario: u } = await iniciarSesionRequest(payload)
      setUsuario(u)
      setApiToken(access_token)
      guardarToken(access_token)
      return u
    },
    [],
  )

  const cerrarSesion = React.useCallback(() => {
    setUsuario(null)
    setApiToken(null)
    guardarToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}