// Simple client-side rate limiter for email captures
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  canAttempt(key: string, maxAttempts: number = 3, windowMs: number = 60000): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove expired attempts
    const validAttempts = attempts.filter(time => now - time < windowMs)
    
    if (validAttempts.length >= maxAttempts) {
      return false
    }

    // Add this attempt
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    
    return true
  }

  getRemainingTime(key: string, windowMs: number = 60000): number {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    if (attempts.length === 0) return 0
    
    const oldestAttempt = Math.min(...attempts)
    const remainingMs = windowMs - (now - oldestAttempt)
    
    return Math.max(0, Math.ceil(remainingMs / 1000))
  }
}

export const emailRateLimiter = new RateLimiter()