const TOKEN_KEY = "ucf_token"

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function guardarToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}