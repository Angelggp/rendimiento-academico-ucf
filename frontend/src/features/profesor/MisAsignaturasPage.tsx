import { Link } from "react-router-dom"
import { ClipboardList, Loader2, TriangleAlert } from "lucide-react"
import { useAuth } from "@/features/auth/use-auth"
import { useMisAsignaturas } from "./use-profesor"
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

export function MisAsignaturasPage() {
  const { usuario } = useAuth()
  const { data: asignaturas, isLoading, isError, error } = useMisAsignaturas()

  if (!usuario?.profesor) {
    return (
      <div className="text-muted-foreground flex flex-col gap-2 rounded-md border bg-muted/40 p-4 text-sm">
        Aún no tienes perfil de profesor configurado. Contacta con la vicedecana
        para que lo habiliten.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Selecciona una asignatura para registrar las evaluaciones de sus
        estudiantes.
      </p>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar las asignaturas: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mis asignaturas</CardTitle>
          <CardDescription>{asignaturas?.length ?? 0} asignaturas</CardDescription>
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
                  <TableHead>Asignatura</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Evaluaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaturas?.map((asignatura) => (
                  <TableRow key={asignatura.id}>
                    <TableCell className="font-medium">
                      {asignatura.nombre}
                    </TableCell>
                    <TableCell>{asignatura.semestre}</TableCell>
                    <TableCell>
                      <Badge variant={asignatura.activo ? "default" : "secondary"}>
                        {asignatura.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        size="sm"
                        variant={asignatura.activo ? "outline" : "secondary"}
                        disabled={!asignatura.activo}
                      >
                        <Link to={`/profesor/asignaturas/${asignatura.id}`}>
                          <ClipboardList />
                          Registrar notas
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {asignaturas?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-8 text-center"
                    >
                      Todavía no tienes asignaturas asignadas.
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