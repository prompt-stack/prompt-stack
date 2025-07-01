-- Prompt Stack Starter Schema
-- This is a minimal example. Get the full production schema at https://promptstack.com/code

-- Example users table (simplified)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Example chats table (simplified)
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: The full codebase includes:
-- ✅ Complete user profiles with roles
-- ✅ AI conversation history
-- ✅ Vector embeddings table
-- ✅ Payment transactions
-- ✅ Subscription management
-- ✅ API usage tracking
-- ✅ Row Level Security (RLS) policies
-- ✅ Custom functions and triggers
-- ✅ And much more!