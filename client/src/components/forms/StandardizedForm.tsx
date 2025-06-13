import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StandardizedFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
  cardWrapper?: boolean;
  disabled?: boolean;
}

export function StandardizedForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  title,
  description,
  loading = false,
  error,
  className,
  cardWrapper = false,
  disabled = false
}: StandardizedFormProps<T>) {
  const formContent = (
    <>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className={cn("space-y-6", className)}
        >
          <fieldset disabled={disabled || loading}>
            {children}
          </fieldset>
        </form>
      </Form>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </>
  );

  if (cardWrapper) {
    return (
      <Card className="relative">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {formContent}
    </div>
  );
}

export default StandardizedForm;