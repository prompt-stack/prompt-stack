import React from 'react'
import { Alert } from './alert'

interface ConfigurationAlertProps {
  type: 'supabase' | 'api' | 'cors'
  environment?: string
}

export function ConfigurationAlert({ type, environment = 'production' }: ConfigurationAlertProps) {
  const messages = {
    supabase: {
      title: 'Supabase Configuration Missing',
      message: 'Authentication is not properly configured. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment variables.',
      fix: environment === 'production' 
        ? 'Set these variables in your deployment platform (Vercel, Railway, etc.)' 
        : 'Add them to frontend/.env.local and restart your dev server'
    },
    api: {
      title: 'API Connection Failed',
      message: 'Cannot connect to the backend API. The API URL may be incorrect or the backend may not be running.',
      fix: environment === 'production'
        ? 'Verify NEXT_PUBLIC_API_URL is set correctly in your deployment platform'
        : 'Ensure the backend is running (make dev-backend) and NEXT_PUBLIC_API_URL is set in frontend/.env.local'
    },
    cors: {
      title: 'CORS Configuration Error',
      message: 'The backend is rejecting requests from this frontend URL due to CORS policy.',
      fix: environment === 'production'
        ? 'Update CORS_ORIGINS in your backend deployment to include your frontend URL (no brackets!)'
        : 'Check that CORS_ORIGINS in backend/.env includes http://localhost:3000'
    }
  }

  const config = messages[type]

  return (
    <Alert variant="destructive" className="mb-4">
      <div>
        <h3 className="font-semibold">{config.title}</h3>
        <p className="text-sm mt-1">{config.message}</p>
        <p className="text-sm mt-2 font-medium">Fix: {config.fix}</p>
      </div>
    </Alert>
  )
}