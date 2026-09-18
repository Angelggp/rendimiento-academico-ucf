import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ApiError } from "@/lib/api"
import { ROLES, type Rol } from "@/types/api"
import { useCrearUsuario } from "./use-usuarios"
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
  email: z.string().email({ message: "El correo electrónico no es válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  nombre: z.string().min(1, { message: "El nombre es obligatorio" }),
  apellidos: z.string().min(1, { message: "Los apellidos son obligatorios" }),
  rol: z.enum(ROLES as unknown as readonly [Rol, ...Rol[]], {
    message: "El rol es obligatorio",
  }),
  telefono: z.string().optional(),
})

type DatosFormulario = z.infer<typeof esquema>

export function CrearUsuarioDialog() {
  const [abierto, setAbierto] = useState(false)
  const mutation = useCrearUsuario()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      email: "",
      password: "",
      nombre: "",
      apellidos: "",
      rol: "ESTUDIANTE",
      telefono: "",
    },
  })

  const rolSeleccionado = useWatch({ control, name: "rol" })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(
      { ...datos, telefono: datos.telefono?.trim() ? datos.telefono.trim() : undefined },
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
        <Button>Nuevo usuario</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar usuario</DialogTitle>
          <DialogDescription>
            Crear el acceso y el rol del usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" placeholder="Ana" {...register("nombre")} aria-invalid={!!errors.nombre} />
            {errors.nombre && <p className="text-destructive text-sm">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input id="apellidos" placeholder="Pérez Díaz" {...register("apellidos")} aria-invalid={!!errors.apellidos} />
            {errors.apellidos && <p className="text-destructive text-sm">{errors.apellidos.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="usuario@ucf.edu.cu" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña inicial</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} aria-invalid={!!errors.password} />
            {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rol">Rol</Label>
            <Select id="rol" {...register("rol")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            {errors.rol && <p className="text-destructive text-sm">{errors.rol.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" placeholder="4321 2345" {...register("telefono")} />
          </div>

          {rolSeleccionado !== "ADMIN" && (
            <p className="text-muted-foreground text-xs">
              {rolSeleccionado === "PROFESOR"
                ? "El perfil de profesor se crea automáticamente y podrá asignársele a asignaturas de inmediato."
                : "El usuario deberá completar su perfil al iniciar sesión la primera vez."}
            </p>
          )}

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
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}