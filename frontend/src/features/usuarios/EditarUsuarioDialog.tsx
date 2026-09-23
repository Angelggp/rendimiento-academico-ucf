import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2, Pencil } from "lucide-react"
import { ApiError } from "@/lib/api"
import { PLACEHOLDER_TELEFONO } from "@/lib/validaciones"
import { ROLES, type Rol, type Usuario } from "@/types/api"
import { useActualizarUsuario } from "./use-usuarios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const esquema = z.object({
  nombre: z.string().min(1, { message: "El nombre es obligatorio" }),
  apellidos: z.string().min(1, { message: "Los apellidos son obligatorios" }),
  email: z.string().email({ message: "El correo electrónico no es válido" }),
  rol: z.enum(ROLES as unknown as readonly [Rol, ...Rol[]], {
    message: "El rol es obligatorio",
  }),
  telefono: z.string().optional(),
})

type DatosFormulario = z.infer<typeof esquema>

interface EditarUsuarioDialogProps {
  usuario: Usuario
  esPropio?: boolean
}

export function EditarUsuarioDialog({
  usuario,
  esPropio = false,
}: EditarUsuarioDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const mutation = useActualizarUsuario()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    values: {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      rol: usuario.rol,
      telefono: usuario.telefono ?? "",
    },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(
      {
        id: usuario.id,
        payload: {
          ...datos,
          telefono: datos.telefono?.trim() ? datos.telefono.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          reset()
          setAbierto(false)
        },
      },
    )
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Actualiza los datos del acceso{" "}
            <span className="font-medium">
              {usuario.nombre} {usuario.apellidos}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} aria-invalid={!!errors.nombre} />
            {errors.nombre && <p className="text-destructive text-sm">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input id="apellidos" {...register("apellidos")} aria-invalid={!!errors.apellidos} />
            {errors.apellidos && <p className="text-destructive text-sm">{errors.apellidos.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rol">Rol</Label>
            <Select id="rol" {...register("rol")} disabled={esPropio}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            {errors.rol && <p className="text-destructive text-sm">{errors.rol.message}</p>}
            {esPropio && (
              <p className="text-muted-foreground text-xs">
                No puedes cambiar tu propio rol.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" placeholder={PLACEHOLDER_TELEFONO} {...register("telefono")} />
          </div>

          {errorServidor && (
            <p className="text-destructive rounded-md border bg-destructive/5 p-2 text-sm">
              {errorServidor}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}