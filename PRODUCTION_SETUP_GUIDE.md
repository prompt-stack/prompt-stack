# Production Setup Guide

> **The definitive workflow for setting up Prompt-Stack with Supabase + LLM integration**
> 
> ⏱️ **Total Time**: 4-5 minutes from zero to production-ready full-stack app

## 🎯 The Golden Path

This workflow has been battle-tested and ensures zero configuration issues.

### 🚀 Phase 1: Demo Setup (~13 seconds)

```bash
./setup.sh
```

**Expected Results:**
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:8000
- ✅ Demo mode working perfectly

### 🔑 Phase 2: Supabase Integration (~2-3 minutes)

**Step 1: Add Supabase Keys**
```bash
# Edit backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Edit frontend/.env.local  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Step 2: Run Database Migrations**
- Go to Supabase Dashboard → SQL Editor
- Run the migration from `supabase/migrations/all_migrations_combined.sql`
- This creates profiles table, RLS policies, and first-user-admin logic

**Step 3: Full Docker Restart**
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

**Step 4: Create Your Account**
1. Go to http://localhost:3000/auth/register
2. Register with your email
3. Confirm email in inbox
4. Log in
5. ✅ **You should see admin status** (first user becomes admin)

### 🤖 Phase 3: LLM Integration (~1 minute)

**Step 1: Add LLM API Key**
```bash
# Edit backend/.env - choose one:
DEEPSEEK_API_KEY=sk-...      # Cheapest: $0.14/M tokens
OPENAI_API_KEY=sk-...        # GPT-4, o3
ANTHROPIC_API_KEY=sk-...     # Claude
GEMINI_API_KEY=...           # Google
```

**Step 2: Full Docker Restart**
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

**Step 3: Refresh Authentication** ⚠️ **CRITICAL**
1. **Log out** of the application
2. **Log back in**
3. This refreshes your auth tokens to include new service access

**Step 4: Test AI Features**
- Go to http://localhost:3000/test-ai
- Try generating text with your chosen provider
- ✅ **Real AI responses instead of demo**

## ⚠️ Critical Order Requirements

### ✅ **Must Do In This Order:**
1. **Migrations BEFORE creating users** - or users won't get profiles
2. **Docker restart after .env changes** - services need to reload config
3. **Logout/login after adding services** - auth tokens need refresh

### ❌ **Common Mistakes:**
- Creating user before running migrations → No profile/admin status
- Forgetting Docker restart → Changes not applied
- Not refreshing auth tokens → New services not accessible

## 🚨 Troubleshooting

**"Sign in failed: {}" Error:**
- Database migrations not run → Run migrations first
- Created user before migrations → Delete user and recreate

**AI not working after adding keys:**
- Didn't restart Docker → Full restart required
- Didn't refresh auth → Logout/login required

**Not showing as admin:**
- Created user before migrations → User was created without profile
- Check Supabase profiles table for role assignment

## ⏱️ Expected Timing

- **Phase 1**: 13 seconds
- **Phase 2**: 2-3 minutes (including migration + user creation)
- **Phase 3**: 1 minute
- **Total**: 4-5 minutes to production-ready app

## 🎯 Success Criteria

After completing all phases you should have:

✅ **Authentication**: Real Supabase users with admin role  
✅ **Database**: PostgreSQL with Row Level Security  
✅ **AI Integration**: Working LLM provider (not demo)  
✅ **Admin Access**: Full admin dashboard functionality  
✅ **API Documentation**: http://localhost:8000/docs  

---

**🚀 You now have a production-ready full-stack application with authentication, database, and AI capabilities!**