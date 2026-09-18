import type { Rol } from "@/types/api"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  UserCircle,
  ClipboardList,
  Building2,
  ListChecks,
  FileBarChart,
} from "lucide-react"

export interface ItemNav {
  titulo: string
  href: string
  icono: React.ComponentType<{ className?: string }>
}

const RUTAS: Record<Rol, ItemNav[]> = {
  ADMIN: [
    { titulo: "Inicio", href: "/admin", icono: LayoutDashboard },
    { titulo: "Usuarios", href: "/admin/usuarios", icono: Users },
    { titulo: "Asignaturas", href: "/admin/asignaturas", icono: BookOpen },
  ],
  VICEDECANO: [
    { titulo: "Inicio", href: "/vicedecana", icono: LayoutDashboard },
    { titulo: "Carreras", href: "/vicedecana/carreras", icono: Building2 },
    { titulo: "Estudiantes", href: "/vicedecana/estudiantes", icono: GraduationCap },
    { titulo: "Profesores", href: "/vicedecana/profesores", icono: Users },
    { titulo: "Pendientes", href: "/vicedecana/pendientes", icono: ListChecks },
    { titulo: "Reportes", href: "/vicedecana/reportes", icono: FileBarChart },
  ],
  PROFESOR: [
    { titulo: "Inicio", href: "/profesor", icono: LayoutDashboard },
    { titulo: "Mis Asignaturas", href: "/profesor/asignaturas", icono: ClipboardList },
  ],
  ESTUDIANTE: [
    { titulo: "Inicio", href: "/estudiante", icono: LayoutDashboard },
    { titulo: "Mi Perfil", href: "/estudiante/perfil", icono: UserCircle },
  ],
}

const HOME: Record<Rol, string> = {
  ADMIN: "/admin",
  VICEDECANO: "/vicedecana",
  PROFESOR: "/profesor",
  ESTUDIANTE: "/estudiante",
}

export function navPorRol(rol: Rol): ItemNav[] {
  return RUTAS[rol] ?? []
}

export function homePorRol(rol: Rol): string {
  return HOME[rol]
}