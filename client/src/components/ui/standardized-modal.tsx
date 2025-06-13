import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { StandardizedButton } from "./standardized-button"

const StandardizedModal = DialogPrimitive.Root

const StandardizedModalTrigger = DialogPrimitive.Trigger

const StandardizedModalPortal = DialogPrimitive.Portal

const StandardizedModalClose = DialogPrimitive.Close

const StandardizedModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
StandardizedModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const StandardizedModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <StandardizedModalPortal>
    <StandardizedModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </StandardizedModalPortal>
))
StandardizedModalContent.displayName = DialogPrimitive.Content.displayName

const StandardizedModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
StandardizedModalHeader.displayName = "StandardizedModalHeader"

const StandardizedModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
StandardizedModalFooter.displayName = "StandardizedModalFooter"

const StandardizedModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
StandardizedModalTitle.displayName = DialogPrimitive.Title.displayName

const StandardizedModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
StandardizedModalDescription.displayName = DialogPrimitive.Description.displayName

// Standardized Props Interface
export interface StandardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

// High-level Standardized Modal Component
export function StandardizedModalWrapper({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  footer,
  size = "md" 
}: StandardModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  }

  return (
    <StandardizedModal open={open} onOpenChange={onOpenChange}>
      <StandardizedModalContent className={cn("w-full", sizeClasses[size])}>
        <StandardizedModalHeader>
          <StandardizedModalTitle>{title}</StandardizedModalTitle>
          {description && (
            <StandardizedModalDescription>{description}</StandardizedModalDescription>
          )}
        </StandardizedModalHeader>
        {children}
        {footer && (
          <StandardizedModalFooter>{footer}</StandardizedModalFooter>
        )}
      </StandardizedModalContent>
    </StandardizedModal>
  )
}

export {
  StandardizedModal,
  StandardizedModalPortal,
  StandardizedModalOverlay,
  StandardizedModalClose,
  StandardizedModalTrigger,
  StandardizedModalContent,
  StandardizedModalHeader,
  StandardizedModalFooter,
  StandardizedModalTitle,
  StandardizedModalDescription,
}

export default StandardizedModalWrapper;