import OpenAI from 'openai'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Example usage (not connected to UI)
export async function chatWithAI(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

// Note: The full codebase includes:
// - Multiple AI provider support (Anthropic, Gemini, DeepSeek)
// - Streaming responses
// - Token usage tracking
// - Cost optimization
// - Error handling and retries
// Get the complete implementation at https://promptstack.com/code