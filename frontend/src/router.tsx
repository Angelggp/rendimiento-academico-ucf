import { createBrowserRouter } from "react-router-dom"
import type { ReactNode } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginRedirect, RutaNoEncontrada } from "@/components/layout/Redirects"
import { LoginPage } from "@/features/auth/LoginPage"
import { RequireAuth } from "@/features/auth/RequireAuth"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { UsuariosPage } from "@/features/usuarios/UsuariosPage"
import { AsignaturasPage } from "@/features/asignaturas/AsignaturasPage"
import { CarrerasPage } from "@/features/carreras/CarrerasPage"
import { EstudiantesPage } from "@/features/estudiantes/EstudiantesPage"
import { ProfesoresPage } from "@/features/profesores/ProfesoresPage"
import { PendientesPage } from "@/features/pendientes/PendientesPage"
import { ReportesPage } from "@/features/reportes/ReportesPage"
import { MisAsignaturasPage } from "@/features/profesor/MisAsignaturasPage"
import { EvaluacionesAsignaturaPage } from "@/features/profesor/EvaluacionesAsignaturaPage"
import { PerfilEstudiantePage } from "@/features/estudiante/PerfilEstudiantePage"
import type { Rol } from "@/types/api"

function conRol(roles: Rol[], elemento: ReactNode) {
  return <RequireAuth roles={roles}>{elemento}</RequireAuth>
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <LoginRedirect /> },
      { path: "/admin", element: conRol(["ADMIN"], <DashboardPage />) },
      {
        path: "/admin/usuarios",
        element: conRol(["ADMIN"], <UsuariosPage />),
      },
      {
        path: "/admin/asignaturas",
        element: conRol(["ADMIN"], <AsignaturasPage />),
      },
      { path: "/vicedecana", element: conRol(["VICEDECANO"], <DashboardPage />) },
      {
        path: "/vicedecana/carreras",
        element: conRol(["VICEDECANO"], <CarrerasPage />),
      },
      {
        path: "/vicedecana/estudiantes",
        element: conRol(["VICEDECANO"], <EstudiantesPage />),
      },
      {
        path: "/vicedecana/profesores",
        element: conRol(["VICEDECANO"], <ProfesoresPage />),
      },
      {
        path: "/vicedecana/pendientes",
        element: conRol(["VICEDECANO"], <PendientesPage />),
      },
      {
        path: "/vicedecana/reportes",
        element: conRol(["VICEDECANO"], <ReportesPage />),
      },
      { path: "/profesor", element: conRol(["PROFESOR"], <DashboardPage />) },
      {
        path: "/profesor/asignaturas",
        element: conRol(["PROFESOR"], <MisAsignaturasPage />),
      },
      {
        path: "/profesor/asignaturas/:asignaturaId",
        element: conRol(["PROFESOR"], <EvaluacionesAsignaturaPage />),
      },
      { path: "/estudiante", element: conRol(["ESTUDIANTE"], <DashboardPage />) },
      {
        path: "/estudiante/perfil",
        element: conRol(["ESTUDIANTE"], <PerfilEstudiantePage />),
      },
    ],
  },
  { path: "*", element: <RutaNoEncontrada /> },
])