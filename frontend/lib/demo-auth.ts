/**
 * Demo Authentication Module
 * 
 * Provides a mock authentication system for demo mode.
 * Uses localStorage to simulate authentication state.
 */

interface DemoUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

type AuthChangeCallback = (user: DemoUser | null) => void;

class DemoAuth {
  private readonly STORAGE_KEY = 'demo_auth_user';
  private listeners: AuthChangeCallback[] = [];

  /**
   * Check if running in demo mode
   */
  isDemoMode(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return !supabaseUrl || !supabaseKey || supabaseUrl === 'https://example.supabase.co';
  }

  /**
   * Get current demo user from localStorage
   */
  getUser(): DemoUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error reading demo user from localStorage:', error);
      return null;
    }
  }

  /**
   * Set demo user in localStorage and notify listeners
   */
  private setUser(user: DemoUser | null): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      
      // Notify all listeners
      this.listeners.forEach(callback => callback(user));
    } catch (error) {
      console.error('Error saving demo user to localStorage:', error);
    }
  }

  /**
   * Demo sign in - accepts any email/password
   */
  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create demo user
      const demoUser: DemoUser = {
        id: `demo-${Date.now()}`,
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        user_metadata: {
          full_name: email.split('@')[0],
        }
      };
      
      this.setUser(demoUser);
      
      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Demo sign in failed') 
      };
    }
  }

  /**
   * Demo sign up - accepts any email/password
   */
  async signUp(email: string, password: string): Promise<{ error: Error | null }> {
    // In demo mode, sign up works the same as sign in
    return this.signIn(email, password);
  }

  /**
   * Demo sign out
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.setUser(null);
      
      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Demo sign out failed') 
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: AuthChangeCallback): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}

// Export singleton instance
export const demoAuth = new DemoAuth();