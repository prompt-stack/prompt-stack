import { HTMLAttributes, forwardRef } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning'
}

const alertVariants = {
  default: 'border-border bg-background text-foreground',
  destructive: 'border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/20',
  success: 'border-green-500/50 bg-green-500/10 text-green-600 dark:border-green-500 dark:bg-green-500/20',
  warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:border-yellow-500 dark:bg-yellow-500/20'
}

const iconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const Icon = iconMap[variant]
    
    return (
      <div
        ref={ref}
        className={`relative w-full rounded-lg border p-4 ${alertVariants[variant]} ${className}`}
        {...props}
      >
        <div className="flex gap-3">
          {Icon && <Icon className="h-5 w-5 mt-0.5" />}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={`mb-1 font-medium leading-none tracking-tight ${className}`}
        {...props}
      />
    )
  }
)
AlertTitle.displayName = 'AlertTitle'

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`text-sm [&_p]:leading-relaxed ${className}`}
        {...props}
      />
    )
  }
)
AlertDescription.displayName = 'AlertDescription'