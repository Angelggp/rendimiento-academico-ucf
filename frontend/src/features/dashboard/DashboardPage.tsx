import { Link } from "react-router-dom"
import { ChevronRight, GraduationCap, TriangleAlert } from "lucide-react"
import { useAuth } from "@/features/auth/use-auth"
import { navPorRol } from "@/config/nav"
import { useEstudiantes } from "@/features/estudiantes/use-estudiantes"
import { useEvaluaciones } from "@/features/reportes/use-reportes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const MENSAJES: Record<string, string> = {
  ADMIN: "Gestión de usuarios y catálogo de asignaturas.",
  VICEDECANO: "Gestión de carreras, estudiantes y profesores.",
  PROFESOR: "Registro y actualización de evaluaciones de sus asignaturas.",
  ESTUDIANTE: "Consulta de sus evaluaciones y perfil académico.",
}

function TarjetaEstadistica({
  titulo,
  valor,
  icono: Icono,
  acento,
}: {
  titulo: string
  valor: number | undefined
  icono: React.ComponentType<{ className?: string }>
  acento?: "warning"
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div
          className={
            acento === "warning"
              ? "flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600"
              : "bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md"
          }
        >
          <Icono className="size-5" />
        </div>
        <div>
          <p className="text-3xl font-semibold">{valor ?? "—"}</p>
          <p className="text-muted-foreground text-sm">{titulo}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { usuario } = useAuth()
  const estudiantes = useEstudiantes({ enabled: usuario?.rol === "VICEDECANO" })
  const pendientes = useEvaluaciones(
    usuario?.rol === "VICEDECANO" ? { estado: "PENDIENTE" } : undefined,
    { enabled: usuario?.rol === "VICEDECANO" },
  )

  if (!usuario) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">
          ¡Hola, {usuario.nombre} {usuario.apellidos}!
        </h2>
        <p className="text-muted-foreground">{MENSAJES[usuario.rol]}</p>
      </div>

      {usuario.rol === "VICEDECANO" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TarjetaEstadistica
            titulo="Estudiantes"
            valor={estudiantes.data?.length}
            icono={GraduationCap}
          />
          <TarjetaEstadistica
            titulo="Evaluaciones pendientes"
            valor={pendientes.data?.length}
            icono={TriangleAlert}
            acento="warning"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navPorRol(usuario.rol)
          .filter((item) => item.titulo !== "Inicio")
          .map((item) => {
            const Icono = item.icono
            return (
              <Link key={item.href} to={item.href} className="group">
                <Card className="border-l-primary border-l-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Icono className="size-5 text-primary" />
                    <ChevronRight className="text-muted-foreground size-4" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base">{item.titulo}</CardTitle>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
      </div>
    </div>
  )
}