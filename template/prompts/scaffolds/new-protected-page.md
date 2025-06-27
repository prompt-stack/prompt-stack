# Scaffold: New Protected Page

## Prompt Template
```
You are my lead developer. Create a new authenticated page at /[PAGE_NAME] in the Prompt-Stack application.

Requirements:
1. Create file: frontend/app/(authenticated)/[PAGE_NAME]/page.tsx
2. Use existing auth patterns from dashboard/page.tsx
3. Include proper TypeScript interfaces
4. Follow the component structure pattern
5. Add navigation link if it's a main feature

Component should include:
- Page title and description
- Loading states
- Error handling
- Responsive design with Tailwind CSS
- Type-safe props and state

Follow these patterns:
- Use 'use client' directive if needed
- Import useAuth from '@/components/providers/auth-provider'
- Use consistent styling with existing pages
- Include proper meta tags

Return only the code for the new page file.
```

## Variables to Replace
- `[PAGE_NAME]`: The name of the new page (e.g., "reports", "analytics", "settings")

## Example Usage
"Create a new authenticated page at /reports..."

## Files That Will Be Created
- `frontend/app/(authenticated)/[PAGE_NAME]/page.tsx`

## Optional Additions
- Add navigation link in `components/layout/navigation.tsx`
- Add route to API if backend logic needed
- Add page to sitemap or navigation menus

## Testing
After implementation:
1. Restart frontend container
2. Navigate to /[PAGE_NAME] 
3. Verify authentication required
4. Check responsive design
5. Test loading and error states