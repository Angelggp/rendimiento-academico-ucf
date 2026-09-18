import { api } from "@/lib/api"
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  Usuario,
} from "@/types/api"

export async function listarUsuarios(): Promise<Usuario[]> {
  return api.get<Usuario[]>("/usuarios")
}

export async function crearUsuario(
  payload: CrearUsuarioRequest,
): Promise<Usuario> {
  return api.post<Usuario>("/usuarios", payload)
}

export async function actualizarUsuario(
  id: string,
  payload: ActualizarUsuarioRequest,
): Promise<Usuario> {
  return api.patch<Usuario>(`/usuarios/${id}`, payload)
}