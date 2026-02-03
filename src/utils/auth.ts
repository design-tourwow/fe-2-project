// JWT Authentication utilities

export const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token')
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem('jwt_token', token)
}

export const removeAuthToken = (): void => {
  localStorage.removeItem('jwt_token')
}

export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  return token !== null && token !== ''
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export const handleAuthError = (): void => {
  removeAuthToken()
  // Redirect ไปหน้า Dashboard (ไม่มีหน้า login)
  window.location.href = '/'
}