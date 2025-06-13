import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  helperText,
  rows = 4,
  maxLength,
  showCharCount = false
}: TextareaFieldProps<T>) {
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
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              className={cn(
                "w-full resize-none",
                fieldState.error && "border-red-500 focus:ring-red-500"
              )}
            />
          </FormControl>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <FormMessage className="text-sm text-red-600" />
              {helperText && !fieldState.error && (
                <p className="text-xs text-gray-500 mt-1">{helperText}</p>
              )}
            </div>
            {showCharCount && maxLength && (
              <p className="text-xs text-gray-400 ml-2">
                {field.value?.length || 0}/{maxLength}
              </p>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}

export default TextareaField;