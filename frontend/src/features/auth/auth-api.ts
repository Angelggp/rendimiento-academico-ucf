import { api } from "@/lib/api"
import type {
  LoginRequest,
  LoginResponse,
  Usuario,
  UsuarioPerfil,
} from "@/types/api"

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", payload)
}

export async function obtenerUsuarioActual(): Promise<UsuarioPerfil> {
  return api.get<UsuarioPerfil>("/auth/me")
}

export async function listarUsuarios(): Promise<Usuario[]> {
  return api.get<Usuario[]>("/usuarios")
}