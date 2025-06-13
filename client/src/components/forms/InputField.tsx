import React from 'react';
import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
}

export function InputField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  helperText,
  showPasswordToggle = false
}: InputFieldProps<T>) {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full",
                  fieldState.error && "border-red-500 focus:ring-red-500",
                  type === 'password' && showPasswordToggle && "pr-10"
                )}
              />
              {type === 'password' && showPasswordToggle && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-sm text-red-600" />
          {helperText && !fieldState.error && (
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export default InputField;