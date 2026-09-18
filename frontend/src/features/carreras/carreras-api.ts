import { api } from "@/lib/api"
import type {
  ActualizarCarreraRequest,
  Carrera,
  CrearCarreraRequest,
} from "@/types/api"

export async function listarCarreras(): Promise<Carrera[]> {
  return api.get<Carrera[]>("/carreras")
}

export async function crearCarrera(
  payload: CrearCarreraRequest,
): Promise<Carrera> {
  return api.post<Carrera>("/carreras", payload)
}

export async function actualizarCarrera(
  id: string,
  payload: ActualizarCarreraRequest,
): Promise<Carrera> {
  return api.patch<Carrera>(`/carreras/${id}`, payload)
}