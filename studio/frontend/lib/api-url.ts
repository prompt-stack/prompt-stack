/**
 * Get the API URL from environment variable
 * This centralizes API URL configuration to avoid hardcoding
 */
export function getApiUrl(): string {
  // In browser, use the public env var
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }
  
  // On server, we can use either public or private env var
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000'
}

/**
 * Get the full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl()
  // Remove trailing slash from base URL to avoid double slashes
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBaseUrl}${normalizedPath}`
}