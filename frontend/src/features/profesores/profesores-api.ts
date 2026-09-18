import { api } from "@/lib/api"
import type { ProfesorDetallado } from "@/types/api"

export async function listarProfesores(): Promise<ProfesorDetallado[]> {
  return api.get<ProfesorDetallado[]>("/profesores")
}