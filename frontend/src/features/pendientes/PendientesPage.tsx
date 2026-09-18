import { useMemo, useState } from "react"
import { Loader2, TriangleAlert } from "lucide-react"
import { useEvaluaciones } from "@/features/reportes/use-reportes"
import { columnasEvaluaciones } from "@/features/reportes/evaluaciones-columns"
import { useAsignaturas } from "@/features/asignaturas/use-asignaturas"
import { useProfesores } from "@/features/profesores/use-profesores"
import { ETIQUETA_MUNICIPIO } from "@/lib/format"
import { MUNICIPIOS, type FiltrosEvaluaciones, type Municipio } from "@/types/api"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable, useAppTable } from "@/components/ui/data-table"

export function PendientesPage() {
  const [filtros, setFiltros] = useState<Omit<FiltrosEvaluaciones, "estado">>({})
  const asignaturas = useAsignaturas()
  const profesores = useProfesores()
  const { data: pendientes, isLoading, isError, error } = useEvaluaciones({
    ...filtros,
    estado: "PENDIENTE",
  })

  const table = useAppTable({
    data: pendientes ?? [],
    columns: useMemo(() => columnasEvaluaciones, []),
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Estudiantes con evaluaciones pendientes (sin calificación o calificación menor a 3).
      </p>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filtro-asignatura">Asignatura</Label>
            <Select
              id="filtro-asignatura"
              value={filtros.asignaturaId ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, asignaturaId: e.target.value || undefined }))
              }
            >
              <option value="">Todas</option>
              {asignaturas.data?.map((asignatura) => (
                <option key={asignatura.id} value={asignatura.id}>
                  {asignatura.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filtro-profesor">Profesor</Label>
            <Select
              id="filtro-profesor"
              value={filtros.profesorId ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, profesorId: e.target.value || undefined }))
              }
            >
              <option value="">Todos</option>
              {profesores.data?.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.usuario.nombre} {profesor.usuario.apellidos}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filtro-municipio">Municipio</Label>
            <Select
              id="filtro-municipio"
              value={filtros.municipio ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  municipio: (e.target.value || undefined) as Municipio | undefined,
                }))
              }
            >
              <option value="">Todos</option>
              {MUNICIPIOS.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {ETIQUETA_MUNICIPIO[municipio]}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar los pendientes: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
          <CardDescription>{pendientes?.length ?? 0} evaluaciones pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              table={table}
              searchPlaceholder="Buscar por estudiante, carné…"
              emptyMessage="No hay evaluaciones pendientes."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
