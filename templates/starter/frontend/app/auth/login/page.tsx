'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement authentication
    console.log('Login attempt:', { email, password })
    alert('Authentication not implemented yet. Get the full codebase for complete auth!')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-sm text-center">
            <strong>Note:</strong> This is a basic starter template. 
            For complete authentication with Supabase, magic links, and more,{' '}
            <a 
              href="https://promptstack.com/code" 
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              get the full codebase
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}