import { useQuery } from "@tanstack/react-query"
import { listarProfesores } from "./profesores-api"

export const CLAVE_PROFESORES = ["profesores"]

export function useProfesores() {
  return useQuery({
    queryKey: CLAVE_PROFESORES,
    queryFn: listarProfesores,
    staleTime: 60_000,
  })
}