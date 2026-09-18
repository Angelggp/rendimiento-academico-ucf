import { useMemo } from "react"
import { Loader2, TriangleAlert } from "lucide-react"
import { useEstudiantes } from "./use-estudiantes"
import { CrearEstudianteDialog } from "./CrearEstudianteDialog"
import { EditarEstudianteDialog } from "./EditarEstudianteDialog"
import { ETIQUETA_MUNICIPIO } from "@/lib/format"
import type { EstudianteDetallado } from "@/types/api"
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

const helper = createAppColumnHelper<EstudianteDetallado>()

const columnas = helper.columns([
  helper.accessor(
    (estudiante) => `${estudiante.usuario.nombre} ${estudiante.usuario.apellidos}`,
    {
      id: "nombre",
      header: "Nombre",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    },
  ),
  helper.accessor("carnetIdentidad", { header: "Carné" }),
  helper.accessor((estudiante) => estudiante.carrera.nombre, {
    id: "carrera",
    header: "Carrera",
    cell: (info) => (
      <span>
        {info.getValue()}{" "}
        <Badge variant="secondary" className="ml-1">
          {info.row.original.carrera.plan}
        </Badge>
      </span>
    ),
  }),
  helper.accessor((estudiante) => ETIQUETA_MUNICIPIO[estudiante.municipio], {
    id: "municipio",
    header: "Municipio",
  }),
  helper.accessor((estudiante) => estudiante.usuario.email, {
    id: "correo",
    header: "Correo",
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  helper.display({
    id: "acciones",
    header: "Acciones",
    cell: (info) => (
      <div className="flex justify-end">
        <EditarEstudianteDialog estudiante={info.row.original} />
      </div>
    ),
  }),
])

const SIN_DATOS: EstudianteDetallado[] = []

export function EstudiantesPage() {
  const { data: estudiantes, isLoading, isError, error } = useEstudiantes()

  const table = useAppTable({
    data: estudiantes ?? SIN_DATOS,
    columns: useMemo(() => columnas, []),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Estudiantes de la facultad con su carrera y municipio.
        </p>
        <CrearEstudianteDialog />
      </div>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar los estudiantes: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estudiantes</CardTitle>
          <CardDescription>{estudiantes?.length ?? 0} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              table={table}
              searchPlaceholder="Buscar por nombre, carné, carrera…"
              emptyMessage="No hay estudiantes registrados."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
