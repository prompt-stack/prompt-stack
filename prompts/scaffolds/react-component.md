# Scaffold: React Component

## Prompt Template
```
You are my lead developer. Create a new React component called [COMPONENT_NAME] for the Prompt-Stack frontend.

Requirements:
1. Create file: frontend/components/[CATEGORY]/[COMPONENT_NAME].tsx
2. Follow existing component patterns in the project
3. Include proper TypeScript interfaces
4. Use Tailwind CSS for styling
5. Make it reusable and well-documented

Component should include:
- TypeScript interface for props
- Default props where appropriate
- Proper error handling
- Loading states if needed
- Responsive design
- Accessibility attributes
- JSDoc comments explaining usage

Follow these patterns:
- Use PascalCase for component names
- Export interface and component separately
- Use consistent styling with existing components
- Include proper prop validation
- Add 'use client' directive if it uses hooks
- Import types from existing type definitions

Categories to choose from:
- ui/ (reusable UI components)
- forms/ (form-related components) 
- layout/ (layout and navigation)
- auth/ (authentication related)
- providers/ (context providers)

Return the component code with proper imports and exports.
```

## Variables to Replace
- `[COMPONENT_NAME]`: The name of the component (e.g., "UserCard", "ApiKeyInput")
- `[CATEGORY]`: The category folder (ui, forms, layout, auth, providers)

## Example Usage
"Create a new React component called UserCard for displaying user information..."

## Files That Will Be Created
- `frontend/components/[CATEGORY]/[COMPONENT_NAME].tsx`

## Common Patterns

### Basic UI Component
```typescript
'use client'

import React from 'react'

interface UserCardProps {
  user: {
    id: string
    email: string
    role: string
  }
  onClick?: () => void
  className?: string
}

/**
 * UserCard - Displays user information in a card format
 * @param user - User object with id, email, and role
 * @param onClick - Optional click handler
 * @param className - Additional CSS classes
 */
export function UserCard({ user, onClick, className = '' }: UserCardProps) {
  return (
    <div 
      className={`bg-card rounded-lg p-4 shadow hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <h3 className="font-medium text-foreground">{user.email}</h3>
      <p className="text-sm text-muted-foreground">{user.role}</p>
    </div>
  )
}

export type { UserCardProps }
```

## Best Practices
- Always export the props interface
- Use semantic HTML elements
- Include ARIA attributes for accessibility
- Handle loading and error states
- Make components responsive
- Use consistent naming conventions
- Add JSDoc comments for complex props

## Testing
After creating component:
1. Import and use in a page
2. Test with different prop combinations
3. Verify responsive design
4. Check accessibility with screen reader
5. Test keyboard navigation
6. Verify TypeScript types work correctly