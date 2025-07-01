'use client'

import { useState } from 'react'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: 'Hello! I'm your AI assistant. How can I help you today?' }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setMessage('')

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'This is a demo response. To connect to real AI providers (OpenAI, Anthropic, etc.), get the full codebase!' 
      }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-100 dark:bg-blue-900 ml-auto max-w-[80%]' 
                : 'bg-gray-100 dark:bg-gray-800 mr-auto max-w-[80%]'
            }`}
          >
            <p className="font-semibold mb-1">
              {msg.role === 'user' ? 'You' : 'AI Assistant'}
            </p>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          Want real AI integration?{' '}
          <a 
            href="https://promptstack.com/code" 
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get the full codebase
          </a>{' '}
          with OpenAI, Anthropic, Gemini, and DeepSeek support!
        </p>
      </div>
    </div>
  )
}