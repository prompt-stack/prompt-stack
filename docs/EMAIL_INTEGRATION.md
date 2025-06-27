# Email Integration Guide

> **Note**: Email functionality is currently disabled by default. This guide provides the configuration map to add email features when needed.

## 🎯 Email System Architecture

The email system is designed as **modular Lego blocks** - add only what you need:

```
📧 Email System Components
├── 📥 Email Capture (lead generation)
├── 📨 Transactional Emails (auth, notifications)  
├── 📬 Email Marketing (campaigns, newsletters)
└── 🔄 Provider Abstraction (swap providers easily)
```

## 🔧 Quick Setup (Pick Your Provider)

### Resend (Recommended)
```bash
# Backend (.env)
RESEND_API_KEY=re_your_key_here

# Frontend (.env.local)
NEXT_PUBLIC_RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_RESEND_AUDIENCE_ID=your_audience_id
```

### ConvertKit
```bash
# Backend (.env)
CONVERTKIT_API_KEY=your_api_key
CONVERTKIT_API_SECRET=your_api_secret

# Frontend (.env.local)
NEXT_PUBLIC_CONVERTKIT_API_KEY=your_api_key
NEXT_PUBLIC_CONVERTKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_CONVERTKIT_FORM_ID=your_form_id
```

### SendGrid
```bash
# Backend (.env)
SENDGRID_API_KEY=SG.your_key_here

# Frontend (.env.local)
NEXT_PUBLIC_SENDGRID_API_KEY=SG.your_key_here
NEXT_PUBLIC_SENDGRID_LIST_IDS=list1,list2,list3
```

## 📁 File Structure (When Enabled)

```
backend/
├── app/services/email/
│   ├── __init__.py
│   ├── email_service.py      # Main email service
│   ├── providers/
│   │   ├── resend.py         # Resend implementation
│   │   ├── convertkit.py     # ConvertKit implementation
│   │   └── sendgrid.py       # SendGrid implementation
│   └── templates/
│       ├── welcome.html
│       ├── reset_password.html
│       └── notification.html
└── app/api/endpoints/
    └── email.py              # Email API endpoints

frontend/
├── services/email-providers/ # Already exists
├── components/ui/
│   └── EmailCaptureModal.tsx # Already exists
└── services/
    └── email-capture.ts      # Already exists
```

## 🏗️ Implementation Blocks

### Block 1: Email Capture (Lead Generation)
**Purpose**: Capture emails for marketing/updates

**Files to Create**:
```python
# backend/app/api/endpoints/email.py
@router.post("/email/capture")
async def capture_email(email: str, source: str = "website"):
    # Store in database + sync to email provider
    pass
```

**Database Migration**:
```sql
-- Already exists in Supabase migrations
CREATE TABLE email_captures (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email varchar NOT NULL UNIQUE,
  source varchar DEFAULT 'website',
  created_at timestamp DEFAULT now()
);
```

### Block 2: Transactional Emails
**Purpose**: Welcome emails, password resets, notifications

**Files to Create**:
```python
# backend/app/services/email/email_service.py
class EmailService:
    async def send_welcome_email(user_email: str, user_name: str)
    async def send_password_reset(user_email: str, reset_link: str)
    async def send_notification(user_email: str, message: str)
```

**Templates**:
```html
<!-- backend/app/services/email/templates/welcome.html -->
<h1>Welcome to {{app_name}}, {{user_name}}!</h1>
<p>Your account is ready to go.</p>
```

### Block 3: Email Marketing Integration
**Purpose**: Newsletter signup, campaigns

**Integration Points**:
```python
# Auto-sync captured emails to marketing platform
await email_provider.add_to_list(email, tags=["new_user", "ai_template"])
```

## 🔌 Provider Implementations

### Resend Implementation
```python
# backend/app/services/email/providers/resend.py
import resend

class ResendProvider:
    def __init__(self, api_key: str):
        resend.api_key = api_key
    
    async def send_email(self, to: str, subject: str, html: str):
        return resend.Emails.send({
            "from": "noreply@yourdomain.com",
            "to": to,
            "subject": subject,
            "html": html
        })
```

### ConvertKit Implementation
```python
# backend/app/services/email/providers/convertkit.py
class ConvertKitProvider:
    async def add_subscriber(self, email: str, tags: list = None):
        # ConvertKit API integration
        pass
```

## 🚀 Activation Steps

When ready to enable email:

1. **Choose Provider** → Add API keys to `.env` files
2. **Create Service** → Copy provider implementation 
3. **Add Endpoints** → Create `/api/email/*` routes
4. **Enable Frontend** → Uncomment email capture components
5. **Test** → Use `/api/dev/test-email` endpoint

## 🎯 Common Use Cases

### Startup Landing Page
```javascript
// Capture emails for waitlist
await emailCapture.capture("user@example.com", "waitlist")
```

### SaaS Authentication
```python
# Send welcome email after signup
await email_service.send_welcome_email(user.email, user.name)
```

### AI App Notifications
```python
# Notify when AI processing is complete
await email_service.send_notification(
    user.email, 
    "Your AI analysis is ready!"
)
```

## 🔄 Migration Path

**Current State**: Email capture frontend-only (stored in Supabase)
**Target State**: Full email system with transactional + marketing

**Step 1**: Enable email capture API endpoints
**Step 2**: Add transactional email service  
**Step 3**: Connect to marketing provider
**Step 4**: Add email templates and campaigns

## 🛠️ Environment Variables Reference

```bash
# === BACKEND EMAIL CONFIG ===
# Choose ONE provider
RESEND_API_KEY=                    # Resend (recommended)
CONVERTKIT_API_KEY=               # ConvertKit
CONVERTKIT_API_SECRET=            
SENDGRID_API_KEY=                 # SendGrid

# === FRONTEND EMAIL CONFIG ===  
# Must match backend provider choice
NEXT_PUBLIC_RESEND_API_KEY=
NEXT_PUBLIC_RESEND_AUDIENCE_ID=
NEXT_PUBLIC_CONVERTKIT_API_KEY=
NEXT_PUBLIC_CONVERTKIT_API_SECRET=
NEXT_PUBLIC_CONVERTKIT_FORM_ID=
NEXT_PUBLIC_SENDGRID_API_KEY=
NEXT_PUBLIC_SENDGRID_LIST_IDS=

# === EMAIL SETTINGS ===
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME="Your App Name"
```

## 📋 Testing Checklist

- [ ] Email capture stores in database
- [ ] Provider API connection works  
- [ ] Welcome email sends correctly
- [ ] Email templates render properly
- [ ] Unsubscribe links work
- [ ] Rate limiting prevents spam
- [ ] GDPR compliance (if needed)

---

**💡 Pro Tip**: Start with just email capture (leads) → Add transactional emails → Add marketing automation. Build incrementally based on your needs.