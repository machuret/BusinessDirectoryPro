import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function FormButton({
  loading = false,
  loadingText = "Processing...",
  variant = "default",
  size = "default",
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: FormButtonProps) {
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        fullWidth && "w-full",
        className
      )}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading ? loadingText : children}
    </Button>
  );
}

export default FormButton;