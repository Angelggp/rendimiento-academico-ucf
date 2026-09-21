import { useMemo } from "react"
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
  createAppColumnHelper,
  DataTable,
  useAppTable,
} from "@/components/ui/data-table"

const VARIANTE_ROL: Record<Rol, "default" | "secondary" | "outline" | "success"> = {
  ADMIN: "default",
  VICEDECANO: "secondary",
  PROFESOR: "outline",
  ESTUDIANTE: "success",
}

const helper = createAppColumnHelper<Usuario>()
const SIN_DATOS: Usuario[] = []

export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error } = useUsuarios()
  const actualizar = useActualizarUsuario()
  const { usuario: yo } = useAuth()

  const alternarEstado = actualizar.mutate
  const actualizando = actualizar.isPending
  const miId = yo?.id

  const columnas = useMemo(
    () =>
      helper.columns([
        helper.accessor((u) => `${u.nombre} ${u.apellidos}`, {
          id: "nombre",
          header: "Nombre",
          cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),
        helper.accessor("email", { header: "Correo" }),
        helper.accessor("rol", {
          header: "Rol",
          cell: (info) => (
            <Badge variant={VARIANTE_ROL[info.getValue()]}>{info.getValue()}</Badge>
          ),
        }),
        helper.accessor((u) => (u.activo ? "Activo" : "Inactivo"), {
          id: "estado",
          header: "Estado",
          cell: (info) => (
            <Badge variant={info.getValue() === "Activo" ? "success" : "destructive"}>
              {info.getValue()}
            </Badge>
          ),
        }),
        helper.accessor((u) => u.telefono ?? "—", {
          id: "telefono",
          header: "Teléfono",
          cell: (info) => (
            <span className="text-muted-foreground">{info.getValue()}</span>
          ),
        }),
        helper.display({
          id: "acciones",
          header: () => <span className="block text-right">Acciones</span>,
          cell: (info) => {
            const u = info.row.original
            return (
              <div className="flex justify-end gap-2">
                <EditarUsuarioDialog usuario={u} esPropio={u.id === miId} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    alternarEstado({ id: u.id, payload: { activo: !u.activo } })
                  }
                  disabled={actualizando || u.id === miId}
                >
                  {u.activo ? "Deshabilitar" : "Habilitar"}
                </Button>
              </div>
            )
          },
        }),
      ]),
    [alternarEstado, actualizando, miId],
  )

  const table = useAppTable({
    data: usuarios ?? SIN_DATOS,
    columns: columnas,
  })

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
            <DataTable
              table={table}
              searchPlaceholder="Buscar por nombre, correo, rol…"
              emptyMessage="No hay usuarios registrados."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
