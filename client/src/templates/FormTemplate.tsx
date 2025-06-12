import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading/LoadingState";

// Standard form props interface
interface FormTemplateProps {
  title?: string;
  description?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  variant?: "card" | "inline";
}

// Standard form layout component
export function FormTemplate({
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  className = "",
  variant = "card"
}: FormTemplateProps) {
  const formContent = (
    <>
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingState variant="inline" message="Submitting..." />
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </>
  );

  if (variant === "card") {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {children}
            
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {cancelText}
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoadingState variant="inline" message="Submitting..." />
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return <div className={className}>{formContent}</div>;
}

// Form field wrapper template
interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
}

export function FormField({ 
  label, 
  children, 
  error, 
  required = false, 
  description 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export default FormTemplate;