import { Loader2, TriangleAlert } from "lucide-react"
import { useActualizarCarrera, useCarreras } from "./use-carreras"
import { CrearCarreraDialog } from "./CrearCarreraDialog"
import { ETIQUETA_PLAN } from "@/lib/format"
import type { Carrera } from "@/types/api"
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

export function CarrerasPage() {
  const { data: carreras, isLoading, isError, error } = useCarreras()
  const actualizar = useActualizarCarrera()

  const alternarEstado = (carrera: Carrera) => {
    actualizar.mutate({
      id: carrera.id,
      payload: { activo: !carrera.activo },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Carreras y planes de estudio de la facultad.
        </p>
        <CrearCarreraDialog />
      </div>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar las carreras: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Carreras</CardTitle>
          <CardDescription>{carreras?.length ?? 0} registros</CardDescription>
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
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carreras?.map((carrera) => (
                  <TableRow key={carrera.id}>
                    <TableCell className="font-medium">
                      {carrera.nombre}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ETIQUETA_PLAN[carrera.plan]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={carrera.activo ? "success" : "destructive"}>
                        {carrera.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alternarEstado(carrera)}
                        disabled={actualizar.isPending}
                      >
                        {carrera.activo ? "Deshabilitar" : "Habilitar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {carreras?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No hay carreras registradas.
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