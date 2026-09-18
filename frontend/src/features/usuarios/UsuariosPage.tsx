import { Loader2, TriangleAlert } from "lucide-react"
import { useActualizarUsuario, useUsuarios } from "./use-usuarios"
import { CrearUsuarioDialog } from "./CrearUsuarioDialog"
import { EditarUsuarioDialog } from "./EditarUsuarioDialog"
import { useAuth } from "@/features/auth/use-auth"
import type { Rol, Usuario } from "@/types/api"
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

const VARIANTE_ROL: Record<Rol, "default" | "secondary" | "outline" | "success"> = {
  ADMIN: "default",
  VICEDECANO: "secondary",
  PROFESOR: "outline",
  ESTUDIANTE: "success",
}

export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error } = useUsuarios()
  const actualizar = useActualizarUsuario()
  const { usuario: yo } = useAuth()

  const alternarEstado = (usuario: Usuario) => {
    actualizar.mutate({
      id: usuario.id,
      payload: { activo: !usuario.activo },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Registro de accesos y roles de los usuarios del sistema.
        </p>
        <CrearUsuarioDialog />
      </div>

      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
          <TriangleAlert className="size-4" />
          No se pudieron cargar los usuarios: {String(error?.message ?? error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>{usuarios?.length ?? 0} registros</CardDescription>
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
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios?.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.nombre} {usuario.apellidos}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={VARIANTE_ROL[usuario.rol]}>
                        {usuario.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.activo ? "success" : "destructive"}>
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {usuario.telefono ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditarUsuarioDialog
                          usuario={usuario}
                          esPropio={usuario.id === yo?.id}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alternarEstado(usuario)}
                          disabled={actualizar.isPending || usuario.id === yo?.id}
                        >
                          {usuario.activo ? "Deshabilitar" : "Habilitar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {usuarios?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No hay usuarios registrados.
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