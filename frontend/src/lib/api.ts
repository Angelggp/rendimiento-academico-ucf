const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

let authToken: string | null = null
let onUnauthorizedHandler: ((token: string | null) => void) | null = null

export function setApiToken(token: string | null) {
  authToken = token
}

export function registrarHandler401(handler: (token: string | null) => void) {
  onUnauthorizedHandler = handler
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }
  const tokenUsado = authToken
  if (tokenUsado) {
    headers.set("Authorization", `Bearer ${tokenUsado}`)
  }

  const respuesta = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!respuesta.ok) {
    if (respuesta.status === 401 && onUnauthorizedHandler) {
      onUnauthorizedHandler(tokenUsado)
    }

    let mensaje = `Error ${respuesta.status}`
    try {
      const datos = (await respuesta.json()) as { message?: unknown; error?: string }
      if (typeof datos.message === "string") mensaje = datos.message
      else if (Array.isArray(datos.message)) mensaje = datos.message.join(", ")
      if (datos.error) mensaje = `${datos.error}: ${mensaje}`
    } catch {
      // Sin cuerpo JSON
    }
    throw new ApiError(respuesta.status, mensaje)
  }

  if (respuesta.status === 204) {
    return undefined as T
  }

  return (await respuesta.json()) as Promise<T>
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
}