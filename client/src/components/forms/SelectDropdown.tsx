import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectDropdownProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

export function SelectDropdown<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select an option",
  options,
  required = false,
  disabled = false,
  className,
  helperText
}: SelectDropdownProps<T>) {
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
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldState.error && "border-red-500 focus:ring-red-500"
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-sm text-red-600" />
          {helperText && !fieldState.error && (
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export default SelectDropdown;