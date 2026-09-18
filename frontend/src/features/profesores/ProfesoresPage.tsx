import { useMemo } from "react"
import { Loader2, TriangleAlert } from "lucide-react"
import { useProfesores } from "./use-profesores"
import type { ProfesorDetallado } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  createAppColumnHelper,
  DataTable,
  useAppTable,
} from "@/components/ui/data-table"

const helper = createAppColumnHelper<ProfesorDetallado>()

const columnas = helper.columns([
  helper.accessor(
    (profesor) => `${profesor.usuario.nombre} ${profesor.usuario.apellidos}`,
    {
      id: "nombre",
      header: "Nombre",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    },
  ),
  helper.accessor((profesor) => profesor.usuario.email, {
    id: "correo",
    header: "Correo",
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  helper.accessor(
    (profesor) => profesor.asignaturas.map((a) => a.nombre).join(", "),
    {
      id: "asignaturas",
      header: "Asignaturas",
      cell: (info) =>
        info.row.original.asignaturas.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {info.row.original.asignaturas.map((asignatura) => (
              <Badge key={asignatura.id} variant="outline">
                {asignatura.nombre}
              </Badge>
            ))}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ),
  helper.display({
    id: "estado",
    header: "Estado",
    cell: (info) => (
      <Badge variant={info.row.original.usuario.activo ? "success" : "destructive"}>
        {info.row.original.usuario.activo ? "Activo" : "Inactivo"}
      </Badge>
    ),
  }),
])

const SIN_DATOS: ProfesorDetallado[] = []

export function ProfesoresPage() {
  const { data: profesores, isLoading, isError, error } = useProfesores()

  const table = useAppTable({
    data: profesores ?? SIN_DATOS,
    columns: useMemo(() => columnas, []),
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Profesores de la facultad y las asignaturas que imparten.
      </p>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar los profesores: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profesores</CardTitle>
          <CardDescription>{profesores?.length ?? 0} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              table={table}
              searchPlaceholder="Buscar por nombre, correo, asignatura…"
              emptyMessage="No hay profesores registrados."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
