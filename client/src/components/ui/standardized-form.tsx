import * as React from "react"
import { cn } from "@/lib/utils"
import { StandardizedButton } from "./standardized-button"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"

export interface StandardFormProps {
  onSubmit: (event: React.FormEvent) => void
  loading?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export interface StandardInputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
}

export interface StandardTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
}

// Standardized Form Container
export function StandardizedForm({ 
  onSubmit, 
  loading = false, 
  error, 
  children, 
  className 
}: StandardFormProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={cn("space-y-6", className)}
    >
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}
      {children}
    </form>
  )
}

// Standardized Form Field with Label and Error
export function StandardizedFormField({ 
  label, 
  error, 
  required, 
  helperText, 
  className,
  ...props 
}: StandardInputProps) {
  const id = React.useId()
  
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:text-destructive after:ml-1" : ""}>
          {label}
        </Label>
      )}
      <Input
        id={id}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

// Standardized Textarea Field
export function StandardizedTextareaField({ 
  label, 
  error, 
  required, 
  helperText, 
  className,
  ...props 
}: StandardTextareaProps) {
  const id = React.useId()
  
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:text-destructive after:ml-1" : ""}>
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

// Standardized Form Actions (Submit/Cancel buttons)
export interface StandardFormActionsProps {
  submitText?: string
  cancelText?: string
  loading?: boolean
  onCancel?: () => void
  submitVariant?: "default" | "destructive" | "featured"
  disabled?: boolean
}

export function StandardizedFormActions({
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  onCancel,
  submitVariant = "default",
  disabled = false
}: StandardFormActionsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
      {onCancel && (
        <StandardizedButton
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </StandardizedButton>
      )}
      <StandardizedButton
        type="submit"
        variant={submitVariant}
        loading={loading}
        disabled={disabled || loading}
      >
        {submitText}
      </StandardizedButton>
    </div>
  )
}

export default StandardizedForm;