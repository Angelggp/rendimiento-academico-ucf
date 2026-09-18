import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { GraduationCap, Loader2 } from "lucide-react"
import { useAuth } from "./use-auth"
import { homePorRol } from "@/config/nav"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PantallaDeCarga } from "./RequireAuth"

const esquemaLogin = z.object({
  email: z.string().email({ message: "El correo electrónico no es válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

type DatosLogin = z.infer<typeof esquemaLogin>

export function LoginPage() {
  const { usuario, cargando, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: "", password: "" },
  })

  const iniciarSesionMutation = useMutation({
    mutationFn: iniciarSesion,
    onSuccess: (u) => {
      const origen = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname
      navigate(origen ?? homePorRol(u.rol), { replace: true })
    },
  })

  if (cargando) {
    return <PantallaDeCarga />
  }

  if (usuario) {
    return <Navigate to={homePorRol(usuario.rol)} replace />
  }

  const errorServidor =
    iniciarSesionMutation.error instanceof ApiError
      ? iniciarSesionMutation.error.message
      : iniciarSesionMutation.error
        ? "No se pudo iniciar sesión. Inténtelo de nuevo."
        : null

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <GraduationCap className="size-10 text-primary" />
          <CardTitle className="text-xl">Rendimiento Académico UCF</CardTitle>
          <CardDescription>
            Facultad de Ingeniería. Inicie sesión para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((datos) =>
              iniciarSesionMutation.mutate(datos),
            )}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@ucf.edu.cu"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errorServidor && (
              <p className="text-destructive rounded-md border bg-destructive/5 p-2 text-sm">
                {errorServidor}
              </p>
            )}

            <Button
              type="submit"
              disabled={iniciarSesionMutation.isPending}
              className="w-full"
            >
              {iniciarSesionMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}