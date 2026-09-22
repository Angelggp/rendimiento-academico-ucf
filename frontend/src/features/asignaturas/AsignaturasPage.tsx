import { Loader2, TriangleAlert } from "lucide-react"
import { useActualizarAsignatura, useAsignaturas } from "./use-asignaturas"
import { CrearAsignaturaDialog } from "./CrearAsignaturaDialog"
import { EditarAsignaturaDialog } from "./EditarAsignaturaDialog"
import type { AsignaturaConCarreras } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AsignaturasPage() {
  const { data: asignaturas, isLoading, isError, error } = useAsignaturas()
  const actualizar = useActualizarAsignatura()

  const alternarEstado = (asignatura: AsignaturaConCarreras) => {
    actualizar.mutate({
      id: asignatura.id,
      payload: { activo: !asignatura.activo },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Catálogo de asignaturas del plan de estudios con su profesor encargado.
        </p>
        <CrearAsignaturaDialog />
      </div>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar las asignaturas: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asignaturas</CardTitle>
          <CardDescription>{asignaturas?.length ?? 0} registros</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Carreras</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaturas?.map((asignatura) => (
                  <TableRow key={asignatura.id}>
                    <TableCell className="font-medium">
                      {asignatura.nombre}
                    </TableCell>
                    <TableCell>{asignatura.semestre}</TableCell>
                    <TableCell className="whitespace-normal">
                      {asignatura.profesor.usuario.nombre}{" "}
                      {asignatura.profesor.usuario.apellidos}
                    </TableCell>
                    <TableCell className="max-w-52 whitespace-normal">
                      <span className="flex flex-wrap gap-1">
                        {asignatura.carreras.length > 0 ? (
                          asignatura.carreras.map((carrera) => (
                            <Badge key={carrera.id} variant="outline">
                              {carrera.nombre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Sin carrera</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={asignatura.activo ? "success" : "destructive"}>
                        {asignatura.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditarAsignaturaDialog asignatura={asignatura} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alternarEstado(asignatura)}
                          disabled={actualizar.isPending}
                        >
                          {asignatura.activo ? "Deshabilitar" : "Habilitar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {asignaturas?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No hay asignaturas registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}