# Scaffold: Database Migration

## Prompt Template
```
You are my lead developer. Create a new Supabase migration for [MIGRATION_PURPOSE] in the Prompt-Stack database.

Requirements:
1. Create migration file: supabase/migrations/[NUMBER]_[DESCRIPTION].sql
2. Include proper SQL for table creation/modification
3. Add Row Level Security (RLS) policies
4. Include proper foreign key relationships
5. Add any necessary indexes for performance
6. Include rollback instructions in comments

Migration should include:
- CREATE TABLE statements with proper column types
- UUID primary keys and foreign key constraints
- NOT NULL constraints where appropriate
- Default values (timestamps, UUIDs)
- RLS policies for user data access
- Proper indexes on commonly queried columns
- Grant statements for necessary permissions

Follow these patterns:
- Use snake_case for table and column names
- Always enable RLS: ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
- User-scoped data: Policy that checks auth.uid() = user_id
- Admin access: Policy that checks user role from profiles table
- Timestamps: created_at and updated_at with NOW() defaults
- UUIDs: Use uuid_generate_v4() for primary keys

Include a comment at the top explaining the migration purpose and any dependencies.
```

## Variables to Replace
- `[MIGRATION_PURPOSE]`: Description of what the migration does (e.g., "add user preferences table")
- `[NUMBER]`: Next migration number (check existing files)
- `[DESCRIPTION]`: Snake_case description for filename

## Example Usage
"Create a new Supabase migration for adding user preferences table..."

## Files That Will Be Created
- `supabase/migrations/[NUMBER]_[DESCRIPTION].sql`

## Common Patterns

### Basic Table with RLS
```sql
-- Create table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own preferences" 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Permissions
GRANT ALL ON TABLE user_preferences TO authenticated;
```

## Testing
After creating migration:
1. Run migration in Supabase SQL Editor
2. Verify table appears in Table Editor
3. Test RLS policies work correctly
4. Check foreign key constraints
5. Verify indexes are created
6. Test with sample data