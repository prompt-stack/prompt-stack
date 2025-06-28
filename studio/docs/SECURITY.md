# Security Guide (1-1000 Users)

> **TL;DR**: You're already secure enough to ship. This guide shows what you have and when to add more.

> **⚠️ Stop here if:** No minors, no payments, no regulated data.  
> **→ Jump to [ENTERPRISE_SECURITY_FUTURE.md](./ENTERPRISE_SECURITY_FUTURE.md) if:** Any one of those = yes.

## 🎉 What You Already Have

### ✅ **Authentication & Authorization**
- JWT tokens with expiration (can't fake login)
- Supabase RLS policies (users can't see each other's data)
- Role-based access control (admins are admins)
- Demo mode for development (safe defaults)

### ✅ **API Protection**
- Rate limiting (30 req/min for AI, 10 for auth)
- CORS configured (only your frontend can call API)
- Security headers (XSS, clickjacking protection)
- Input validation with Pydantic

### ✅ **Data Security**
- HTTPS everywhere (Vercel/Railway handles this)
- Database encryption at rest (Supabase does this)
- Secure password hashing (bcrypt)
- Environment variables for secrets

## 🚀 One-Hour Security Checklist

Before launching to your first users:

```bash
# 1. Set secure demo secret (5 minutes)
export DEMO_JWT_SECRET=$(openssl rand -base64 32)

# 2. Enable 2FA for admin accounts (10 minutes)
# Supabase → Auth → Add MFA → TOTP → Require for `admin` role
# Docs: https://supabase.com/docs/guides/auth/auth-mfa

# 3. Test RLS is working (10 minutes)
# - Create two users
# - Verify user A can't see user B's data
# - Verify admin can see both

# 4. Test rate limiting (5 minutes)
for i in {1..50}; do curl http://localhost:8000/api/health; done
# Should see 429 errors after 30 requests

# 5. Check no hardcoded secrets (5 minutes)
grep -rE "(sk-|pk_|AKIA|AIza|firebase|stripe_|secret)" \
  --include="*.py" --include="*.ts" --include="*.tsx" --include="*.jsx" --include="*.sh" \
  --include="*.env*" --exclude-dir=node_modules .

# 6. Add privacy page (10 minutes) - See template below

# 7. Enable GitHub Dependabot (5 minutes)
# GitHub → Settings → Security → Enable Dependabot
# Auto-merge only patch & minor updates to avoid breaks
```

**Total: 45-60 min—the same time you'd spend fixing a data-breach tweet.**

### 📄 Copy-Paste Privacy Policy

Create `privacy.md` or add to your site:

```markdown
## Privacy Policy

### What data we collect
Email, hashed password, app usage metrics.

### Why we collect it
Auth, bug-fixing, feature analytics.

### How to delete your data
Email privacy@yourapp.com with subject "Delete."

### Contact
privacy@yourapp.com
```

**That's it. Ship it! ✅**

## 📈 Security Roadmap by User Count

### **1-100 Users: Just Don't Get Hacked**
What you have is enough:
- ✅ Basic auth works
- ✅ Users isolated by RLS
- ✅ Rate limiting prevents abuse

### **100-500 Users: Stay Responsible**
Add when convenient:
- [ ] Basic logging of failed logins
- [ ] Backup your database weekly + automate restore test
- [ ] Monitor for suspicious patterns
- [ ] Set up quarterly key rotation reminder

### **500-1000 Users: Prepare to Scale**
Start thinking about:
- [ ] Adding Sentry for error tracking
- [ ] Setting up alerts for rate limit hits
- [ ] Planning for Redis rate limiting

### **1000+ Users: Time to Get Serious**
Read `ENTERPRISE_SECURITY_FUTURE.md` and implement:
- [ ] Redis for distributed rate limiting
- [ ] Comprehensive audit logging
- [ ] External secrets management
- [ ] Security monitoring dashboard

## 🚨 Common Security Mistakes to Avoid

### ❌ **DON'T**
- Store API keys in your repo (use .env files)
- Log sensitive data (passwords, tokens, keys)
- Trust user input without validation
- Use `demo mode` in production
- Disable RLS "just for testing"

### ✅ **DO**
- Keep dependencies updated monthly
- Use strong passwords for admin accounts
- Test that RLS policies work
- Monitor your error logs
- Back up your database

## 🔍 Quick Security Checks

### **Is my data secure?**
```sql
-- Run in Supabase SQL editor
-- Should return TRUE
SELECT EXISTS (
  SELECT 1 FROM pg_policies 
  WHERE tablename = 'profiles'
);
```

### **Is rate limiting working?**
```bash
# Should get 429 after many requests
for i in {1..100}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/health
done | grep 429
```

### **Are my secrets safe?**
```bash
# Should return nothing
git grep -E "(api_key|secret|password)" --exclude=*.md
```

## 💰 Security Budget Guide

### **0-100 users: $0/month**
- Use free tiers everywhere
- Your current setup is perfect

### **100-500 users: $0-20/month**
- Maybe add Sentry ($0-20)
- Everything else stays free

### **500-1000 users: $20-50/month**
- Redis for rate limiting ($20)
- Better monitoring ($20)
- Still very affordable

### **1000+ users: $50-200/month**
- Now read `ENTERPRISE_SECURITY_FUTURE.md`
- You can afford it with 1000 users

## 🎯 When to Read ENTERPRISE_SECURITY_FUTURE.md

You should upgrade to enterprise security when:

1. **You get your first enterprise customer** (they'll ask about SOC2)
2. **You handle sensitive data** (health, financial records)
3. **You hit 1000+ active users** (worth protecting properly)
4. **You raise funding** (investors expect it)
5. **Something bad happens** (learn from mistakes)

Until then, **ship features** that users want to pay for.

## 🚦 Security Status Indicators

Your app is secure enough when:
- ✅ Users can't access each other's data
- ✅ API can't be spammed to death
- ✅ Passwords are hashed, not plain text
- ✅ No secrets in your git history
- ✅ HTTPS is always on

**You already have all of these! ✅**

## 🔄 Automated Backup Health Check

Add to your cron/scheduled tasks:
```bash
#!/bin/bash
# backup-health.sh
pg_dump $DATABASE_URL > backup.sql
pg_restore --list backup.sql > /dev/null
if [ $? -eq 0 ]; then
  curl -fsS --retry 3 https://hc-ping.com/YOUR_UUID
else
  echo "Backup restore test failed!"
  exit 1
fi
```

## 🗓️ Key Rotation Checklist

Create `ROTATE_KEYS.md` for quarterly rotation:
```markdown
## Key Rotation Runbook (Every 90 Days)

1. [ ] Generate new DEMO_JWT_SECRET
2. [ ] Update Supabase service role key
3. [ ] Rotate API provider keys if needed
4. [ ] Deploy new env vars
5. [ ] Test auth still works
6. [ ] Mark complete in calendar

Next rotation due: _____
```

---

**Remember**: Perfect security is the enemy of shipped products. You're secure enough. Go ship! 🚀