import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CheckboxFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  className
}: CheckboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                fieldState.error && "border-red-500"
              )}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
            <FormMessage className="text-sm text-red-600" />
          </div>
        </FormItem>
      )}
    />
  );
}

export default CheckboxField;