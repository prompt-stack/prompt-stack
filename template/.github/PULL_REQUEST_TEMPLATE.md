# Pull Request

## 📝 Description

**What does this PR do?**
Brief description of the changes in this pull request.

**Related Issue:**
Fixes #(issue number) or addresses feature request #(number)

## 🧪 Testing

**Testing checklist:**
- [ ] Tested in demo mode (no API keys required)
- [ ] Tested in production mode (with real API keys)
- [ ] Ran `./scripts/test-api-simple.sh` successfully
- [ ] Ran `./scripts/diagnose.sh` - no issues
- [ ] Docker setup works cleanly (`docker-compose down && docker-compose up -d`)
- [ ] Authentication flows work (including the critical log out/log in after env changes)

**Manual testing performed:**
- [ ] Frontend changes tested in browser
- [ ] Backend changes tested via API
- [ ] Database migrations work (if applicable)
- [ ] New features work as expected

## 📚 Documentation

- [ ] Updated relevant documentation in `/docs`
- [ ] Added/updated code comments where needed
- [ ] Updated `CHANGELOG.md` with changes
- [ ] Added examples or usage instructions (if applicable)

## 🔧 Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Code style/formatting changes
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security enhancement

## 🚨 Breaking Changes

**If this PR includes breaking changes, describe them here:**
- What will break?
- How should users migrate?
- Any environment variable changes?

## 🔍 Code Quality

- [ ] Code follows the existing style and patterns
- [ ] Used TypeScript interfaces where appropriate
- [ ] Followed patterns from `AI_GUIDE.md`
- [ ] Added proper error handling
- [ ] No secrets or API keys committed
- [ ] Used existing UI components where possible

## 🛡️ Security

- [ ] No sensitive information exposed
- [ ] Input validation added for new endpoints
- [ ] Authentication/authorization properly implemented
- [ ] Database queries use RLS policies (if applicable)
- [ ] CORS settings reviewed (if applicable)

## 📋 Additional Notes

**Anything else reviewers should know:**
- Dependencies added/removed
- Configuration changes required
- Special deployment considerations
- Performance implications

**Screenshots (if applicable):**
<!-- Add screenshots of UI changes -->

**Related PRs or Issues:**
<!-- Link to any related work -->

---

## 🤖 AI-Native Development

This PR was developed using:
- [ ] AI assistance for code generation
- [ ] AI assistance for code review
- [ ] AI assistance for documentation
- [ ] Human-only development

**AI tools used:** (Claude, GPT-4, Copilot, etc.)

---

**By submitting this PR, I confirm:**
- [ ] I have the right to submit this code under the project's MIT license
- [ ] I have tested these changes thoroughly
- [ ] I understand this will be reviewed by maintainers and the community